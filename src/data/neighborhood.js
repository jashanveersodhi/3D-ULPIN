// Procedural neighborhood generator — dense residential cluster where every
// apartment is an individual selectable 3D unit with its own unique ULPIN.
//
// Hierarchy: Neighborhood → Parcel → Building → Floor → Apartment (ULPIN)
// Extended: Underground units (ULP-UG-...) and Air-rights units (ULP-AR-...)

import { validateTopology } from '../utils/validation';

const LAND_USES = ['Residential', 'Commercial', 'Mixed-Use', 'Institutional'];
const BUILDING_TYPES = ['Apartment', 'Office', 'Retail', 'Warehouse'];
const UNIT_TYPES = ['1BHK', '2BHK', '3BHK', 'Studio', 'Office'];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateUlpin(prefix, ...parts) {
  return `ULP-${prefix}-${parts.join('-')}`;
}

// Convert lat/lng to 3D scene coordinates (same formula as Map3D.jsx).
function latLngTo3D(lat, lng, centerLat, centerLng) {
  const scale = 111000;
  return [(lng - centerLng) * scale * Math.cos(centerLat * Math.PI / 180), 0, -(lat - centerLat) * scale];
}

// Compute the 3D axis-aligned bounding box for a unit, replicating the exact
// layout algorithm used by ClickableBuilding in Map3D.jsx so that bounds and
// rendering are always consistent.
function computeUnitBounds(building, unit, floorUnits, centerLat, centerLng) {
  const [cx, , cz] = latLngTo3D(building.position.lat, building.position.lng, centerLat, centerLng);
  const w = building.width;
  const d = building.depth;
  const fh = building.floorHeight;

  const n = floorUnits.length;
  const cols = Math.min(n, 4);
  const rows = Math.ceil(n / cols);
  const uw = w / cols - 0.3;
  const ud = d / rows - 0.3;

  const i = floorUnits.indexOf(unit);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const ux = (col - (cols - 1) / 2) * (w / cols);
  const uz = (row - (rows - 1) / 2) * (d / rows);
  const uy = (unit.floorLevel - 0.5) * fh;

  return {
    xMin: cx + ux - uw / 2,
    xMax: cx + ux + uw / 2,
    yMin: uy - (fh - 0.25) / 2,
    yMax: uy + (fh - 0.25) / 2,
    zMin: cz + uz - ud / 2,
    zMax: cz + uz + ud / 2,
  };
}

// Convert a footprint (m²) into realistic building width/depth for the 3D scene.
function footprintDims(footprint) {
  return {
    width: Math.sqrt(footprint) * 1.26, // x axis
    depth: Math.sqrt(footprint) * 0.8,  // z axis
  };
}

// Apartments per floor based on building size (4–8 for towers, 1–2 for houses).
function unitsPerFloorFor(footprint, isHouse) {
  if (isHouse) return 1 + Math.floor(Math.random() * 2);
  if (footprint >= 320) return 8;
  if (footprint >= 260) return 6;
  return 4;
}

export function generateNeighborhood(centerLat = 18.5204, centerLng = 73.8567, seed = 42) {
  const rand = seededRandom(seed);
  const parcels = [];
  const buildings = [];
  const units = [];
  const roads = [];
  const greenSpaces = [];
  const zones = [];
  const surfaceParking = [];

  const refFloors = 15;
  const refFloorHeight = 3.2;
  const refHeight = refFloors * refFloorHeight;
  const refFootprint = 400;

  const refParcelUlpin = 'ULP-P-0001';
  const refBuildingUlpin = 'ULP-B-0001';
  const refParcelId = 'P-0001';
  const refBuildingId = 'P-0001-B01';

  // Dense residential cluster — buildings packed with realistic street spacing.
  // Positions are offsets (degrees) from the neighborhood center.
  //   0.0001° lat ≈ 11.1 m,  0.0001° lng ≈ 10.5 m  (at 18.5°N)
  const surroundingBuildings = [
    // Inner ring — close to the reference tower (~20–35 m gaps)
    { dLat: -0.0004, dLng: -0.0005, floors: 12, footprint: 300, type: 'Apartment', name: 'Sunrise Residency' },
    { dLat: -0.0004, dLng: 0.0005,  floors: 10, footprint: 280, type: 'Apartment', name: 'Green Valley Apartments' },
    { dLat: 0.0004,  dLng: -0.0005, floors: 14, footprint: 260, type: 'Apartment', name: 'Lakeview Heights' },
    { dLat: 0.0004,  dLng: 0.0005,  floors: 11, footprint: 340, type: 'Mixed-Use',   name: 'Central Plaza Residency' },
    // Outer ring — across the ring road (~70–90 m from center)
    { dLat: -0.0009, dLng: 0,       floors: 9,  footprint: 240, type: 'Apartment', name: 'Maple Court' },
    { dLat: 0.0009,  dLng: 0,       floors: 13, footprint: 300, type: 'Apartment', name: 'Orchid Towers' },
    { dLat: 0,       dLng: -0.0010, floors: 8,  footprint: 220, type: 'Retail',    name: 'High Street Residency' },
    { dLat: 0,       dLng: 0.0010,  floors: 15, footprint: 340, type: 'Apartment', name: 'Skyline Enclave' },
    // Houses on the outskirts
    { dLat: -0.00135, dLng: -0.0004, floors: 2, footprint: 80, type: 'Residential', name: 'Villa A', isHouse: true },
    { dLat: -0.00135, dLng: 0.0004,  floors: 2, footprint: 76, type: 'Residential', name: 'Villa B', isHouse: true },
    { dLat: 0.00135,  dLng: -0.0004, floors: 2, footprint: 84, type: 'Residential', name: 'Villa C', isHouse: true },
    { dLat: 0.00135,  dLng: 0.0004,  floors: 2, footprint: 72, type: 'Residential', name: 'Villa D', isHouse: true },
  ];

  // Roads — a grid that frames the blocks (no road cuts through a building).
  const roadOffsets = [-0.0035, -0.0020, -0.0012, -0.0007, 0.0007, 0.0012, 0.0020, 0.0035];
  roadOffsets.forEach((offset, i) => {
    // Inner ring road (±0.0007) is the primary; others secondary.
    const isPrimary = Math.abs(offset) === 0.0007;
    const abs = Math.abs(offset);
    const tag = abs === 0.0007 ? 'Ring' : abs === 0.0012 ? 'Cross' : 'Outer';
    roads.push({
      id: `RD-H-${String(i + 1).padStart(3, '0')}`,
      type: isPrimary ? 'primary' : 'secondary',
      name: isPrimary ? `Main Ring Road ${offset > 0 ? 'E' : 'W'}` : `Street ${tag} ${offset > 0 ? '+' : '-'}${i}`,
      path: [
        [centerLat + offset, centerLng - 0.0045],
        [centerLat + offset, centerLng + 0.0045],
      ],
      width: isPrimary ? 10 : 5,
    });
    roads.push({
      id: `RD-V-${String(i + 1).padStart(3, '0')}`,
      type: isPrimary ? 'primary' : 'secondary',
      name: isPrimary ? `Central Avenue ${offset > 0 ? 'N' : 'S'}` : `Street ${tag} ${offset > 0 ? '+' : '-'}${i}`,
      path: [
        [centerLat - 0.0045, centerLng + offset],
        [centerLat + 0.0045, centerLng + offset],
      ],
      width: isPrimary ? 10 : 5,
    });
  });

  // Green spaces — parks tucked between the outer roads at the diagonals.
  const greenDefs = [
    { id: 'GS-001', name: 'North-East Park', dLat: 0.0028, dLng: 0.0028, area: 2400 },
    { id: 'GS-002', name: 'North-West Park', dLat: 0.0028, dLng: -0.0028, area: 2200 },
    { id: 'GS-003', name: 'South-East Park', dLat: -0.0028, dLng: 0.0028, area: 2000 },
    { id: 'GS-004', name: 'South-West Park', dLat: -0.0028, dLng: -0.0028, area: 1800 },
  ];
  greenDefs.forEach((g) => {
    const half = 0.00032;
    greenSpaces.push({
      id: g.id,
      name: g.name,
      area: g.area,
      polygon: [
        [centerLat + g.dLat - half, centerLng + g.dLng - half],
        [centerLat + g.dLat - half, centerLng + g.dLng + half],
        [centerLat + g.dLat + half, centerLng + g.dLng + half],
        [centerLat + g.dLat + half, centerLng + g.dLng - half],
        [centerLat + g.dLat - half, centerLng + g.dLng - half],
      ],
    });
  });

  // Reference parcel
  const refParcelPoly = [
    [centerLat - 0.0008, centerLng - 0.0008],
    [centerLat - 0.0008, centerLng + 0.0008],
    [centerLat + 0.0008, centerLng + 0.0008],
    [centerLat + 0.0008, centerLng - 0.0008],
    [centerLat - 0.0008, centerLng - 0.0008],
  ];

  // Reference building units — tapered density, one unique ULPIN each.
  for (let f = 1; f <= refFloors; f++) {
    const unitsPerFloor = f <= 5 ? 6 : f <= 10 ? 5 : 4;
    for (let u = 1; u <= unitsPerFloor; u++) {
      const unitType = u === 1 ? '2BHK' : u === 2 ? '1BHK' : u === 3 ? '3BHK' : u <= 5 ? 'Studio' : '2BHK';
      const unitArea = unitType === '1BHK' ? 350 + rand() * 150 :
                        unitType === '2BHK' ? 550 + rand() * 200 :
                        unitType === '3BHK' ? 800 + rand() * 300 :
                        250 + rand() * 100;
      const status = rand() > 0.12 ? 'Occupied' : rand() > 0.5 ? 'Vacant' : 'Under Review';
      units.push({
        id: `${refBuildingId}-F${String(f).padStart(2, '0')}-U${String(u).padStart(2, '0')}`,
        ulpin: generateUlpin('U', '0001', '01', String(f).padStart(2, '0'), String(u).padStart(2, '0')),
        buildingId: refBuildingId,
        parcelId: refParcelId,
        floorLevel: f,
        unitNumber: `${f}${String(u).padStart(2, '0')}`,
        type: unitType,
        area: Math.round(unitArea),
        status,
        position: { lat: centerLat, lng: centerLng, z: f * refFloorHeight },
        unitCategory: 'residential',
      });
    }
  }

  const refDims = footprintDims(refFootprint);
  const refBuilding = {
    id: refBuildingId,
    ulpin: refBuildingUlpin,
    parcelId: refParcelId,
    name: 'Empire State Residency',
    type: 'Mixed-Use',
    footprint: refFootprint,
    width: refDims.width,
    depth: refDims.depth,
    area: Math.round(refFootprint * refFloors * 0.85),
    floors: refFloors,
    floorHeight: refFloorHeight,
    height: Number(refHeight.toFixed(1)),
    confidence: 0.96,
    status: 'Validated',
    position: { lat: centerLat, lng: centerLng },
    polygon: [
      [centerLat - 0.0008, centerLng - 0.0008],
      [centerLat - 0.0008, centerLng + 0.0008],
      [centerLat + 0.0008, centerLng + 0.0008],
      [centerLat + 0.0008, centerLng - 0.0008],
    ],
    isReference: true,
    isHouse: false,
  };
  buildings.push(refBuilding);

  parcels.push({
    id: refParcelId,
    ulpin: refParcelUlpin,
    landUse: 'Mixed-Use',
    area: 2450,
    coordinates: { lat: centerLat, lng: centerLng },
    polygon: refParcelPoly,
    buildings: [refBuilding],
    status: 'Validated',
    buildingCount: 1,
  });

  // Surrounding buildings + houses — ALL get floors and individually-mapped units.
  surroundingBuildings.forEach((cfg, idx) => {
    const pIdx = idx + 2;
    const parcelId = `P-${String(pIdx).padStart(4, '0')}`;
    const buildingId = `${parcelId}-B01`;
    const bLat = centerLat + cfg.dLat;
    const bLng = centerLng + cfg.dLng;
    const floorHeight = cfg.isHouse ? 2.8 : 3 + rand() * 0.5;
    const height = cfg.floors * floorHeight;
    const confidence = cfg.isHouse ? 0.92 : 0.82 + rand() * 0.16;
    const dims = footprintDims(cfg.footprint);

    const parcelPoly = [
      [bLat - 0.0008, bLng - 0.0008],
      [bLat - 0.0008, bLng + 0.0008],
      [bLat + 0.0008, bLng + 0.0008],
      [bLat + 0.0008, bLng - 0.0008],
      [bLat - 0.0008, bLng - 0.0008],
    ];

    const building = {
      id: buildingId,
      ulpin: generateUlpin('B', String(pIdx).padStart(4, '0'), '01'),
      parcelId,
      name: cfg.name,
      type: cfg.type,
      footprint: cfg.footprint,
      width: dims.width,
      depth: dims.depth,
      area: Math.round(cfg.footprint * cfg.floors * 0.8),
      floors: cfg.floors,
      floorHeight: Number(floorHeight.toFixed(1)),
      height: Number(height.toFixed(1)),
      confidence: Number(confidence.toFixed(2)),
      status: 'Validated',
      position: { lat: bLat, lng: bLng },
      polygon: [
        [bLat - 0.0004, bLng - 0.0004],
        [bLat - 0.0004, bLng + 0.0004],
        [bLat + 0.0004, bLng + 0.0004],
        [bLat + 0.0004, bLng - 0.0004],
      ],
      isReference: false,
      isHouse: !!cfg.isHouse,
    };
    buildings.push(building);

    // Units for EVERY building — one unique ULPIN per apartment.
    const unitsPerFloor = unitsPerFloorFor(cfg.footprint, cfg.isHouse);
    for (let f = 1; f <= cfg.floors; f++) {
      for (let u = 1; u <= unitsPerFloor; u++) {
        const unitType = cfg.isHouse ? (u === 1 ? '2BHK' : '3BHK')
          : cfg.type === 'Office' ? 'Office'
          : cfg.type === 'Retail' ? (u % 2 ? 'Retail' : 'Studio')
          : UNIT_TYPES[Math.floor(rand() * UNIT_TYPES.length)];
        const unitArea = unitType === '1BHK' ? 350 + rand() * 150 :
                          unitType === '2BHK' ? 550 + rand() * 200 :
                          unitType === '3BHK' ? 800 + rand() * 300 :
                          unitType === 'Studio' ? 250 + rand() * 100 :
                          400 + rand() * 600;
        const status = rand() > 0.12 ? 'Occupied' : rand() > 0.5 ? 'Vacant' : 'Under Review';
        units.push({
          id: `${buildingId}-F${String(f).padStart(2, '0')}-U${String(u).padStart(2, '0')}`,
          ulpin: generateUlpin('U', String(pIdx).padStart(4, '0'), '01', String(f).padStart(2, '0'), String(u).padStart(2, '0')),
          buildingId,
          parcelId,
          floorLevel: f,
          unitNumber: `${f}${String(u).padStart(2, '0')}`,
          type: unitType,
          area: Math.round(unitArea),
          status,
          position: { lat: bLat, lng: bLng, z: f * floorHeight },
          unitCategory: 'residential',
        });
      }
    }

    parcels.push({
      id: parcelId,
      ulpin: generateUlpin('P', String(pIdx).padStart(4, '0')),
      landUse: cfg.type,
      area: Math.round(400 + rand() * 800),
      coordinates: { lat: bLat, lng: bLng },
      polygon: parcelPoly,
      buildings: [building],
      status: 'Validated',
      buildingCount: 1,
    });
  });

  // ─── Zones ─────────────────────────────────────────────────────────────────
  const zoneDefs = [
    { id: 'Z-01', name: 'Residential Zone A', dLat: -0.0006, dLng: 0, area: 12000 },
    { id: 'Z-02', name: 'Residential Zone B', dLat: 0.0006, dLng: 0, area: 10000 },
    { id: 'Z-03', name: 'Commercial Zone', dLat: 0, dLng: -0.0008, area: 8000 },
    { id: 'Z-04', name: 'Mixed-Use Zone', dLat: 0, dLng: 0.0008, area: 9000 },
  ];
  zoneDefs.forEach((z) => {
    zones.push({
      id: z.id,
      name: z.name,
      area: z.area,
      center: { lat: centerLat + z.dLat, lng: centerLng + z.dLng },
      polygon: [
        [centerLat + z.dLat - 0.0006, centerLng + z.dLng - 0.0006],
        [centerLat + z.dLat - 0.0006, centerLng + z.dLng + 0.0006],
        [centerLat + z.dLat + 0.0006, centerLng + z.dLng + 0.0006],
        [centerLat + z.dLat + 0.0006, centerLng + z.dLng - 0.0006],
      ],
    });
  });

  // ─── Surface Parking ──────────────────────────────────────────────────────
  const parkingDefs = [
    { id: 'SP-001', name: 'Central Parking Lot', dLat: -0.0002, dLng: -0.0003, spaces: 12, area: 240 },
    { id: 'SP-002', name: 'East Side Parking', dLat: 0.0003, dLng: 0.0004, spaces: 8, area: 160 },
    { id: 'SP-003', name: 'West Side Parking', dLat: 0.0003, dLng: -0.0004, spaces: 10, area: 200 },
  ];
  parkingDefs.forEach((p) => {
    const pLat = centerLat + p.dLat;
    const pLng = centerLng + p.dLng;
    surfaceParking.push({
      id: p.id,
      ulpin: generateUlpin('SP', p.id.split('-')[1]),
      name: p.name,
      area: p.area,
      spaces: p.spaces,
      position: { lat: pLat, lng: pLng },
      polygon: [
        [pLat - 0.00015, pLng - 0.0002],
        [pLat - 0.00015, pLng + 0.0002],
        [pLat + 0.00015, pLng + 0.0002],
        [pLat + 0.00015, pLng - 0.0002],
      ],
      status: 'Operational',
    });
  });

  // ─── Underground Infrastructure ─────────────────────────────────────────────
  // Multi-level basements, parking, metro tunnel, station, and utility tunnels.
  // All underground units have zBottom < 0 (below ground level).

  // Multi-level basements with parking for the reference building
  const basementLevels = [
    { level: -1, name: 'Basement 1', type: 'Parking', spaces: 6 },
    { level: -2, name: 'Basement 2', type: 'Parking', spaces: 4 },
    { level: -3, name: 'Basement 3', type: 'Utility', spaces: 2 },
  ];

  basementLevels.forEach((basement) => {
    for (let i = 1; i <= basement.spaces; i++) {
      const isParking = basement.type === 'Parking';
      units.push({
        id: `${refBuildingId}-B${Math.abs(basement.level)}-P${String(i).padStart(2, '0')}`,
        ulpin: generateUlpin('U', '0001', '01', `B${Math.abs(basement.level)}`, `P${String(i).padStart(2, '0')}`),
        buildingId: refBuildingId,
        parcelId: refParcelId,
        floorLevel: basement.level,
        unitNumber: `B${Math.abs(basement.level)}-P${String(i).padStart(2, '0')}`,
        type: isParking ? 'Parking Space' : 'Utility Area',
        area: isParking ? 12 + rand() * 8 : 80 + rand() * 40,
        status: rand() > 0.3 ? 'Occupied' : 'Vacant',
        position: { lat: centerLat, lng: centerLng, z: basement.level * 3 },
        unitCategory: 'underground',
        depth: Math.abs(basement.level) * 3,
        metadata: {
          basementLevel: basement.level,
          parkingSpace: isParking ? `P${String(i).padStart(3, '0')}` : null,
          ceilingHeight: 2.8,
        },
      });
    }
  });

  // Metro tunnel — deep underground, long horizontal structure
  units.push({
    id: `${refBuildingId}-METRO-TUNNEL`,
    ulpin: generateUlpin('U', '0001', '01', 'METRO', 'TUNNEL'),
    buildingId: refBuildingId,
    parcelId: refParcelId,
    floorLevel: -5,
    unitNumber: 'METRO-TUNNEL',
    type: 'SUBWAY_TUNNEL',
    area: 2000,
    status: 'Operational',
    position: { lat: centerLat, lng: centerLng, z: -13 },
    unitCategory: 'underground',
    depth: 15,
    metadata: {
      tunnelType: 'SUBWAY_TUNNEL',
      corridorId: 'METRO-LINE-1',
      startCoordinate: { x: -100, y: -15, z: 0 },
      endCoordinate: { x: 100, y: -15, z: 0 },
      width: 6,
      height: 4,
    },
    bounds: { xMin: -100, xMax: 100, yMin: -15, yMax: -11, zMin: -3, zMax: 3 },
  });

  // Metro station — connected to tunnel
  units.push({
    id: `${refBuildingId}-METRO-STATION`,
    ulpin: generateUlpin('U', '0001', '01', 'METRO', 'STATION'),
    buildingId: refBuildingId,
    parcelId: refParcelId,
    floorLevel: -5,
    unitNumber: 'METRO-STATION',
    type: 'SUBWAY_STATION',
    area: 500,
    status: 'Operational',
    position: { lat: centerLat, lng: centerLng, z: -13 },
    unitCategory: 'underground',
    depth: 13,
    metadata: {
      stationName: 'Central Metro Station',
      platformArea: 300,
      lines: ['METRO-LINE-1'],
    },
    bounds: { xMin: -15, xMax: 15, yMin: -14, yMax: -10, zMin: -8, zMax: 8 },
  });

  // Utility tunnel — intentional overlap with metro station for topology demo
  units.push({
    id: `${refBuildingId}-UTILITY-TUNNEL`,
    ulpin: generateUlpin('U', '0001', '01', 'UTILITY', 'TUNNEL'),
    buildingId: refBuildingId,
    parcelId: refParcelId,
    floorLevel: -4,
    unitNumber: 'UTILITY-TUNNEL',
    type: 'UTILITY_TUNNEL',
    area: 200,
    status: 'Operational',
    position: { lat: centerLat, lng: centerLng, z: -12 },
    unitCategory: 'underground',
    depth: 12,
    metadata: {
      tunnelType: 'UTILITY_TUNNEL',
      corridorId: 'UTILITY-CORRIDOR-A',
      utilities: ['water', 'electric', 'telecom'],
    },
    // Intentional overlap with metro station for topology demo
    bounds: { xMin: -10, xMax: 10, yMin: -13, yMax: -10, zMin: -5, zMax: 5 },
  });

  // ─── Air-Rights Units (ULP-AR-...) ────────────────────────────────────────
  // Elevated corridors and development zones above the reference building.
  const airRightsUnits = [
    {
      id: `${refBuildingId}-AR-01`,
      ulpin: generateUlpin('AR', '0001', '01', 'AR', '01'),
      buildingId: refBuildingId,
      parcelId: refParcelId,
      floorLevel: refFloors + 1,
      unitNumber: 'AR-01',
      type: 'Elevated Corridor',
      area: 200,
      status: 'Vacant',
      position: { lat: centerLat, lng: centerLng, z: refHeight + 2 },
      unitCategory: 'air-rights',
    },
    {
      id: `${refBuildingId}-AR-02`,
      ulpin: generateUlpin('AR', '0001', '01', 'AR', '02'),
      buildingId: refBuildingId,
      parcelId: refParcelId,
      floorLevel: refFloors + 2,
      unitNumber: 'AR-02',
      type: 'Air Rights Development',
      area: 350,
      status: 'Vacant',
      position: { lat: centerLat, lng: centerLng, z: refHeight + 6 },
      unitCategory: 'air-rights',
    },
  ];
  units.push(...airRightsUnits);

  // ─── Compute 3D bounds for all units ─────────────────────────────────────
  // Group units by building + floor so the layout algorithm matches rendering.
  const unitsByBuildingFloor = {};
  units.forEach((u) => {
    const key = `${u.buildingId}-F${u.floorLevel}`;
    (unitsByBuildingFloor[key] = unitsByBuildingFloor[key] || []).push(u);
  });

  const buildingMap = {};
  buildings.forEach((b) => { buildingMap[b.id] = b; });

  units.forEach((u) => {
    // Use manually-set bounds if provided (e.g. the intentional conflict unit)
    if (u.bounds) {
      u.zBottom = u.bounds.yMin;
      u.zTop = u.bounds.yMax;
      return;
    }
    const key = `${u.buildingId}-F${u.floorLevel}`;
    const floorUnits = unitsByBuildingFloor[key];
    const building = buildingMap[u.buildingId];
    u.bounds = computeUnitBounds(building, u, floorUnits, centerLat, centerLng);
    u.zBottom = u.bounds.yMin;
    u.zTop = u.bounds.yMax;
  });

  // ─── Topology Validation ─────────────────────────────────────────────────
  const topologyResult = validateTopology(units);
  if (!topologyResult.valid) {
    console.warn(`[validateNeighborhood] ${topologyResult.conflicts.length} 3D topology conflict(s) detected:`);
    topologyResult.conflicts.forEach((c) => {
      console.warn(`  ⚠ ${c.unitA} ↔ ${c.unitB}: ${c.details}`);
    });
  }

  const neighborhood = {
    id: 'NB-001',
    name: 'Demo Neighborhood',
    ulpin: 'ULP-NB-0001',
    center: { lat: centerLat, lng: centerLng },
    referenceBuildingId: refBuildingId,
    parcels,
    buildings,
    units,
    roads,
    greenSpaces,
    zones,
    surfaceParking,
  };

  validateNeighborhood(neighborhood);
  return neighborhood;
}

// Development-time data-integrity check. Throws on duplicate ULPINs (a real bug
// that must never be silently hidden) and logs any apartments missing fields.
export function validateNeighborhood(n) {
  const seen = new Map();
  let duplicates = 0;
  let incomplete = 0;

  for (const u of n.units) {
    const missing = [];
    if (u.unitNumber === undefined || u.unitNumber === null) missing.push('apartmentNumber');
    if (u.floorLevel === undefined || u.floorLevel === null) missing.push('floor');
    if (!u.buildingId) missing.push('buildingId');
    if (!u.ulpin) missing.push('ulpin');
    if (missing.length) {
      incomplete++;
      console.error(`[validateNeighborhood] apartment ${u.id} missing: ${missing.join(', ')}`);
    }
    if (u.ulpin) {
      if (seen.has(u.ulpin)) {
        duplicates++;
        console.error(`[validateNeighborhood] DUPLICATE ULPIN "${u.ulpin}" on ${u.id} and ${seen.get(u.ulpin)}`);
      } else {
        seen.set(u.ulpin, u.id);
      }
    }
  }

  if (duplicates > 0) {
    throw new Error(`[validateNeighborhood] ${duplicates} duplicate ULPIN(s) detected — one flat must never share a ULPIN.`);
  }
  if (incomplete > 0) {
    console.warn(`[validateNeighborhood] ${incomplete} apartment(s) missing required fields.`);
  }

  // Topology summary
  const topo = validateTopology(n.units);
  const underground = n.units.filter(u => u.unitCategory === 'underground').length;
  const airRights = n.units.filter(u => u.unitCategory === 'air-rights').length;
  console.log(`[validateNeighborhood] OK — ${n.units.length} apartments (${underground} underground, ${airRights} air-rights), ${seen.size} unique ULPINs.`);
  if (!topo.valid) {
    console.warn(`[validateNeighborhood] ${topo.conflicts.length} 3D topology conflict(s) — see above for details.`);
  }
}
