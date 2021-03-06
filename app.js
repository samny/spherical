import {
  AmbientLight,
  BackSide,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TextureLoader,
  WebGLRenderer
} from 'three'

import OrbitControls from './OrbitControls.js'

function getViewportSize () {
  const orientation = window.orientation // typeof window.orientation === 'undefined' ? 0 : window.orientation
  let w = document.body.clientWidth
  let h = document.body.clientHeight
  if (orientation === 0 && w > h || Math.abs(orientation) === 90 && w < h) {
    w = document.body.clientHeight
    h = document.body.clientWidth
  }

  console.log(`createViewer - width: ${w}px, height: ${h}px. Orientation: ${window.orientation}. (${window.innerWidth}x${window.innerHeight})`)
  return {width: w, height: h}
}

function createViewer () {
  let {width, height} = getViewportSize()

  const scene = new Scene()
  const camera = new PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 0, -1)
  const sphere = new Mesh(
    new SphereGeometry(1, 32, 32),
    new MeshPhongMaterial({side: BackSide, color: 0x333333})
  )

  sphere.scale.x = -1
  scene.add(sphere)

  const light = new AmbientLight(0x32281F)
  scene.add(light)
  const directionalLight = new DirectionalLight(0xffffff, 0.5)
  scene.add(directionalLight)

  const controls = new OrbitControls(camera, document)
  controls.enablePan = false
  controls.enableZoom = true
  controls.enableKeys = true
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.5
  controls.maxDistance = 2
  controls.minDistance = 0.1
  controls.rotateSpeed = -0.7

  const renderer = new WebGLRenderer()
  renderer.setSize(width, height)

  const handleResize = () => {
    let {width, height} = getViewportSize()
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  const render = () => {
    controls.update()
    requestAnimationFrame(render)
    renderer.render(scene, camera)
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleResize)

  render()

  return {
    domElement: renderer.domElement,
    setImage (url) {
      sphere.material = new MeshBasicMaterial({
        map: new TextureLoader().load(url),
        side: BackSide,
      })
    }
  }
}

function createFileSelect () {
  const el = document.createElement('label')
  el.classList.add('fileinput')
  // el.innerText = 'Drop an image anywhere'
  const input = document.createElement('input')
  input.id = 'file'
  input.name = 'file'
  input.setAttribute('type', 'file')
  el.appendChild(input)

  const handleFileReader = (event) => {
    el.dispatchEvent(new CustomEvent('fileselect:loaded', {detail: event.target.result}))
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const file = event.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = handleFileReader
      reader.readAsDataURL(file)
    }
  }

  let mouseDown = false
  let dragging = false

  el.addEventListener('dragover', (event) => event.preventDefault())
  el.addEventListener('drop', handleDrop)
  el.addEventListener('click', (event) => {
    if (dragging) {
      event.preventDefault()
    }
  })

  input.addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = handleFileReader
      reader.readAsDataURL(file)
    }
  })

  window.addEventListener('mousedown', () => {
    mouseDown = true
  })
  window.addEventListener('mousemove', () => {
    if (mouseDown) {
      dragging = true
    }
  })
  window.addEventListener('mouseup', (event) => {
    mouseDown = false
    if (dragging) {
      event.preventDefault()
    }
    setTimeout(() => {dragging = false}, 0)
  })

  return {
    domElement: el
  }
}

export function init () {
  const appRoot = document.getElementById('appRoot')
  const viewer = createViewer()
  appRoot.appendChild(viewer.domElement)
  const fileSelect = createFileSelect()
  appRoot.appendChild(fileSelect.domElement)
  fileSelect.domElement.addEventListener('fileselect:loaded', (event) => {
    viewer.setImage(event.detail)
  })
}