require('src/body.html')
require('src/css/main.scss')

window.THREE = require('three/build/three.min.js')
require('three/examples/js/renderers/Projector.js')
require('three/examples/js/renderers/CanvasRenderer.js')

var Preloader = require('preloader.js')

var images = [
    'img/pano1-s.jpg',
    'img/pano2-s.jpg',
    'img/pano3-s.jpg',
    'img/pano4-s.jpg',
]

require('../img/pano1-s.jpg')
require('../img/pano2-s.jpg')
require('../img/pano3-s.jpg')
require('../img/pano4-s.jpg')

var camera, scene, renderer
var texture_placeholder,
    isUserInteracting = false,
    onMouseDownMouseX = 0,
    onMouseDownMouseY = 0,
    lon = 90,
    onMouseDownLon = 0,
    lat = 0,
    onMouseDownLat = 0,
    phi = 0,
    theta = 0,
    target = new THREE.Vector3()

/**
 * init
 */
function init() {
    console.log('init ok')
    var container, mesh
    container = document.getElementById('container')
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1100)

    scene = new THREE.Scene()
    texture_placeholder = document.createElement('canvas')
    texture_placeholder.width = 128
    texture_placeholder.height = 128
    var context = texture_placeholder.getContext('2d')
    context.fillStyle = 'rgb( 200, 200, 200 )'
    context.fillRect(0, 0, texture_placeholder.width, texture_placeholder.height)
    var materials = [
        loadTexture('img/pano3-s.jpg'), // right
        loadTexture('img/pano2-s.jpg'), // left
        new THREE.MeshBasicMaterial( {color: 0x90C0C0} ), // top
        new THREE.MeshBasicMaterial( {color: 0x9F5D3B} ), // bottom
        loadTexture('img/pano4-s.jpg'), // back
        loadTexture('img/pano1-s.jpg') // front
    ]
    mesh = new THREE.Mesh(new THREE.BoxGeometry(300, 300, 300, 7, 7, 7), new THREE.MultiMaterial(materials))
    mesh.scale.x = -1
    scene.add(mesh)

	if ( webglAvailable() ) {
		renderer = new THREE.WebGLRenderer();
	} else {
		renderer = new THREE.CanvasRenderer();
	}

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    document.addEventListener('mousedown', onDocumentMouseDown, false)
    document.addEventListener('mousemove', onDocumentMouseMove, false)
    document.addEventListener('mouseup', onDocumentMouseUp, false)
    document.addEventListener('wheel', onDocumentMouseWheel, false)
    document.addEventListener('touchstart', onDocumentTouchStart, false)
    document.addEventListener('touchmove', onDocumentTouchMove, false)
    //
    window.addEventListener('resize', onWindowResize, false)
}

function webglAvailable() {
    try {
        var canvas = document.createElement( 'canvas' );
        return !!( window.WebGLRenderingContext && (
            canvas.getContext( 'webgl' ) ||
            canvas.getContext( 'experimental-webgl' ) )
        );
    } catch ( e ) {
        return false;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function loadTexture(path) {
    var texture = new THREE.Texture(texture_placeholder)
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        overdraw: 0.5
    })
    var image = new Image()
    image.onload = function () {
        texture.image = this
        texture.needsUpdate = true
    }
    image.src = path
    return material
}

function onDocumentMouseDown(event) {
    event.preventDefault()
    isUserInteracting = true
    onPointerDownPointerX = event.clientX
    onPointerDownPointerY = event.clientY
    onPointerDownLon = lon
    onPointerDownLat = lat
}

function onDocumentMouseMove(event) {
    if (isUserInteracting === true) {
        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat
    }
}

function onDocumentMouseUp(event) {
    isUserInteracting = false
}

function onDocumentMouseWheel(event) {
    camera.fov += event.deltaY * 0.05
    camera.updateProjectionMatrix()
}

function onDocumentTouchStart(event) {
    if (event.touches.length == 1) {
        event.preventDefault()
        onPointerDownPointerX = event.touches[0].pageX
        onPointerDownPointerY = event.touches[0].pageY
        onPointerDownLon = lon
        onPointerDownLat = lat
    }
}

function onDocumentTouchMove(event) {
    if (event.touches.length == 1) {
        event.preventDefault()
        lon = (onPointerDownPointerX - event.touches[0].pageX) * 0.2 + onPointerDownLon
        lat = (event.touches[0].pageY - onPointerDownPointerY) * 0.2 + onPointerDownLat
    }
}

function animate() {
    requestAnimationFrame(animate)
    update()
}

function update() {
    if (isUserInteracting === false) {
        lon += 0.1
    }
    lat = Math.max(-85, Math.min(85, lat))
    phi = THREE.Math.degToRad(90 - lat)
    theta = THREE.Math.degToRad(lon)
    target.x = 500 * Math.sin(phi) * Math.cos(theta)
    target.y = 700 * Math.cos(phi)
    target.z = 500 * Math.sin(phi) * Math.sin(theta)
    camera.lookAt(target)
    renderer.render(scene, camera)
}

/**
 * preloader && start
 */
var preloader = new Preloader({
    resources: images,
    perMinTime: 1000 // 加载每个资源所需的最小时间，一般用来测试 loading
})
preloader.addProgressListener(function (loaded, length) {
    console.log('loaded', loaded, length, loaded / length)
})
preloader.addCompletionListener(function () {
    $('#o2_loading').remove()
    $('#o2_main').removeClass('hide')

    init()
    animate()
})
preloader.start()