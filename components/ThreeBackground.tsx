import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Type definitions for Three.js elements in JSX
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      sphereGeometry: any; // Changed to sphere for softness
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
      sphereGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
      fog: any;
    }
  }
}

// CONCEPT: "The Digital Horizon"
// A structured, flowing grid of data points. 
// Represents consistency, vastness, and the "Flow State" of coding.
const DigitalWave = () => {
  const rows = 60;
  const cols = 60;
  const count = rows * cols;
  const verticalOffset = -6; // Push the entire wave lower on screen
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize a grid layout instead of random chaos
  const particles = useMemo(() => {
    const temp = [];
    const separation = 1.0; // Distance between points
    for (let x = 0; x < rows; x++) {
      for (let z = 0; z < cols; z++) {
        const xPos = (x - rows / 2) * separation;
        const zPos = (z - cols / 2) * separation;
        temp.push({ 
          x: xPos, 
          z: zPos, 
          initialY: 0,
          // Calculate phase based on position for a wave effect
          phase: (x * 0.1) + (z * 0.1) 
        });
      }
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      // Create a gentle Sine Wave motion
      // Creates a rolling landscape effect
      const waveHeight = Math.sin(particle.phase + time * 0.5) * 2;
      const waveWidth = Math.cos(particle.phase * 0.5 + time * 0.3) * 2;
      
      const y = waveHeight + waveWidth;

      // Position the grid lower and tilted slightly to create depth
      dummy.position.set(particle.x, y + verticalOffset, particle.z);
      
      // Dynamic scaling: Higher points are slightly larger (optical illusion of proximity)
      const scale = (0.2 + (y + 4) * 0.05) * 0.3; // Base scale adjusted for visibility
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      {/* Spheres are friendlier and look like "light points" */}
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#fbbf24" // Subtle golden glow (Manee)
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.9} // High metalness for a premium look
      />
    </instancedMesh>
  );
};

export const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 z-0 w-screen h-screen bg-neutral-950 pointer-events-none overflow-hidden">
      <Canvas 
        dpr={window.devicePixelRatio} 
        className="w-full h-full" 
        camera={{ position: [0, 5, 30], fov: 75 }}
      >
        <ambientLight intensity={0.5} />
        {/* Soft, studio-like lighting */}
        <pointLight position={[20, 30, 20]} intensity={1.5} color="#fbbf24" distance={50} /> 
        <pointLight position={[-20, 10, -20]} intensity={2} color="#6366f1" distance={50} />
        
        <DigitalWave />
        
        {/* Deep fog for the "Endless" look */}
        <fog attach="fog" args={["#0a0a0a", 5, 30]} />
      </Canvas>
      
      {/* Overlay Gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 via-transparent to-neutral-950/80" />
    </div>
  );
};
