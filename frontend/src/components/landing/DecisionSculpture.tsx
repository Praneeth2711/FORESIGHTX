import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { scrollState, useStore } from './store';

// Helper to generate intertwined ribbon curves
const generateRibbonCurves = (basePoints: THREE.Vector3[], strands: number, radius: number) => {
  return Array.from({ length: strands }).map((_, i) => {
    const angleOffset = (i / strands) * Math.PI * 2;
    const points = basePoints.map((p, index) => {
      // Create a twisting effect along the curve
      const t = index / (basePoints.length - 1);
      const twist = t * Math.PI * 2 + angleOffset;
      // Taper the radius at the top and bottom
      const r = radius * Math.sin(t * Math.PI);
      return new THREE.Vector3(
        p.x + Math.cos(twist) * r,
        p.y,
        p.z + Math.sin(twist) * r
      );
    });
    return new THREE.CatmullRomCurve3(points);
  });
};

const BranchNode = ({ 
  id, 
  basePoints, 
  colorActive, 
  colorInactive,
  strands = 3,
  radius = 0.5
}: { 
  id: 'A' | 'B' | 'C', 
  basePoints: THREE.Vector3[],
  colorActive: string,
  colorInactive: string,
  strands?: number,
  radius?: number
}) => {
  const { activeBranch, hoveredBranch } = useStore();
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const curves = useMemo(() => generateRibbonCurves(basePoints, strands, radius), [basePoints, strands, radius]);
  
  // Ribbon cross-section shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.15, -0.01);
    s.lineTo(0.15, -0.01);
    s.lineTo(0.15, 0.01);
    s.lineTo(-0.15, 0.01);
    s.lineTo(-0.15, -0.01);
    return s;
  }, []);

  const isHovered = hoveredBranch === id;
  const isActive = activeBranch === id;
  const isEmphasized = isActive || isHovered;

  // Animate spreading based on scroll, and colors based on interaction
  useFrame(() => {
    const p = scrollState.progress;
    // Map p (0 to 1) to spread logic
    // p < 0.2: tight bundle (y=0 offset)
    // p > 0.2: spread to final positions
    const spread = THREE.MathUtils.smoothstep(p, 0.1, 0.5);
    
    if (groupRef.current) {
      groupRef.current.scale.set(spread, 1, spread);
      // Add a slight floating rotation specific to this branch
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.05 * spread;
    }

    if (materialRef.current) {
      const targetColor = new THREE.Color(isEmphasized ? colorActive : colorInactive);
      materialRef.current.color.lerp(targetColor, 0.1);
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, isEmphasized ? 0.2 : 0, 0.1);
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={(e) => { e.stopPropagation(); scrollState.setHoveredBranch(id); }}
      onPointerOut={() => scrollState.setHoveredBranch(null)}
      onClick={(e) => { e.stopPropagation(); scrollState.setActiveBranch(id); }}
    >
      {curves.map((curve, i) => (
        <mesh key={i}>
          <extrudeGeometry args={[shape, { extrudePath: curve, steps: 128, bevelEnabled: false }]} />
          <meshPhysicalMaterial 
            ref={i === 0 ? materialRef : undefined} // We share state visually, but actually need distinct materials or just sync them
            color={colorActive}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={colorActive}
            emissiveIntensity={0}
          />
        </mesh>
      ))}
      
      {/* End Node Sphere */}
      <mesh position={basePoints[basePoints.length - 1]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshPhysicalMaterial 
          color={isEmphasized ? colorActive : colorInactive} 
          roughness={0.1} 
          metalness={0.9} 
          clearcoat={1}
        />
      </mesh>
    </group>
  );
};

const SculptureSystem = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const ptsA = useMemo(() => [
    new THREE.Vector3(0, 10, 0),
    new THREE.Vector3(0, 4, 0),
    new THREE.Vector3(-4, -2, 2),
    new THREE.Vector3(-6, -6, 1),
    new THREE.Vector3(-8, -10, -2)
  ], []);

  const ptsB = useMemo(() => [
    new THREE.Vector3(0, 10, 0),
    new THREE.Vector3(0, 4, 0),
    new THREE.Vector3(2, -2, -3),
    new THREE.Vector3(4, -6, -5),
    new THREE.Vector3(5, -10, -6)
  ], []);

  const ptsC = useMemo(() => [
    new THREE.Vector3(0, 10, 0),
    new THREE.Vector3(0, 4, 0),
    new THREE.Vector3(1, -2, 4),
    new THREE.Vector3(2, -6, 6),
    new THREE.Vector3(3, -10, 8)
  ], []);

  useFrame(() => {
    const p = scrollState.progress;
    if (groupRef.current) {
      // Global rotation and position based on scroll
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, p * Math.PI * 0.5, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, p * 4 - 2, 0.05);
      
      // Shift sculpture to the right in the hero (p=0), center it during scroll (p=1)
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 4 - p * 4, 0.05);
    }
    if (coreRef.current) {
      // Pulse the core during chapter 1 (p around 0.1 - 0.3)
      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial;
      const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
      const intensity = p > 0.05 && p < 0.4 ? 1 + pulse : 0.5;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, intensity, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        
        {/* Branch A (Delay) */}
        <BranchNode 
          id="A" 
          basePoints={ptsA} 
          colorActive="#171615" 
          colorInactive="#A39B93" 
          strands={4} 
          radius={0.6} 
        />
        
        {/* Branch B (Alternative - Accent) */}
        <BranchNode 
          id="B" 
          basePoints={ptsB} 
          colorActive="#F06445" 
          colorInactive="#D8D0C5" 
          strands={5} 
          radius={0.8} 
        />
        
        {/* Branch C (Backup) */}
        <BranchNode 
          id="C" 
          basePoints={ptsC} 
          colorActive="#756D65" 
          colorInactive="#D8D0C5" 
          strands={3} 
          radius={0.5} 
        />

        {/* Central Core (The Event) */}
        <mesh ref={coreRef} position={[0, 4, 0]}>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshPhysicalMaterial 
            color="#FF8B65" 
            emissive="#F06445"
            emissiveIntensity={0.5}
            roughness={0.1} 
            metalness={0.9} 
            clearcoat={1}
          />
        </mesh>
        
        {/* Outer glass shell for the core */}
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[0.7, 64, 64]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transmission={0.95} 
            opacity={1} 
            transparent 
            roughness={0} 
            thickness={2}
            clearcoat={1}
          />
        </mesh>

      </Float>
    </group>
  );
};

export const DecisionSculpture = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas 
        camera={{ position: [0, 0, 16], fov: 35 }} 
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        {/* Studio Lighting Setup */}
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#FF8B65" />
        <spotLight position={[0, 15, 0]} intensity={2} angle={0.5} penumbra={1} color="#EAE3D8" />
        
        <Environment preset="studio" />
        
        {/* Wrap in a group with pointer-events-auto so raycasting works, but the canvas wrapper is pointer-events-none so it doesn't block the HTML. Wait! If the canvas wrapper is pointer-events-none, raycasting won't work! */}
        <group onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'auto'; }}>
          <SculptureSystem />
        </group>
      </Canvas>
    </div>
  );
};
