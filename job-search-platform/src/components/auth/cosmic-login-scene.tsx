'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function StarField() {
  const points = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const total = 3000
    const values = new Float32Array(total * 3)

    for (let i = 0; i < total; i++) {
      values[i * 3] = (Math.random() - 0.5) * 22
      values[i * 3 + 1] = (Math.random() - 0.5) * 22
      values[i * 3 + 2] = (Math.random() - 0.5) * 22
    }

    return values
  }, [])

  useFrame((_, delta) => {
    if (!points.current) return
    points.current.rotation.y -= delta * 0.025
    points.current.rotation.x -= delta * 0.01
  })

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#90e8b0"
        size={0.018}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}

function EnergyCore() {
  const core = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    if (core.current) {
      core.current.rotation.y += delta * 0.35
      const scale = 1 + Math.sin(t * 1.7) * 0.05
      core.current.scale.setScalar(scale)
    }
    if (ring.current) {
      ring.current.rotation.x += delta * 0.25
      ring.current.rotation.y += delta * 0.4
    }
  })

  return (
    <group>
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.3}>
        <mesh ref={core}>
          <icosahedronGeometry args={[1.15, 2]} />
          <meshStandardMaterial
            color="#67d58f"
            emissive="#1f8a50"
            emissiveIntensity={0.95}
            metalness={0.4}
            roughness={0.18}
            wireframe
          />
        </mesh>
      </Float>

      <mesh ref={ring} rotation={[0.6, 0, 0]}>
        <torusGeometry args={[2.35, 0.02, 24, 180]} />
        <meshBasicMaterial color="#35e375" transparent opacity={0.78} />
      </mesh>
    </group>
  )
}

export default function CosmicLoginScene() {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#060d09']} />
        <fog attach="fog" args={['#060d09', 7.5, 18]} />
        <ambientLight intensity={0.22} />
        <directionalLight position={[4, 4, 2]} intensity={1.2} color="#7ee39d" />
        <pointLight position={[-3, -2, 3]} intensity={1.05} color="#35e375" />

        <StarField />
        <EnergyCore />
      </Canvas>
    </div>
  )
}
