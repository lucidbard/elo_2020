import "./style.css"
import * as ZapparThree from "@zappar/zappar-threejs"
const createGeometry = require("three-bmfont-text")
const loadFont = require("load-bmfont")
import atlas from "./font/Helvetica/HelveticaNeue.png"
import atlas2 from "./font/Helvetica/HelveticaNeue.png"

import * as THREE from "three"
import nfont from "./font/Helvetica/HelveticaNeue.fnt"
import nfont2 from "./font/Helvetica/HelveticaNeue.fnt"
import { RGBA_ASTC_10x5_Format } from "three"
console.log(nfont)

let TRACKING = true
// let TRACKING = true .
const MSDFShader = require("three-bmfont-text/shaders/msdf")

// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded
let manager = new ZapparThree.LoadingManager()
// Test

// Setup ThreeJS in the usual way
let renderer = new THREE.WebGLRenderer()
document.body.appendChild(renderer.domElement)

renderer.setSize(window.innerWidth, window.innerHeight)
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// let mesh = new THREE.Mesh(geometry, material)
// mesh.name = "Words"
// mesh.geometry.computeBoundingSphere()
// let rad = -mesh.geometry.boundingSphere.radius * 0.01
// console.log(rad)
// mesh.position.set(rad, 0, 0) // Move according to text size
// mesh.rotation.set(Math.PI, 0, 0) // Spin to face correctly
// mesh.scale.set(0.01, 0.01, 0.01) // Spin to face correctly
// create the particle variables

// particleSys.visible = !TRACKING

// console.log(particleSys)
let words = []
let pivot
function init(geometry, texture, geometry2, texture2) {
  // Create material with msdf shader from three-bmfont-text

  var ptexture = new THREE.TextureLoader().load(
    require("./images/particle.png").default
  )
  var particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    map: ptexture,
    // MSDFShader({
    //   color: 0xffffff, // We'll remove it later when defining the fragment shader
    //   side: THREE.DoubleSide,
    //   transparent: false,
    //   negate: false,
    blending: THREE.AdditiveBlending,
    opacity: 0,
    depthWrite: false,
    transparent: true,
  })

  // Add some content
  // let box = new THREE.Mesh(
  //   new THREE.BoxBufferGeometry(),
  //   new THREE.MeshBasicMaterial()
  // )
  // box.position.set(0, cy, -0.5)
  // trackerGroup.add(box)

  var radius = 2.25
  // var radius = 1.25
  var cx = 0
  var cy = -2.15
  let particleCount = 30
  var particleGeom = new THREE.Geometry()
  let vectors = []
  pivot = new THREE.Group()
  pivot.position.set(0, 0, 0) // Move according to text size
  pivot.name = "pivot"

  const materials = [
    new THREE.RawShaderMaterial(
      MSDFShader({
        map: texture,
        color: 0x000000, // We'll remove it later when defining the fragment shader
        side: THREE.DoubleSide,
        opacity: 1,
        transparent: true,
        negate: false,
      })
    ),
    new THREE.RawShaderMaterial(
      MSDFShader({
        map: texture2,
        color: 0x000000, // We'll remove it later when defining the fragment shader
        side: THREE.DoubleSide,
        opacity: 1,
        transparent: true,
        negate: false,
      })
    ),
  ]

  // mesh = new THREE.Mesh(geometry[i % 2], material.clone())
  mesh.name = "Words" + i.toString()
  mesh.geometry.computeBoundingBox()
  let xlen =
    0.01 *
    (mesh.geometry.boundingBox.max.x - mesh.geometry.boundingBox.min.x) *
    0.5
  let ylen =
    0.01 *
    (mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y) *
    0.5
  for (i = 1; i <= particleCount; i++) {
    let a = (i / particleCount) * Math.PI * 2
    let cosX = Math.cos(a)
    let sinY = Math.sin(a)

    vectors.push([cosX, sinY, a])
    let i = 0
    let posZ = Math.random()
    let newX = cx + (radius + posZ) * cosX
    let newY = cy + (radius + posZ) * sinY
    let mesh
    if (i % 2 == 0) {
      mesh = new THREE.Mesh(geometry, materials[0])
    } else {
      mesh = new THREE.Mesh(geometry2, materials[1])
    }
    let particle = new THREE.Vector3(newX, newY, posZ)
    particleGeom.vertices.push(particle)
    mesh.rotation.set(Math.PI, 0, 0) // Spin to face correctly
    let wpivot = new THREE.Object3D()
    mesh.position.set(-xlen, -ylen, 0) // Move according to text size
    mesh.scale.set(0.01, 0.01, 0.01) // Spin to face correctly
    wpivot.name = "pivot"
    wpivot.position.set(newX, newY, posZ) // Move according to text size
    wpivot.scale.set(1, 1, 1) // Move according to text size
    wpivot.add(mesh)
    words.push(wpivot)
    // console.log(material)
    // Create mesh of text

    pivot.add(wpivot)
  }

  let particleSys = new THREE.Points(particleGeom, particleMaterial)

  particleSys.name = "particleSys"
  particleSys.sortParticles = true
  particleSys.position.set(0, 0, 0)
  let trackerGroup, camera
  let scene = new THREE.Scene()
  if (TRACKING) {
    camera = new ZapparThree.Camera()
    camera.posMode = ZapparThree.CameraPoseMode.AnchorOrigin

    // Setup a Zappar camera instead of one of ThreeJS's camer
    // The Zappar library needs your WebGL context, so pass it
    ZapparThree.glContextSet(renderer.getContext())

    // Create a ThreeJS Scene and set its background to be the camera background texture
    scene.background = camera.backgroundTexture

    // Request the necessary permission from the user
    ZapparThree.permissionRequestUI().then(function (granted) {
      if (granted) camera.start()
      else ZapparThree.permissionDeniedUI()
    })

    // Set up our image tracker group
    // Pass our loading manager in to ensure the progress bar works correctly

    let tracker = new ZapparThree.ImageTrackerLoader(manager).load(
      require("file-loader!./tophoop2title.zpt").default
    )
    trackerGroup = new ZapparThree.ImageAnchorGroup(camera, tracker)
    tracker.onNewAnchor.bind((anchor) => {
      console.log("New anchor has appeared:", anchor.id)
      // You may like to create a new ImageAnchorGroup here for this anchor, and add it to your scene
    })
    tracker.onVisible.bind((anchor) => {
      console.log("Anchor is visible:", anchor.id)
      pivot.visible = true
      // particleSys.visible = true
    })

    tracker.onNotVisible.bind((anchor) => {
      console.log("Anchor is not visible:", anchor.id)
      pivot.visible = false
      particleSys.visible = false
    })
  } else {
    console.log("NOT TRACKING")
    // camera = new ZapparThree.Camera()
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 10
    trackerGroup = new THREE.Group()
    // var geometry2 = new THREE.BoxGeometry()
    // var material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    // var cube = new THREE.Mesh(geometry2, material2)
    // trackerGroup.add(cube)
    trackerGroup.rotation.set(0, 0, 0)
    // particleSys.rotation.set(180, 0, 10)
    particleSys.visible = true
    // var helper = new THREE.BoxHelper(particleSys, 0xff0000)
    // helper.update()
    // If you want a visible bounding box
    // scene.add(helper)
    // If you just want the numbers
  }
  // console.log(trackerGroup)

  trackerGroup.add(particleSys)
  trackerGroup.add(pivot)
  scene.add(trackerGroup)
  // console.log("Added")

  // Set up our render loop
  function render() {
    // console.log("Rendering.")
    if (TRACKING && camera != null) {
      camera.updateFrame(renderer)
    }
    // helper.update()
    let particleSys = trackerGroup.getObjectByName("particleSys")

    for (var i = 0; i < particleSys.geometry.vertices.length; i++) {
      let particle = particleSys.geometry.vertices[i]
      let ht = particle.z
      if (ht > 1) {
        ht = 0
      } else {
        ht += 0.01
      }
      let newX = cx + (radius + ht) * vectors[i][0]
      let newY = cy + (radius + ht) * vectors[i][1]
      particle.x = newX
      particle.y = newY
      particle.z = ht
      words[i].position.x = particle.x
      words[i].position.y = particle.y
      words[i].position.z = particle.z
      // console.log(1 - ht / 1.0)
      words[i].scale.x = 1 - ht / 1.0
      words[i].scale.y = 1 - ht / 1.0
      words[i].scale.z = 1 - ht / 1.0
    }
    particleSys.geometry.verticesNeedUpdate = true

    //   var pCount = particleCount
    //   while (pCount--) {
    //     // get the particle
    //     var particle = particles.vertices[pCount]

    //     // check if we need to reset
    //     if (particle.position.y < -200) {
    //       particle.position.y = 200
    //       particle.velocity.y = 0
    //     }

    //     // update the velocity with
    //     // a splat of randomniz
    //     particle.velocity.y -= Math.random() * 0.1

    //     // and the position
    //     particle.position.addSelf(particle.velocity)
    //   }

    //   // flag to the particle system
    //   // that we've changed its vertices.
    particleSys.geometry.__dirtyVertices = true

    // set up the next call
    // requestAnimFrame(update)
    // let name = trackerGroup.getObjectByName("Words")
    // if (pivot != null) {
    //   // mesh.rotation.x += 0.01;
    //   // pivot.rotation.y += 0.01
    // } else {
    //   console.log("Updated")
    // }
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}
loadFont(nfont, (err, font) => {
  console.log("Font loaded!")
  // console.log(err)
  // Create a geometry of packed bitmap glyphs
  // let geometry = []
  loadFont(nfont2, (err2, font2) => {
    const loader = new THREE.TextureLoader()
    loader.load(atlas, (texture) => {
      const loader2 = new THREE.TextureLoader()
      loader2.load(atlas2, (texture2) => {
        // Start and animate renderer
        init(
          createGeometry({
            font: font2,
            text: "PANDEMIC",
          }),
          texture,
          createGeometry({
            font,
            text: "COVID19",
          }),
          texture2
        )
      })
      // render()
    })
  })
})
