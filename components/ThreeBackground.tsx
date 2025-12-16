import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Type definitions for Three.js elements in JSX
// Extending both 'react' module and global JSX to ensure compatibility
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
      fog: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
      fog: any;
    }
  }
}

// CONCEPT: "The Syntax Lattice"
// Instead of organic waves, we use Cubes to represent modular code and structure.
// They float in a more grid-like, mathematical fashion.
const CodeBlocks = () => {
  const count = 800;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Structured randomness
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 40;
      const speed = 0.005 + Math.random() * 0.02;
      const rotationSpeed = Math.random() * 0.02;
      temp.push({ x, y, z, speed, rotationSpeed, time: Math.random() * 100 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;

    particles.forEach((particle, i) => {
      // Logic: Float upwards like compiling code or bubbles in a cooling tank
      particle.y += particle.speed;
      if (particle.y > 30) particle.y = -30;

      // Gentle rotation representing processing
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.rotation.x += particle.rotationSpeed;
      dummy.rotation.y += particle.rotationSpeed;
      
      // Scale pulse
      const s = 0.3 + Math.sin(state.clock.getElapsedTime() + i) * 0.1;
      dummy.scale.set(s, s, s);
      
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#fbbf24" // Amber-400: Represents "Energy/Logic"
        emissive="#78350f" // Deep amber glow
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  );
};

export const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 z-0 bg-neutral-950 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
        <ambientLight intensity={0.2} />
        {/* Dual lighting setup: Amber for warmth, Indigo for deep tech */}
        <pointLight position={[20, 20, 20]} intensity={2} color="#fbbf24" /> 
        <pointLight position={[-20, -20, -20]} intensity={2} color="#4338ca" />
        <CodeBlocks />
        <fog attach="fog" args={['#0a0a0a', 15, 60]} />
      </Canvas>
    </div>
  );
};