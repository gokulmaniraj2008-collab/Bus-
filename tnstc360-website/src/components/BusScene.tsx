import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Html, useGLTF, useProgress } from '@react-three/drei'
import * as THREE from 'three'

function LoadingLabel() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="scene-loading-card">
        <span className="scene-loading-kicker">LOADING VEHICLE</span>
        <strong>{Math.round(progress)}%</strong>
        <div className="scene-loading-track"><i style={{ width: `${progress}%` }} /></div>
      </div>
    </Html>
  )
}

function BusModel({ rotation, zoom }: { rotation: number; zoom: number }) {
  const { scene } = useGLTF('/assets/tnstc-bus.glb')
  const bus = useRef<THREE.Group>(null)
  const cameraTarget = useRef(new THREE.Vector3(0, 0.2, 0))

  useFrame(({ camera }, delta) => {
    if (!bus.current) return
    bus.current.rotation.y = THREE.MathUtils.damp(bus.current.rotation.y, rotation, 7, delta)
    const desiredZ = 14 / zoom
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredZ, 5, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.8, 5, delta)
    camera.lookAt(cameraTarget.current)
  })

  return (
    <group ref={bus} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  )
}

function SceneContents({ rotation, zoom }: { rotation: number; zoom: number }) {
  return (
    <>
      <color attach="background" args={['#07151d']} />
      <fog attach="fog" args={['#07151d', 17, 33]} />
      <ambientLight intensity={1.1} color="#d8f5ed" />
      <hemisphereLight intensity={1.25} color="#d7fff5" groundColor="#07151d" />
      <directionalLight castShadow position={[8, 13, 10]} intensity={3.5} color="#fff3d5" shadow-mapSize={[2048, 2048]} shadow-bias={-0.00012} />
      <spotLight castShadow position={[-10, 8, 7]} angle={0.42} penumbra={0.8} intensity={24} distance={30} color="#f1a33c" />
      <pointLight position={[4, 3, -7]} intensity={9} distance={20} color="#49c6bd" />
      <Suspense fallback={<LoadingLabel />}>
        <BusModel rotation={rotation} zoom={zoom} />
      </Suspense>
      <ContactShadows position={[0, 0, 0]} opacity={0.58} scale={17} blur={2.8} far={9} color="#000000" />
    </>
  )
}

export default function BusScene({
  rotation,
  zoom,
  className = '',
}: {
  rotation: number
  zoom: number
  className?: string
}) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false })
        || canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false })
      setWebglAvailable(Boolean(context))
      const loseContext = context?.getExtension('WEBGL_lose_context')
      loseContext?.loseContext()
    } catch {
      setWebglAvailable(false)
    }
  }, [])

  if (webglAvailable === false) {
    return <div className="webgl-fallback"><strong>TNSTC / 360°</strong><span>3D preview unavailable on this device.<br />Scroll to continue through the design study.</span></div>
  }

  if (webglAvailable === null) {
    return <div className="webgl-fallback"><strong>TNSTC / 360°</strong><span>Preparing the interactive vehicle study…</span></div>
  }

  return (
    <Canvas
      className={className}
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [10, 4.5, 14], fov: 31, near: 0.1, far: 100 }}
      fallback={<div className="webgl-fallback"><strong>TNSTC / 360°</strong><span>3D preview unavailable on this device.<br />Scroll to continue through the design study.</span></div>}
      onCreated={({ gl }) => {
        gl.setClearColor('#07151d')
      }}
    >
      <SceneContents rotation={rotation} zoom={zoom} />
    </Canvas>
  )
}
