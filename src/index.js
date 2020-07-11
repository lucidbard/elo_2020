
import "./style.css"

import * as ZapparThree from "@zappar/zappar-threejs"
const createGeometry = require('three-bmfont-text');
const loadFont = require('load-bmfont');
import atlas from './font/atlas.png';
import * as THREE from "three"
import nfont from "./font/HelveticaNeue.fnt";
console.log(nfont)
loadFont(nfont, (err, font) => {
  console.log("Font loaded!")
  console.log(err)
  // Create a geometry of packed bitmap glyphs
  console.log(font);
  const geometry = createGeometry({
    font,
    text: 'OCEAN'
  });  
  // Load texture containing font glyphs
  const loader = new THREE.TextureLoader();
  console.log(loader, geometry);
  loader.load(atlas, (texture) => {
    console.log("Atlas loaded!")
    // Start and animate renderer
    init(geometry, texture);
    // render();
  });
});

const MSDFShader = require('three-bmfont-text/shaders/msdf');

// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded
let manager = new ZapparThree.LoadingManager()

// Setup ThreeJS in the usual way
let renderer = new THREE.WebGLRenderer()
document.body.appendChild(renderer.domElement)

renderer.setSize(window.innerWidth, window.innerHeight)
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Setup a Zappar camera instead of one of ThreeJS's cameras
let camera = new ZapparThree.Camera()
camera.posMode = ZapparThree.CameraPoseMode.AnchorOrigin

// The Zappar library needs your WebGL context, so pass it
ZapparThree.glContextSet(renderer.getContext())

// Create a ThreeJS Scene and set its background to be the camera background texture
let scene = new THREE.Scene()
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
let trackerGroup = new ZapparThree.ImageAnchorGroup(camera, tracker)
scene.add(trackerGroup)

// Add some content
var radius = 2.25
var cx = 0
var cy = -2.15
// let box = new THREE.Mesh(
//   new THREE.BoxBufferGeometry(),
//   new THREE.MeshBasicMaterial()
// )
// box.position.set(0, cy, -0.5)
// trackerGroup.add(box)

let particleCount = 300
var particleGeom = new THREE.Geometry()
let vectors = []
for (var i = 0; i < particleCount; i++) {
  let a = (i / particleCount) * Math.PI * 2

  let cosX = Math.cos(a)
  let sinY = Math.sin(a)
  vectors.push([cosX, sinY, a])
  let posZ = Math.random()
  let newX = cx + (radius + posZ) * cosX
  let newY = cy + (radius + posZ) * sinY
  let particle = new THREE.Vector3(newX, newY, posZ)
  particleGeom.vertices.push(particle)
}
var texture = new THREE.TextureLoader().load(
  require("file-loader!./images/particle.png").default
)
// create the particle variables
var particleMaterial = new THREE.ParticleBasicMaterial({
  color: 0xffffff,
  size: 0.5,
  map: texture,
  blending: THREE.AdditiveBlending,
  transparent: true,
})
let particleSys = new THREE.Points(particleGeom, particleMaterial)
particleSys.name = "particleSys"
particleSys.sortParticles = true
trackerGroup.add(particleSys)

function init(geometry, texture) {
  // Create material with msdf shader from three-bmfont-text
  const material = new THREE.RawShaderMaterial(MSDFShader({
    map: texture,
    color: 0x000000, // We'll remove it later when defining the fragment shader
    side: THREE.DoubleSide,
    transparent: true,
    negate: false,
  }));
  console.log(material);
  // Create mesh of text       
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-80, 0, 0); // Move according to text size
  mesh.rotation.set(Math.PI, 0, 0); // Spin to face correctly
  // mesh.scale.set(.1, .1, .1); // Spin to face correctly
  trackerGroup.add(mesh);
  console.log("Added");
}

tracker.onNewAnchor.bind((anchor) => {
  console.log("New anchor has appeared:", anchor.id)

  // You may like to create a new ImageAnchorGroup here for this anchor, and add it to your scene
})
particleSys.visible = false
tracker.onVisible.bind((anchor) => {
  console.log("Anchor is visible:", anchor.id)
  particleSys.visible = true
})

tracker.onNotVisible.bind((anchor) => {
  console.log("Anchor is not visible:", anchor.id)
  particleSys.visible = false
})

// Set up our render loop
function render() {
  requestAnimationFrame(render)
  camera.updateFrame(renderer)

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
  //   particleSystem.geometry.__dirtyVertices = true

  // set up the next call
  //   requestAnimFrame(update)
  renderer.render(scene, camera)
}

requestAnimationFrame(render)
