import React, { useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../data/store';

function latLngTo3D(lat, lng, centerLat, centerLng) {
  const scale = 111000;
  return [(lng - centerLng) * scale * Math.cos(centerLat * Math.PI / 180), 0, -(lat - centerLat) * scale];
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#0d0d12" />
      </mesh>
      <gridHelper args={[600, 60, '#1a1a25', '#111118']} />
    </group>
  );
}

function Roads({ roads, centerLat, centerLng }) {
  const lines = useMemo(() => roads.map(road => {
    const points = road.path.map(([lat, lng]) => {
      const [x, , z] = latLngTo3D(lat, lng, centerLat, centerLng);
      return new THREE.Vector3(x, 0.02, z);
    });
    return { id: road.id, points, color: road.type === 'primary' ? '#374151' : '#1f2937' };
  }), [roads, centerLat, centerLng]);

  return (
    <group>
      {lines.map(l => (
        <line key={l.id}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={l.points.length}
              array={new Float32Array(l.points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={l.color} transparent opacity={0.5} />
        </line>
      ))}
    </group>
  );
}

function BuildingMesh({ building, centerLat, centerLng, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const [cx, , cz] = latLngTo3D(building.position.lat, building.position.lng, centerLat, centerLng);
  const w = building.width || Math.sqrt(building.footprint) * 1.26;
  const d = building.depth || Math.sqrt(building.footprint) * 0.8;
  const h = building.height;
  const color = isSelected ? '#FF1E3C' : hovered ? '#FF4560' : '#64748B';

  return (
    <group position={[cx, 0, cz]}>
      <mesh
        position={[0, h / 2, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(building); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.9 : 0.7}
          emissive={isSelected ? '#FF1E3C' : hovered ? '#FF1E3C' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : hovered ? 0.1 : 0}
        />
      </mesh>
      <mesh position={[0, h + 0.1, 0]}>
        <boxGeometry args={[w + 0.3, 0.2, d + 0.3]} />
        <meshStandardMaterial color={isSelected ? '#FF1E3C' : '#475569'} />
      </mesh>
      {isSelected && (
        <Text position={[0, h + 3, 0]} fontSize={2} color="#FF1E3C" anchorX="center" anchorY="bottom"
          outlineWidth={0.15} outlineColor="#0A0A0F">
          {building.name}
        </Text>
      )}
    </group>
  );
}

function SceneContent() {
  const { buildings, roads, selectedBuilding, selectBuilding, selectParcel } = useStore();
  const centerLat = 18.5204;
  const centerLng = 73.8567;

  return (
    <>
      <PerspectiveCamera makeDefault position={[140, 110, 140]} fov={50} />
      <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={20} maxDistance={350} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[100, 150, 80]} intensity={0.8} />
      <directionalLight position={[-50, 100, -50]} intensity={0.2} />
      <Ground />
      <Roads roads={roads} centerLat={centerLat} centerLng={centerLng} />
      {buildings.map(b => (
        <BuildingMesh key={b.id} building={b} centerLat={centerLat} centerLng={centerLng}
          isSelected={selectedBuilding?.id === b.id}
          onSelect={(b) => { selectBuilding(b); selectParcel(null); }} />
      ))}
    </>
  );
}

const Dashboard3DPreview = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Dashboard3DPreview;
