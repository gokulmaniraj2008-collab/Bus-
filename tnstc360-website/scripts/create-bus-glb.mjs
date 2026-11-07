import fs from 'node:fs'
import path from 'node:path'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

// GLTFExporter is browser-first and expects FileReader when it packs a binary GLB.
// Node 22 provides Blob/ArrayBuffer but not FileReader, so bridge only the method
// the exporter calls rather than pulling a browser emulation package into the app.
if (!globalThis.FileReader) {
  globalThis.FileReader = class FileReader {
    result = null
    onloadend = null
    onerror = null

    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer
        this.onloadend?.({ target: this })
      }).catch((error) => this.onerror?.(error))
    }
  }
}

const outFile = path.resolve('public/assets/tnstc-bus.glb')
const root = new THREE.Group()
root.name = 'TNSTC_Full_Size_Government_Bus'

const palette = {
  cream: 0xf2ead8,
  ivory: 0xfff8e9,
  orange: 0xe46d2d,
  saffron: 0xf1a33c,
  deepRed: 0x8f2e25,
  teal: 0x2d9d98,
  ink: 0x071820,
  graphite: 0x15252b,
  rubber: 0x0b1012,
  glass: 0x102a35,
  glassHighlight: 0x244c55,
  chrome: 0x93a5a1,
  lamp: 0xffd36d,
  tail: 0xe83c2b,
}

const materials = {
  cream: new THREE.MeshStandardMaterial({ color: palette.cream, roughness: 0.58, metalness: 0.04 }),
  ivory: new THREE.MeshStandardMaterial({ color: palette.ivory, roughness: 0.5, metalness: 0.02 }),
  orange: new THREE.MeshStandardMaterial({ color: palette.orange, roughness: 0.46, metalness: 0.1 }),
  saffron: new THREE.MeshStandardMaterial({ color: palette.saffron, roughness: 0.4, metalness: 0.12 }),
  deepRed: new THREE.MeshStandardMaterial({ color: palette.deepRed, roughness: 0.48, metalness: 0.08 }),
  teal: new THREE.MeshStandardMaterial({ color: palette.teal, roughness: 0.3, metalness: 0.22 }),
  ink: new THREE.MeshStandardMaterial({ color: palette.ink, roughness: 0.28, metalness: 0.36 }),
  graphite: new THREE.MeshStandardMaterial({ color: palette.graphite, roughness: 0.32, metalness: 0.3 }),
  rubber: new THREE.MeshStandardMaterial({ color: palette.rubber, roughness: 0.92, metalness: 0.01 }),
  glass: new THREE.MeshPhysicalMaterial({ color: palette.glass, roughness: 0.08, metalness: 0.24, transmission: 0.22, transparent: true, opacity: 0.88, clearcoat: 0.65, clearcoatRoughness: 0.08 }),
  glassHighlight: new THREE.MeshStandardMaterial({ color: palette.glassHighlight, roughness: 0.18, metalness: 0.35 }),
  chrome: new THREE.MeshStandardMaterial({ color: palette.chrome, roughness: 0.2, metalness: 0.9 }),
  lamp: new THREE.MeshStandardMaterial({ color: palette.lamp, emissive: 0xe98f2d, emissiveIntensity: 2.8, roughness: 0.2, metalness: 0.1 }),
  tail: new THREE.MeshStandardMaterial({ color: palette.tail, emissive: 0xa51010, emissiveIntensity: 1.5, roughness: 0.25, metalness: 0.05 }),
}

function addBox(name, size, position, material, radius = 0, segments = 3) {
  const geometry = radius > 0
    ? new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius)
    : new THREE.BoxGeometry(...size)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  root.add(mesh)
  return mesh
}

function addCylinder(name, radius, length, position, material, rotation = [Math.PI / 2, 0, 0], segments = 32) {
  const geometry = new THREE.CylinderGeometry(radius, radius, length, segments)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = true
  mesh.receiveShadow = true
  root.add(mesh)
  return mesh
}

// Monocoque and lower body.
addBox('Chassis', [9.2, 0.45, 2.55], [0, 1.18, 0], materials.graphite, 0.1)
addBox('Lower_Body', [9.05, 1.45, 2.42], [0, 2.08, 0], materials.cream, 0.14)
addBox('Upper_Body', [8.9, 1.62, 2.35], [-0.02, 3.55, 0], materials.ivory, 0.17)
addBox('Roof_Cap', [8.64, 0.18, 2.18], [-0.12, 4.46, 0], materials.orange, 0.08)
addBox('Saffron_Beltline', [8.98, 0.18, 2.47], [0.02, 2.82, 0], materials.orange, 0.04)
addBox('Teal_Beltline', [8.92, 0.08, 2.49], [0.02, 2.62, 0], materials.teal, 0.02)
addBox('Front_Bumper', [0.28, 0.34, 2.5], [4.62, 1.55, 0], materials.deepRed, 0.08)
addBox('Rear_Bumper', [0.28, 0.34, 2.5], [-4.62, 1.55, 0], materials.ink, 0.08)
addBox('Front_Lower_Grille', [0.12, 0.42, 1.32], [4.66, 2.18, 0], materials.ink, 0.02)
for (const z of [-0.5, -0.25, 0, 0.25, 0.5]) addBox(`Grille_Slat_${z}`, [0.08, 0.045, 1.2], [4.73, 2.18, z], materials.chrome, 0.01)

// Front glazing, destination board, lamp signature and wipers.
for (const z of [-0.58, 0.58]) addBox('Front_Windshield', [0.075, 1.02, 0.98], [4.51, 3.78, z], materials.glass, 0.045)
addBox('Destination_Board', [0.1, 0.36, 1.7], [4.56, 4.36, 0], materials.saffron, 0.04)
addBox('Destination_Board_Glass', [0.025, 0.24, 1.5], [4.625, 4.37, 0], materials.ink, 0.02)
for (const z of [-0.83, 0.83]) {
  addBox('Headlamp_Housing', [0.12, 0.3, 0.42], [4.64, 2.27, z], materials.ink, 0.06)
  addBox('Headlamp', [0.14, 0.16, 0.25], [4.72, 2.3, z], materials.lamp, 0.04)
  addBox('Indicator', [0.14, 0.12, 0.25], [4.71, 2.72, z], materials.tail, 0.03)
  addBox('Wiper_Arm', [0.05, 0.68, 0.07], [4.66, 3.32, z * 0.62], materials.chrome, 0.01)
}
addBox('Front_Center_Trim', [0.06, 0.85, 0.08], [4.67, 3.78, 0], materials.chrome, 0.02)

// Passenger windows and framed pillars on both sides.
const sideWindows = [-3.55, -2.25, -0.95, 0.35, 1.65, 2.82]
for (const x of sideWindows) {
  for (const z of [-1.205, 1.205]) {
    addBox(`Passenger_Window_${x}_${z}`, [1.08, 1.08, 0.055], [x, 3.76, z], materials.glass, 0.035)
    addBox(`Window_Sill_${x}_${z}`, [1.08, 0.08, 0.09], [x, 3.17, z], materials.teal, 0.01)
  }
}
for (const x of [-4.22, -2.9, -1.6, -0.3, 1, 2.3, 3.55]) {
  for (const z of [-1.22, 1.22]) addBox(`Window_Pillar_${x}_${z}`, [0.08, 1.24, 0.08], [x, 3.76, z], materials.orange, 0.015)
}

// Passenger doors, hinges, steps and side mirrors.
for (const z of [-1.25, 1.25]) {
  addBox('Front_Passenger_Door', [0.95, 1.76, 0.06], [2.9, 2.28, z], materials.graphite, 0.04)
  addBox('Door_Glass', [0.72, 1.16, 0.07], [2.9, 2.66, z * 1.012], materials.glassHighlight, 0.02)
  addBox('Door_Handle', [0.12, 0.06, 0.1], [2.64, 2.05, z * 1.03], materials.chrome, 0.01)
  addBox('Door_Step', [1.12, 0.12, 0.42], [2.9, 1.34, z * 0.96], materials.chrome, 0.02)
}
for (const z of [-1.47, 1.47]) {
  addBox('Mirror_Arm', [0.16, 0.75, 0.12], [4.18, 4.14, z * 0.92], materials.chrome, 0.03)
  addBox('Mirror_Housing', [0.22, 0.48, 0.5], [4.05, 4.32, z], materials.ink, 0.08)
  addBox('Mirror_Glass', [0.08, 0.29, 0.28], [3.97, 4.34, z * 1.01], materials.glass, 0.04)
}

// Roof hardware and marker lights.
addBox('Roof_Vent', [1.22, 0.16, 0.6], [-0.8, 4.62, 0], materials.graphite, 0.05)
addBox('Roof_Rail', [6.7, 0.08, 0.08], [-0.1, 4.62, 0.9], materials.chrome, 0.02)
for (const x of [-3.7, -2.4, -1.1, 0.2, 1.5, 2.8, 3.8]) {
  for (const z of [-1, 1]) addBox('Marker_Light', [0.12, 0.12, 0.12], [x, 4.58, z], materials.lamp, 0.03)
}

// Wheels with hub details. The paired outer wheels make the vehicle read as full-size from every angle.
for (const x of [-3.05, 3.0]) {
  for (const z of [-1.29, 1.29]) {
    addCylinder('Tyre', 0.78, 0.36, [x, 0.82, z], materials.rubber)
    addCylinder('Wheel_Rim', 0.46, 0.39, [x, 0.82, z * 1.01], materials.chrome)
    addCylinder('Wheel_Hub', 0.2, 0.42, [x, 0.82, z * 1.02], materials.ink)
    addCylinder('Wheel_Cap', 0.08, 0.44, [x, 0.82, z * 1.03], materials.saffron)
  }
}

// Rear engine service details and tail lamp stack.
addBox('Rear_Engine_Door', [0.08, 1.3, 1.75], [-4.53, 2.48, 0], materials.graphite, 0.03)
for (let i = -3; i <= 3; i += 1) addBox('Engine_Vent', [0.1, 0.05, 1.25], [-4.6, 2.06 + i * 0.14, 0], materials.chrome, 0.01)
for (const z of [-0.8, 0.8]) {
  addBox('Tail_Lamp', [0.12, 0.42, 0.24], [-4.63, 2.88, z], materials.tail, 0.05)
  addBox('Rear_Reflector', [0.11, 0.18, 0.3], [-4.64, 2.25, z], materials.saffron, 0.03)
}
addBox('Rear_Upper_Glass', [0.07, 0.72, 1.5], [-4.51, 3.78, 0], materials.glass, 0.04)
addBox('Rear_Logo_Plate', [0.08, 0.48, 1.02], [-4.58, 3.02, 0], materials.orange, 0.03)

// Longitudinal TNSTC livery panels.
for (const z of [-1.24, 1.24]) {
  addBox('Side_Livery_Panel', [4.9, 0.52, 0.04], [-0.3, 2.15, z], materials.orange, 0.02)
  addBox('Side_Livery_Accent', [4.72, 0.08, 0.06], [-0.3, 2.45, z * 1.002], materials.teal, 0.01)
}

// A small, raised TNSTC wordmark on each side for silhouette legibility.
const fontPath = path.resolve('node_modules/three/examples/fonts/helvetiker_bold.typeface.json')
if (fs.existsSync(fontPath)) {
  const font = new FontLoader().parse(JSON.parse(fs.readFileSync(fontPath, 'utf8')))
  for (const z of [-1.27, 1.27]) {
    const textGeometry = new TextGeometry('TNSTC', { font, size: 0.34, depth: 0.035, curveSegments: 4, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.008, bevelSegments: 2 })
    textGeometry.computeBoundingBox()
    const width = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x
    textGeometry.translate(-width / 2, -0.17, 0)
    const text = new THREE.Mesh(textGeometry, materials.ivory)
    text.name = 'Raised_TNSTC_Wordmark'
    text.position.set(-0.35, 2.78, z)
    text.rotation.y = z < 0 ? Math.PI : 0
    text.castShadow = true
    root.add(text)
  }
}

// Place origin at the bus's visual center and set a coherent scale.
root.traverse((object) => {
  if (object.isMesh) {
    object.castShadow = true
    object.receiveShadow = true
  }
})

const scene = new THREE.Scene()
scene.add(root)
scene.updateMatrixWorld(true)

const exporter = new GLTFExporter()
exporter.parse(scene, (result) => {
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, Buffer.from(result))
  console.log(`Wrote ${outFile}`)
}, (error) => {
  console.error(error)
  process.exitCode = 1
}, { binary: true, onlyVisible: true, truncateDrawRange: true })
