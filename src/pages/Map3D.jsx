import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Box, RotateCcw, Tag, X, Building, Layers, Home, Crosshair, Hash, Map as MapIcon, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import MiniMap from '../components/map/MiniMap';

function latLngTo3D(lat, lng, centerLat, centerLng) {
  const scale = 111000;
  return [(lng - centerLng) * scale * Math.cos(centerLat * Math.PI / 180), 0, -(lat - centerLat) * scale];
}

// Camera controller — frames the reference tower, the whole neighborhood,
// a specific building, a close-up of a selected apartment unit, or the
// underground infrastructure (basements, parking, metro, station).
function CameraController({ focus, buildings, units, centerLat, centerLng, viewMode }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  // Bounding box of the whole neighborhood (in 3D meters).
  const bounds = useMemo(() => {
    const box = new THREE.Box3();
    const v = new THREE.Vector3();
    buildings.forEach((b) => {
      const [cx, , cz] = latLngTo3D(b.position.lat, b.position.lng, centerLat, centerLng);
      box.expandByPoint(v.set(cx - b.width / 2, 0, cz - b.depth / 2));
      box.expandByPoint(v.set(cx + b.width / 2, b.height, cz + b.depth / 2));
    });
    return box;
  }, [buildings, centerLat, centerLng]);

  // Bounding box of underground units only.
  const undergroundBounds = useMemo(() => {
    const box = new THREE.Box3();
    const v = new THREE.Vector3();
    units.forEach((u) => {
      if (!u.bounds) return;
      box.expandByPoint(v.set(u.bounds.xMin, u.bounds.yMin, u.bounds.zMin));
      box.expandByPoint(v.set(u.bounds.xMax, u.bounds.yMax, u.bounds.zMax));
    });
    return box;
  }, [units]);

  useEffect(() => {
    if (!controlsRef.current) return;
    let target = [0, 20, 0];
    let distance = 230;

    if (viewMode === 'underground' && !undergroundBounds.isEmpty()) {
      const center = undergroundBounds.getCenter(new THREE.Vector3());
      const sphere = undergroundBounds.getBoundingSphere(new THREE.Sphere());
      target = [center.x, center.y, center.z];
      distance = sphere.radius * 2.0;
    } else if (viewMode === 'all') {
      const allBounds = new THREE.Box3();
      allBounds.copy(bounds);
      if (!undergroundBounds.isEmpty()) allBounds.union(undergroundBounds);
      if (!allBounds.isEmpty()) {
        const center = allBounds.getCenter(new THREE.Vector3());
        const sphere = allBounds.getBoundingSphere(new THREE.Sphere());
        target = [center.x, center.y, center.z];
        distance = sphere.radius * 2.2;
      }
    } else if (focus === 'reference') {
      const ref = buildings.find(b => b.isReference);
      if (ref) {
        const [cx, , cz] = latLngTo3D(ref.position.lat, ref.position.lng, centerLat, centerLng);
        target = [cx, ref.height / 2, cz];
        distance = ref.height * 2.0;
      }
    } else if (focus === 'neighborhood') {
      if (!bounds.isEmpty()) {
        const center = bounds.getCenter(new THREE.Vector3());
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        target = [center.x, center.y, center.z];
        distance = sphere.radius * 2.4;
      }
    } else if (typeof focus === 'string' && focus.startsWith('unit:')) {
      const unit = units.find(u => u.id === focus.slice(5));
      const b = unit && buildings.find(bb => bb.id === unit.buildingId);
      if (unit && b) {
        const [bx, , bz] = latLngTo3D(b.position.lat, b.position.lng, centerLat, centerLng);
        const uy = (unit.floorLevel - 0.5) * b.floorHeight;
        target = [bx, uy, bz];
        distance = 26;
      }
    } else {
      const b = buildings.find(bb => bb.id === focus);
      if (b) {
        const [cx, , cz] = latLngTo3D(b.position.lat, b.position.lng, centerLat, centerLng);
        target = [cx, b.height / 2, cz];
        distance = b.height * 2.4;
      }
    }

    controlsRef.current.target.set(...target);
    const dir = camera.position.clone().sub(controlsRef.current.target).normalize();
    camera.position.copy(new THREE.Vector3(...target).add(dir.multiplyScalar(distance)));
    controlsRef.current.update();
  }, [focus, buildings, units, centerLat, centerLng, camera, bounds, undergroundBounds, viewMode]);

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI * 0.85} minDistance={3} maxDistance={500} />;
}

function Ground({ viewMode }) {
  const isUnderground = viewMode === 'underground';
  const isAll = viewMode === 'all';
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial
          color="#0d0d12"
          transparent={isUnderground || isAll}
          opacity={isUnderground ? 0.08 : isAll ? 0.25 : 1}
          side={THREE.DoubleSide}
        />
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
    return { id: road.id, points, color: road.type === 'primary' ? '#374151' : '#1f2937', width: road.width };
  }), [roads, centerLat, centerLng]);

  return (
    <group>
      {lines.map(l => (
        <Line key={l.id} points={l.points} color={l.color} lineWidth={l.width > 8 ? 2 : 1} transparent opacity={0.5} />
      ))}
    </group>
  );
}

// Renders a flat polygon from a lat/lng ring as a real BufferGeometry.
// NOTE: a raw THREE.Shape must NOT be passed as `geometry` — it has no
// `boundingSphere`, which crashes Three.js frustum culling every frame
// ("Cannot read properties of undefined (reading 'center')"). ShapeGeometry
// is a proper BufferGeometry and avoids that.
function FlatPolygon({ polygon, centerLat, centerLng, color, opacity, y, lineWidth, lineOpacity, isSelected, onClick }) {
  const { geometry, outline } = useMemo(() => {
    const pts = polygon.map(([lat, lng]) => {
      const [x, , z] = latLngTo3D(lat, lng, centerLat, centerLng);
      return new THREE.Vector3(x, y, z);
    });
    const shape = new THREE.Shape();
    shape.moveTo(pts[0].x, pts[0].z);
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i].x, pts[i].z);
    shape.closePath();
    return { geometry: new THREE.ShapeGeometry(shape), outline: pts };
  }, [polygon, centerLat, centerLng, y]);

  return (
    <group>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}
        onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}>
        <meshStandardMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      <Line points={outline} color={color} lineWidth={lineWidth} transparent opacity={lineOpacity} />
    </group>
  );
}

function GreenSpaces({ greenSpaces, centerLat, centerLng }) {
  return (
    <group>
      {greenSpaces.map(gs => (
        <FlatPolygon key={gs.id} polygon={gs.polygon} centerLat={centerLat} centerLng={centerLng}
          color="#10B981" opacity={0.12} y={0.03} lineWidth={1} lineOpacity={0.15} />
      ))}
    </group>
  );
}

function Parcels({ parcels, centerLat, centerLng, selectedParcel, onSelect }) {
  return (
    <group>
      {parcels.map(parcel => {
        const isSelected = selectedParcel?.id === parcel.id;
        return (
          <FlatPolygon key={parcel.id} polygon={parcel.polygon} centerLat={centerLat} centerLng={centerLng}
            color={isSelected ? '#FF1E3C' : '#1E40AF'} opacity={isSelected ? 0.2 : 0.03} y={0.04}
            lineWidth={isSelected ? 2 : 1} lineOpacity={isSelected ? 0.8 : 0.2}
            isSelected={isSelected}
            onClick={() => onSelect(parcel)} />
        );
      })}
    </group>
  );
}

/**
 * ClickableBuilding — renders a building whose apartments are INDIVIDUAL,
 * independently-selectable 3D meshes. Each apartment mesh carries userData with
 * its buildingId / floor / apartmentNumber / ulpin, and is generated directly
 * from the units data (1:1 mapping — no fake selection).
 *
 * Selection model:
 *   - click an apartment mesh  → selects that apartment (with building + floor context)
 *   - click a floor slab        → selects that floor
 *   - click the roof/entrance   → selects the whole building
 */
function ClickableBuilding({ building, buildingUnits, centerLat, centerLng, selectedFloor, selectedUnit, selectedBuilding, onSelectFloor, onSelectUnit, onSelectBuilding, showFloors, showUnits, showLabels, showUnderground = true }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [cx, , cz] = latLngTo3D(building.position.lat, building.position.lng, centerLat, centerLng);
  const w = building.width;
  const d = building.depth;
  const fh = building.floorHeight;
  const h = building.height;
  const isRef = building.isReference;
  const isBuildingSelected = selectedBuilding?.id === building.id;

  // Filter underground units based on visibility toggle
  const visibleUnits = useMemo(() => {
    if (showUnderground) return buildingUnits;
    return buildingUnits.filter(u => u.unitCategory !== 'underground');
  }, [buildingUnits, showUnderground]);

  // Lay out each floor's apartments on a grid, driven by the real units data.
  // Units with custom bounds (metro tunnels, stations) use their actual 3D bounds.
  const unitLayout = useMemo(() => {
    const byFloor = {};
    visibleUnits.forEach((u) => {
      (byFloor[u.floorLevel] = byFloor[u.floorLevel] || []).push(u);
    });
    const layout = [];
    Object.entries(byFloor).forEach(([, floorUnits]) => {
      const n = floorUnits.length;
      const cols = Math.min(n, 4);
      const rows = Math.ceil(n / cols);
      floorUnits.forEach((unit, i) => {
        // Use custom bounds if available (metro tunnels, stations)
        if (unit.bounds) {
          const b = unit.bounds;
          layout.push({
            unit,
            pos: [(b.xMin + b.xMax) / 2, (b.yMin + b.yMax) / 2, (b.zMin + b.zMax) / 2],
            size: [b.xMax - b.xMin, b.yMax - b.yMin, b.zMax - b.zMin],
            shade: i % 5,
          });
          return;
        }
        const col = i % cols;
        const row = Math.floor(i / cols);
        const uw = w / cols - 0.3;
        const ud = d / rows - 0.3;
        const ux = (col - (cols - 1) / 2) * (w / cols);
        const uz = (row - (rows - 1) / 2) * (d / rows);
        const uy = (unit.floorLevel - 0.5) * fh;
        layout.push({ unit, pos: [ux, uy, uz], size: [uw, fh - 0.25, ud], shade: i % 5 });
      });
    });
    return layout;
  }, [visibleUnits, w, d, fh]);

  // One shared box geometry for every apartment (scaled per-mesh) — keeps the
  // scene light even with hundreds of units.
  const unitGeom = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  // Small set of shared materials (subtle facade shades + selected/hovered).
  const mats = useMemo(() => {
    const base = new THREE.Color(isRef ? '#7A2E3F' : building.isHouse ? '#94A3B8' : '#5B6B82');
    const shades = Array.from({ length: 5 }, (_, i) => {
      const c = base.clone().offsetHSL(0, 0, (i - 2) * 0.05);
      return new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.88, roughness: 0.85, metalness: 0.08 });
    });
    return {
      shades,
      selected: new THREE.MeshStandardMaterial({ color: '#FF1E3C', emissive: '#FF1E3C', emissiveIntensity: 0.55, transparent: true, opacity: 0.96, roughness: 0.5 }),
      hovered: new THREE.MeshStandardMaterial({ color: '#FF4560', emissive: '#FF1E3C', emissiveIntensity: 0.25, transparent: true, opacity: 0.92, roughness: 0.6 }),
    };
  }, [isRef, building.isHouse]);

  // NOTE: the shared geometry/materials above are intentionally NOT disposed
  // manually. Under React.StrictMode (dev) the cleanup would dispose them while
  // they are still referenced, and R3F's auto-dispose has the same problem — so
  // the apartment meshes set `dispose={null}` to keep the shared resources alive.

  return (
    <group position={[cx, 0, cz]}>
      {/* Solid mass — only when units are hidden (clean building silhouette) */}
      {!showUnits && (
        <mesh position={[0, h / 2, 0]}
          onClick={(e) => { e.stopPropagation(); onSelectBuilding(building); }}
          onPointerOver={(e) => { e.stopPropagation(); setHoveredId('__mass__'); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={isBuildingSelected ? '#FF1E3C' : hoveredId === '__mass__' ? '#FF4560' : (building.isHouse ? '#94A3B8' : '#475569')}
            transparent opacity={isRef ? 0.55 : 0.7}
            emissive={isBuildingSelected ? '#FF1E3C' : '#000000'} emissiveIntensity={isBuildingSelected ? 0.35 : 0} />
        </mesh>
      )}

      {/* Individual apartment units — each independently selectable */}
      {showUnits && unitLayout.map(({ unit, pos, size, shade }) => {
        const isUnitSelected = selectedUnit?.id === unit.id;
        const isFloorSelected = selectedFloor === unit.floorLevel;
        const isHovered = hoveredId === unit.id;
        const mat = isUnitSelected ? mats.selected : (isHovered || isFloorSelected) ? mats.hovered : mats.shades[shade];
        return (
          <mesh
            key={unit.id}
            geometry={unitGeom}
            position={pos}
            scale={size}
            material={mat}
            dispose={null}
            onClick={(e) => { e.stopPropagation(); onSelectUnit(building, unit); }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredId(unit.id); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}
            userData={{
              type: 'apartment',
              buildingId: building.id,
              buildingName: building.name,
              buildingUlpin: building.ulpin,
              floor: unit.floorLevel,
              apartmentNumber: unit.unitNumber,
              apartmentId: unit.id,
              ulpin: unit.ulpin,
              unitType: unit.type,
              area: unit.area,
              status: unit.status,
              parcelId: unit.parcelId,
            }}
          />
        );
      })}

      {/* Floor slabs — click selects the floor */}
      {showFloors && Array.from({ length: building.floors }, (_, i) => (
        <mesh key={i} position={[0, (i + 1) * fh, 0]}
          onClick={(e) => { e.stopPropagation(); onSelectFloor(i + 1, building); }}>
          <boxGeometry args={[w + 0.25, 0.12, d + 0.25]} />
          <meshStandardMaterial color={selectedFloor === i + 1 ? '#FF1E3C' : '#334155'} transparent opacity={selectedFloor === i + 1 ? 0.9 : 0.3}
            emissive={selectedFloor === i + 1 ? '#FF1E3C' : '#000000'} emissiveIntensity={selectedFloor === i + 1 ? 0.3 : 0} />
        </mesh>
      ))}

      {/* Roof — click selects the whole building */}
      <mesh position={[0, h + 0.12, 0]}
        onClick={(e) => { e.stopPropagation(); onSelectBuilding(building); }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredId('__roof__'); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}>
        <boxGeometry args={[w + 0.35, 0.24, d + 0.35]} />
        <meshStandardMaterial color={isBuildingSelected ? '#FF1E3C' : (building.isHouse ? '#7C3AED' : '#475569')}
          emissive={isBuildingSelected ? '#FF1E3C' : '#000000'} emissiveIntensity={isBuildingSelected ? 0.3 : 0} />
      </mesh>

      {/* Entrance — click selects the whole building */}
      <mesh position={[0, 0.9, d / 2 + 0.35]}
        onClick={(e) => { e.stopPropagation(); onSelectBuilding(building); }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredId('__entrance__'); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}>
        <boxGeometry args={[Math.min(4, w * 0.3), 1.8, 0.7]} />
        <meshStandardMaterial color={isBuildingSelected ? '#FF1E3C' : '#2A2A35'}
          emissive={isBuildingSelected ? '#FF1E3C' : '#000000'} emissiveIntensity={isBuildingSelected ? 0.3 : 0} />
      </mesh>

      {/* Building selection highlight */}
      {isBuildingSelected && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w + 0.6, h, d + 0.6]} />
          <meshBasicMaterial color="#FF1E3C" wireframe transparent opacity={0.35} />
        </mesh>
      )}

      {/* Building label */}
      {showLabels && (
        <Text position={[0, h + (building.isHouse ? 1.6 : 2.6), 0]} fontSize={isRef ? 2.2 : 1.4}
          color={isRef ? '#FF1E3C' : '#94A3B8'} anchorX="center" anchorY="bottom"
          outlineWidth={0.12} outlineColor="#0A0A0F">
          {building.name}
        </Text>
      )}
    </group>
  );
}

// Scene
function NeighborhoodScene({ parcels, buildings, units, roads, greenSpaces, centerLat, centerLng, selectedParcel, selectedBuilding, selectedFloor, selectedUnit, onSelectParcel, onSelectBuilding, onSelectFloor, onSelectUnit, showFloors, showUnits, showNeighborhood, showLabels, showUnderground, cameraFocus }) {
  const refBuilding = buildings.find(b => b.isReference);
  const neighborhoodBuildings = buildings.filter(b => !b.isReference);

  // Pre-group units by building for fast lookup.
  const unitsByBuilding = useMemo(() => {
    const map = {};
    units.forEach((u) => { (map[u.buildingId] = map[u.buildingId] || []).push(u); });
    return map;
  }, [units]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[150, 120, 150]} fov={50} />
      <CameraController focus={cameraFocus} buildings={buildings} units={units} centerLat={centerLat} centerLng={centerLng} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[100, 150, 80]} intensity={0.8} />
      <directionalLight position={[-50, 100, -50]} intensity={0.2} />
      <Ground />
      <Roads roads={roads} centerLat={centerLat} centerLng={centerLng} />
      <GreenSpaces greenSpaces={greenSpaces} centerLat={centerLat} centerLng={centerLng} />
      <Parcels parcels={parcels} centerLat={centerLat} centerLng={centerLng} selectedParcel={selectedParcel} onSelect={onSelectParcel} />

      {refBuilding && (
        <ClickableBuilding
          building={refBuilding} buildingUnits={unitsByBuilding[refBuilding.id] || []}
          centerLat={centerLat} centerLng={centerLng}
          selectedFloor={selectedFloor} selectedUnit={selectedUnit} selectedBuilding={selectedBuilding}
          onSelectFloor={onSelectFloor} onSelectUnit={onSelectUnit} onSelectBuilding={onSelectBuilding}
          showFloors={showFloors} showUnits={showUnits} showLabels={showLabels}
          showUnderground={showUnderground}
        />
      )}

      {showNeighborhood && neighborhoodBuildings.map(b => (
        <ClickableBuilding
          key={b.id} building={b} buildingUnits={unitsByBuilding[b.id] || []}
          centerLat={centerLat} centerLng={centerLng}
          selectedFloor={selectedFloor} selectedUnit={selectedUnit} selectedBuilding={selectedBuilding}
          onSelectFloor={onSelectFloor} onSelectUnit={onSelectUnit} onSelectBuilding={onSelectBuilding}
          showFloors={showFloors} showUnits={showUnits} showLabels={showLabels}
          showUnderground={showUnderground}
        />
      ))}
    </>
  );
}

class SceneErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error('3D Scene Error:', error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gis-card rounded-xl">
          <Box size={48} className="text-gis-error mb-4" />
          <p className="text-gis-ink font-semibold">3D Scene Error</p>
          <p className="text-gis-muted text-sm mt-1">Try refreshing the page.</p>
          <button onClick={() => this.setState({ hasError: false })} className="btn-primary mt-4">Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Map3D = () => {
  const {
    parcels, buildings, roads, greenSpaces, units,
    selectedParcel, selectedBuilding, selectedUnit, selectedFloor,
    selectParcel, selectBuilding, selectUnit, selectApartment, selectFloor, clearSelection,
    showFloors, showUnits, showNeighborhood, showLabels, showUnderground,
    toggleFloors, toggleUnits, toggleNeighborhood, toggleLabels, toggleUnderground,
    cameraFocus, setCameraFocus, setActivePage,
    topologyConflicts, topologyValid, topologyChecked, runTopologyValidation
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const centerLat = 18.5204;
  const centerLng = 73.8567;

  // Clicking an apartment selects it (with building + floor context) and
  // focuses the camera on that exact unit.
  const handleSelectUnit = (building, unit) => {
    selectApartment(unit, building);
    setCameraFocus(`unit:${unit.id}`);
  };

  const handleSelectFloor = (floor, building) => {
    if (building) selectBuilding(building); // set building context (clears floor/unit)
    selectFloor(floor);                     // set floor (clears unit)
  };

  const handleSelectBuilding = (building) => {
    selectBuilding(building);
    setCameraFocus(building.id);
  };

  const buildingCount = buildings.filter(b => !b.isHouse).length;
  const houseCount = buildings.filter(b => b.isHouse).length;

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        {!isInitialized && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gis-bg/80 backdrop-blur-sm">
            <Box size={48} className="text-gis-accent mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-gis-ink mb-2">3D Digital Twin Viewer</h2>
            <p className="text-sm text-gis-muted mb-6">{buildings.length} buildings, every apartment individually selectable</p>
            <Button onClick={() => setIsInitialized(true)}>Initialize 3D Scene</Button>
          </div>
        )}

        {isInitialized && (
          <>
            <div className="w-full h-full">
              <SceneErrorBoundary>
                <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }} performance={{ min: 0.5 }}>
                  <NeighborhoodScene
                    parcels={parcels} buildings={buildings} units={units} roads={roads} greenSpaces={greenSpaces}
                    centerLat={centerLat} centerLng={centerLng}
                    selectedParcel={selectedParcel} selectedBuilding={selectedBuilding}
                    selectedFloor={selectedFloor} selectedUnit={selectedUnit}
                    onSelectParcel={(p) => { selectParcel(p); selectBuilding(null); }}
                    onSelectBuilding={handleSelectBuilding}
                    onSelectFloor={handleSelectFloor} onSelectUnit={handleSelectUnit}
                    showFloors={showFloors} showUnits={showUnits} showNeighborhood={showNeighborhood} showLabels={showLabels}
                    showUnderground={showUnderground}
                    cameraFocus={cameraFocus}
                  />
                </Canvas>
              </SceneErrorBoundary>
            </div>

            {/* Top-left controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" icon={Crosshair} onClick={() => setCameraFocus('reference')}>Focus Reference</Button>
              <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => { setCameraFocus('neighborhood'); clearSelection(); }}>Reset View</Button>
              <Button size="sm" variant={showFloors ? 'primary' : 'secondary'} icon={Layers} onClick={toggleFloors}>Floors</Button>
              <Button size="sm" variant={showUnits ? 'primary' : 'secondary'} icon={Home} onClick={toggleUnits}>Units</Button>
              <Button size="sm" variant={showNeighborhood ? 'primary' : 'secondary'} icon={Building} onClick={toggleNeighborhood}>Neighborhood</Button>
              <Button size="sm" variant={showLabels ? 'primary' : 'secondary'} icon={Tag} onClick={toggleLabels}>Labels</Button>
              <Button size="sm" variant={showUnderground ? 'primary' : 'secondary'} icon={Box} onClick={toggleUnderground}>Underground</Button>
              <Button size="sm" variant={showMiniMap ? 'primary' : 'secondary'} icon={MapIcon} onClick={() => setShowMiniMap(v => !v)}>2D Map</Button>
              <Button size="sm" variant={topologyChecked && !topologyValid ? 'danger' : 'secondary'} icon={topologyChecked && !topologyValid ? AlertTriangle : ShieldCheck} onClick={runTopologyValidation}>
                {topologyChecked && !topologyValid ? `⚠ ${topologyConflicts.length} Conflict${topologyConflicts.length > 1 ? 's' : ''}` : 'Topology Check'}
              </Button>
            </div>

            {/* Bottom-left stats */}
            <div className="absolute bottom-4 left-4 z-10 flex gap-2">
              <div className="bg-gis-card/90 backdrop-blur-sm border border-gis-border rounded-lg px-3 py-2">
                <span className="text-[10px] text-gis-muted uppercase tracking-wider">Buildings</span>
                <p className="text-sm font-bold text-gis-ink">{buildingCount}</p>
              </div>
              <div className="bg-gis-card/90 backdrop-blur-sm border border-gis-border rounded-lg px-3 py-2">
                <span className="text-[10px] text-gis-muted uppercase tracking-wider">Houses</span>
                <p className="text-sm font-bold text-gis-ink">{houseCount}</p>
              </div>
              <div className="bg-gis-card/90 backdrop-blur-sm border border-gis-border rounded-lg px-3 py-2">
                <span className="text-[10px] text-gis-muted uppercase tracking-wider">Units</span>
                <p className="text-sm font-bold text-gis-ink">{units.length}</p>
              </div>
            </div>

            {/* 2D mini-map — a sub-panel of the 3D view */}
            {showMiniMap && <MiniMap onClose={() => setShowMiniMap(false)} />}
          </>
        )}
      </div>

      {/* Info Panel */}
      {sidebarOpen && (
        <div className="w-80 border-l border-gis-border bg-gis-panel overflow-y-auto shrink-0 hidden lg:block">
          <CardHeader>
            <CardTitle>Selection Info</CardTitle>
            <button onClick={() => setSidebarOpen(false)} className="text-gis-muted hover:text-gis-ink"><X size={16} /></button>
          </CardHeader>
          <CardBody>
            {selectedUnit ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gis-accent/10 border border-gis-accent/20 text-center">
                  <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Apartment</span>
                  <p className="text-3xl font-bold text-gis-accent mt-1">{selectedUnit.unitNumber}</p>
                  <p className="text-xs text-gis-muted mt-1">Floor {selectedUnit.floorLevel} - {selectedUnit.type}</p>
                </div>
                <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                  <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider flex items-center gap-1"><Hash size={10} /> Unit ULPIN</span>
                  <p className="font-mono text-xs text-gis-accent font-bold mt-1 break-all">{selectedUnit.ulpin}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Building</span>
                    <p className="text-xs font-bold text-gis-ink mt-1">{buildings.find(b => b.id === selectedUnit.buildingId)?.name || selectedUnit.buildingId}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Floor</span>
                    <p className="text-sm font-bold text-gis-ink mt-1">
                      {selectedUnit.floorLevel < 0 ? "B" + Math.abs(selectedUnit.floorLevel) : selectedUnit.floorLevel}
                      {selectedUnit.floorLevel > 0 && selectedUnit.floorLevel <= (buildings.find(b => b.id === selectedUnit.buildingId)?.floors || 0) && " / " + (buildings.find(b => b.id === selectedUnit.buildingId)?.floors || 0)}
                      {selectedUnit.floorLevel > (buildings.find(b => b.id === selectedUnit.buildingId)?.floors || 0) && " (Air Rights)"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Type</span>
                    <p className="text-sm font-bold text-gis-ink mt-1">{selectedUnit.type}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Category</span>
                    <p className="text-sm font-bold text-gis-ink mt-1 capitalize">{selectedUnit.unitCategory || 'residential'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Area</span>
                    <p className="text-sm font-bold text-gis-ink mt-1">{selectedUnit.area.toLocaleString()} m2</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Elevation</span>
                    <p className="text-sm font-bold text-gis-ink mt-1">
                      {selectedUnit.zBottom !== undefined ? `${selectedUnit.zBottom.toFixed(1)} – ${selectedUnit.zTop.toFixed(1)} m` : `${((selectedUnit.floorLevel - 0.5) * (buildings.find(b => b.id === selectedUnit.buildingId)?.floorHeight || 3)).toFixed(1)} m`}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border col-span-2">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Status</span>
                    <p className={`text-sm font-bold mt-1 ${selectedUnit.status === 'Occupied' ? 'text-gis-success' : selectedUnit.status === 'Vacant' ? 'text-gis-warning' : 'text-gis-error'}`}>{selectedUnit.status}</p>
                  </div>
                </div>

                {/* Underground-specific info */}
                {selectedUnit.unitCategory === 'underground' && (
                  <>
                    <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                      <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Depth</span>
                      <p className="text-sm font-bold text-gis-ink mt-1">{selectedUnit.depth || Math.abs(selectedUnit.zBottom || 0).toFixed(1)} m below ground</p>
                    </div>
                    {selectedUnit.metadata && (
                      <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                        <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Metadata</span>
                        <div className="mt-1 space-y-1">
                          {selectedUnit.metadata.basementLevel && (
                            <p className="text-xs text-gis-ink">Basement Level: B{Math.abs(selectedUnit.metadata.basementLevel)}</p>
                          )}
                          {selectedUnit.metadata.parkingSpace && (
                            <p className="text-xs text-gis-ink">Parking Space: {selectedUnit.metadata.parkingSpace}</p>
                          )}
                          {selectedUnit.metadata.ceilingHeight && (
                            <p className="text-xs text-gis-ink">Ceiling Height: {selectedUnit.metadata.ceilingHeight} m</p>
                          )}
                          {selectedUnit.metadata.tunnelType && (
                            <p className="text-xs text-gis-ink">Tunnel Type: {selectedUnit.metadata.tunnelType}</p>
                          )}
                          {selectedUnit.metadata.corridorId && (
                            <p className="text-xs text-gis-ink">Corridor: {selectedUnit.metadata.corridorId}</p>
                          )}
                          {selectedUnit.metadata.stationName && (
                            <p className="text-xs text-gis-ink">Station: {selectedUnit.metadata.stationName}</p>
                          )}
                          {selectedUnit.metadata.platformArea && (
                            <p className="text-xs text-gis-ink">Platform Area: {selectedUnit.metadata.platformArea} m²</p>
                          )}
                          {selectedUnit.metadata.lines && (
                            <p className="text-xs text-gis-ink">Lines: {selectedUnit.metadata.lines.join(', ')}</p>
                          )}
                          {selectedUnit.metadata.startCoordinate && (
                            <p className="text-xs text-gis-ink font-mono text-[10px]">
                              Start: ({selectedUnit.metadata.startCoordinate.x}, {selectedUnit.metadata.startCoordinate.y}, {selectedUnit.metadata.startCoordinate.z})
                            </p>
                          )}
                          {selectedUnit.metadata.endCoordinate && (
                            <p className="text-xs text-gis-ink font-mono text-[10px]">
                              End: ({selectedUnit.metadata.endCoordinate.x}, {selectedUnit.metadata.endCoordinate.y}, {selectedUnit.metadata.endCoordinate.z})
                            </p>
                          )}
                          {selectedUnit.metadata.width && (
                            <p className="text-xs text-gis-ink">Width: {selectedUnit.metadata.width} m</p>
                          )}
                          {selectedUnit.metadata.height && (
                            <p className="text-xs text-gis-ink">Height: {selectedUnit.metadata.height} m</p>
                          )}
                          {selectedUnit.metadata.utilities && (
                            <p className="text-xs text-gis-ink">Utilities: {selectedUnit.metadata.utilities.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                  <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Building ULPIN</span>
                  <p className="font-mono text-xs text-gis-ink font-bold mt-1">{buildings.find(b => b.id === selectedUnit.buildingId)?.ulpin}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setActivePage('ulpin')}>Full ULPIN</Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
                </div>
              </div>
            ) : selectedFloor ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gis-accent/10 border border-gis-accent/20 text-center">
                  <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Floor</span>
                  <p className="text-3xl font-bold text-gis-accent mt-1">Floor {selectedFloor}</p>
                </div>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {units.filter(u => u.buildingId === selectedBuilding?.id && u.floorLevel === selectedFloor).map(u => (
                    <div key={u.id} onClick={() => handleSelectUnit(selectedBuilding, u)}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-gis-surface border border-gis-border hover:border-gis-accent/30 cursor-pointer transition-colors">
                      <div>
                        <span className="text-xs font-bold text-gis-ink">{u.unitNumber}</span>
                        <span className="text-[10px] text-gis-muted ml-2">{u.type}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${u.status === 'Occupied' ? 'text-gis-success' : u.status === 'Vacant' ? 'text-gis-warning' : 'text-gis-error'}`}>{u.status}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="ghost" className="w-full" onClick={clearSelection}>Clear Selection</Button>
              </div>
            ) : selectedBuilding ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                  <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Building ULPIN</span>
                  <p className="font-mono text-xs text-gis-accent font-bold mt-1">{selectedBuilding.ulpin}</p>
                </div>
                <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                  <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Name</span>
                  <p className="text-sm font-bold text-gis-ink mt-1">{selectedBuilding.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Type</span>
                    <p className="text-xs font-bold text-gis-ink mt-1">{selectedBuilding.type}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Floors</span>
                    <p className="text-xs font-bold text-gis-ink mt-1">{selectedBuilding.floors}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Height</span>
                    <p className="text-xs font-bold text-gis-ink mt-1">{selectedBuilding.height} m</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Total Units</span>
                    <p className="text-xs font-bold text-gis-ink mt-1">{units.filter(u => u.buildingId === selectedBuilding.id).length}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setActivePage('ulpin')}>ULPIN Hierarchy</Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
                </div>
              </div>
            ) : selectedParcel ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                  <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Parcel ULPIN</span>
                  <p className="font-mono text-xs text-gis-accent font-bold mt-1">{selectedParcel.ulpin}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Land Use</span>
                    <p className="text-xs font-bold text-gis-ink mt-1">{selectedParcel.landUse}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Area</span>
                    <p className="text-xs font-bold text-gis-ink mt-1">{selectedParcel.area.toLocaleString()} m2</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setActivePage('map2d')}>View 2D</Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building size={40} className="mx-auto text-gis-muted/30 mb-3" />
                <p className="text-sm text-gis-muted">Click any building, floor, or apartment</p>
                <p className="text-xs text-gis-muted/60 mt-1">All {buildings.length} structures are interactive</p>
              </div>
            )}

            {/* ─── Topology Conflicts ─── */}
            {topologyChecked && !topologyValid && (
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg bg-gis-error/10 border border-gis-error/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-gis-error" />
                    <span className="text-xs font-bold text-gis-error uppercase tracking-wider">3D Topology Conflict{topologyConflicts.length > 1 ? 's' : ''} Detected</span>
                  </div>
                  <div className="space-y-2">
                    {topologyConflicts.map((c, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-gis-error/5 border border-gis-error/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] text-gis-error font-bold">{c.unitA}</span>
                          <span className="text-[10px] text-gis-muted">↔</span>
                          <span className="font-mono text-[10px] text-gis-error font-bold">{c.unitB}</span>
                        </div>
                        <p className="text-[10px] text-gis-muted">{c.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-gis-muted uppercase tracking-wider">Type:</span>
                          <span className="text-[9px] font-bold text-gis-ink">{c.type}</span>
                          <span className="text-[9px] text-gis-muted uppercase tracking-wider ml-2">Intersection:</span>
                          <span className="text-[9px] font-bold text-gis-ink">{c.intersectionVolume.toFixed(1)} m³</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {topologyChecked && topologyValid && (
              <div className="mt-4 p-3 rounded-lg bg-gis-success/10 border border-gis-success/20">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-gis-success" />
                  <span className="text-xs font-bold text-gis-success uppercase tracking-wider">Topology Valid</span>
                </div>
                <p className="text-[10px] text-gis-muted mt-1">No 3D bounding-box conflicts detected across all units.</p>
              </div>
            )}
          </CardBody>
        </div>
      )}
    </div>
  );
};

export default Map3D;
