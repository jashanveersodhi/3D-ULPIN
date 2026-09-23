import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

const BuildingScene = ({ store, selectedFloor, setSelectedFloor, selectedUnit, setSelectedUnit, exploded, is2D }) => {
  const { buildings, properties } = store;
  const building = buildings[0]; // Focus on Empire State Building
  const floorHeight = building.height / building.floors;
  const buildingW = 40;
  const buildingD = 25;

  const unitsPerFloor = 6;

  // Pre-calculate building geometry
  const floors = useMemo(() => {
    return Array.from({ length: building.floors }, (_, i) => ({
      number: i + 1,
      zBottom: i * floorHeight,
      zTop: (i + 1) * floorHeight,
    }));
  }, [building]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[100, 100, 100]} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />

      <ambientLight intensity={0.5} />
      <pointLight position={[100, 200, 100]} intensity={1} />
      <directionalLight position={[-50, 100, 50]} intensity={0.5} />

      {/* Coordinate Grid */}
      <gridHelper args={[500, 50]} color="#d6dee8" />
      <axesHelper args={[10]} />

      {/* Building */}
      <group position={[0, 0, 0]}>
        {floors.map((f) => {
          const isSelected = f.number === selectedFloor;
          const offset = exploded ? (f.number - 51) * 5 : 0;

          return (
            <group key={f.number} position={[0, f.zBottom + offset, 0]}>
              {/* Floor Slab */}
              <mesh>
                <boxGeometry args={[buildingW, 0.5, buildingD]} />
                <meshStandardMaterial
                  color={isSelected ? '#f2b544' : '#a9c7df'}
                  transparent
                  opacity={isSelected ? 1 : 0.6}
                />
              </mesh>

              {/* Property Units for this floor */}
              {Array.from({ length: unitsPerFloor }, (_, u) => {
                const unitIdx = u + 1;
                const isUnitSelected = isSelected && unitIdx === selectedUnit;

                // Simple grid layout for units (2x3)
                const col = u % 3; // 0, 1, 2
                const row = Math.floor(u / 3); // 0, 1

                const w = buildingW / 3;
                const d = buildingD / 2;
                const posX = (col - 1) * w + w / 2;
                const posZ = (row - 0.5) * d + d / 2;

                return (
                  <mesh
                    key={u}
                    position={[posX, floorHeight / 2, posZ]}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFloor(f.number);
                      setSelectedUnit(unitIdx);
                    }}
                  >
                    <boxGeometry args={[w - 0.5, floorHeight - 0.5, d - 0.5]} />
                    <meshStandardMaterial
                      color={isUnitSelected ? '#3aa77b' : '#ffffff'}
                      transparent
                      opacity={isUnitSelected ? 1 : 0.3}
                      emissive={isUnitSelected ? '#3aa77b' : '#000000'}
                      emissiveIntensity={isUnitSelected ? 0.5 : 0}
                    />
                  </mesh>
                );
              })}

              {/* Floor Label */}
              {f.number % 10 === 0 || isSelected ? (
                <Text
                  position={[buildingW / 2 + 2, floorHeight / 2, 0]}
                  fontSize={2}
                  color="#344054"
                  anchorX="left"
                >
                  F{f.number}
                </Text>
              ) : null}
            </group>
          );
        })}
      </group>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#eef3f8" />
      </mesh>
    </>
  );
};

export default BuildingScene;
