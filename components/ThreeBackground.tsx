import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Environment, Instance, Instances, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Anime Aesthetic Elements ---

// 1. Cherry Blossom (Sakura) Petals
const SakuraStorm = ({ count = 150 }) => {
    const { viewport } = useThree();
    
    // Generate random data for each petal
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            // Random position in a wide volume
            position: [
                (Math.random() - 0.5) * 40,
                Math.random() * 40 - 10,
                (Math.random() - 0.5) * 30 - 5
            ] as [number, number, number],
            scale: Math.random() * 0.3 + 0.1, // Varied small sizes
            speed: Math.random() * 1.5 + 0.5, // Varied fall speed
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
            swayFreq: Math.random() * 2 + 1, // How fast it sways
            swayAmp: Math.random() * 0.05 + 0.01 // How wide it sways
        }))
    }, [count]);

    return (
        <Instances range={count}>
            {/* Simple plane geometry resembles a petal from distance */}
            <circleGeometry args={[0.3, 5]} />
            <meshBasicMaterial 
                color="#ffb7c5" // Sakura Pink
                side={THREE.DoubleSide} 
                transparent 
                opacity={0.8} 
            />
            {particles.map((data, i) => (
                <FallingPetal key={i} {...data} />
            ))}
        </Instances>
    )
}

const FallingPetal = ({ position, scale, speed, rotation, swayFreq, swayAmp }: any) => {
    const ref = useRef<any>();
    // Store initial x/z to oscillate around
    const initialPos = useRef(position);
    
    useFrame((state, delta) => {
        if (!ref.current) return;
        const time = state.clock.getElapsedTime();

        // Fall down
        ref.current.position.y -= speed * delta * 0.8;
        
        // Complex tumble rotation
        ref.current.rotation.x += delta * 0.5;
        ref.current.rotation.y += delta * 0.2;
        ref.current.rotation.z += delta * 0.1;

        // Wind Sway Effect (Sine wave motion)
        ref.current.position.x = initialPos.current[0] + Math.sin(time * swayFreq) * 2;
        ref.current.position.z = initialPos.current[2] + Math.cos(time * swayFreq * 0.8) * 1;

        // Reset when it falls below screen
        if (ref.current.position.y < -15) {
            ref.current.position.y = 20; // Reset to top
            // Randomize X/Z slightly on respawn to prevent patterns
            initialPos.current[0] = (Math.random() - 0.5) * 40;
            initialPos.current[2] = (Math.random() - 0.5) * 20;
        }
    })

    return (
        <Instance 
            ref={ref} 
            position={position} 
            scale={scale} 
            rotation={rotation} 
        />
    );
}

// 2. Spirit Orbs (Toon Shaded Floating Shapes)
const SpiritOrbs = ({ count = 20 }) => {
    const orbs = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20 - 10
            ] as [number, number, number],
            scale: Math.random() * 0.5 + 0.2
        }));
    }, [count]);

    return (
        <group>
            {orbs.map((orb, i) => (
                <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2}>
                    <mesh position={orb.position} scale={orb.scale}>
                        <icosahedronGeometry args={[1, 0]} />
                        {/* Toon Material for Anime Look */}
                        <meshToonMaterial 
                            color={i % 2 === 0 ? "#60a5fa" : "#c084fc"} // Blue and Purple spirits
                            emissive={i % 2 === 0 ? "#2563eb" : "#9333ea"}
                            emissiveIntensity={0.5}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

// 3. Manga Action Lines (Subtle background speed effect)
const SpeedLines = () => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.z += delta * 0.05; // Slow rotation
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, -20]} rotation={[0, 0, Math.PI / 4]}>
            {Array.from({ length: 20 }).map((_, i) => (
                <mesh key={i} position={[(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, 0]}>
                    <planeGeometry args={[0.2, 30]} />
                    <meshBasicMaterial 
                        color="#ffffff" 
                        transparent 
                        opacity={0.03} 
                        side={THREE.DoubleSide} 
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    )
}

// Parallax Camera Rig (Subtle movement following mouse)
const CameraRig = () => {
    const { camera, mouse } = useThree();
    const vec = new THREE.Vector3();

    useFrame(() => {
        // Smoothly interpolate camera position based on mouse coordinates
        // Mouse x/y are from -1 to 1
        camera.position.lerp(vec.set(mouse.x * 1, mouse.y * 0.5, 10), 0.05);
        camera.lookAt(0, 0, 0);
    });

    return null;
}

const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0a12]">
      <Canvas 
        gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        }}
        dpr={[1, 2]} 
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <CameraRig />
        
        {/* Cinematic Anime Lighting */}
        <ambientLight intensity={0.4} color="#db2777" /> {/* Pinkish ambient */}
        <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" /> {/* Blue rim light */}
        <pointLight position={[-10, -10, 5]} intensity={1.5} color="#c084fc" /> {/* Purple fill */}
        
        {/* Effects */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        <SakuraStorm />
        <SpiritOrbs />
        <SpeedLines />
        
        {/* Magical Sparkles */}
        <Sparkles 
            count={100} 
            scale={12} 
            size={4} 
            speed={0.4} 
            opacity={0.5} 
            color="#fbbf24" // Gold sparkles
        />

        {/* Environment for reflections on Toon materials */}
        <Environment preset="night" />
        <fog attach="fog" args={['#0a0a12', 5, 45]} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;