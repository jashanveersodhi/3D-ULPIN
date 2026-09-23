import { generate3DIdentifier, generatePropertyId } from '../utils/identifiers';

const INITIAL_BUILDINGS = [
  {
    id: 'B001',
    code: 'ESB',
    name: 'Empire State Building',
    address: '350 Fifth Avenue, New York City',
    city: 'New York',
    floors: 102,
    height: 380,
    type: 'Commercial',
    status: 'Validated',
  },
  {
    id: 'B002',
    code: 'SKY',
    name: 'Skyline Residency',
    address: 'Baner Road, Pune',
    city: 'Pune',
    floors: 20,
    height: 65,
    type: 'Residential',
    status: 'Validated',
  },
  {
    id: 'B003',
    code: 'TP1',
    name: 'TechPark One',
    address: 'Hinjewadi Phase 1, Pune',
    city: 'Pune',
    floors: 12,
    height: 45,
    type: 'Commercial',
    status: 'Validated',
  },
];

const PROPERTY_TYPES = [
  'Residential',
  'Commercial',
  'Office',
  'Retail',
  'Parking',
  'Common Area',
];

export const initStore = () => {
  const savedBuildings = localStorage.getItem('ulpin_buildings');
  const savedProperties = localStorage.getItem('ulpin_properties');

  let buildings = savedBuildings
    ? JSON.parse(savedBuildings)
    : INITIAL_BUILDINGS;

  let properties = savedProperties
    ? JSON.parse(savedProperties)
    : generateInitialProperties(buildings);

  localStorage.setItem('ulpin_buildings', JSON.stringify(buildings));
  localStorage.setItem('ulpin_properties', JSON.stringify(properties));

  return { buildings, properties };
};

function generateInitialProperties(buildings) {
  const props = [];

  buildings.forEach(b => {
    for (let f = 1; f <= b.floors; f++) {
      const floorId = `${b.id}-F${String(f).padStart(3, '0')}`;
      const zBottom = (f - 1) * (b.height / b.floors);
      const zTop = f * (b.height / b.floors);

      // Each floor has 6 units for demo
      for (let u = 1; u <= 6; u++) {
        const unitNum = `${f}${String.fromCharCode(64 + u)}`;
        props.push({
          id: generatePropertyId(b.code, f, u),
          ulpin: generate3DIdentifier(b.code, f, u),
          buildingId: b.id,
          floorId: floorId,
          floor: f,
          unit: unitNum,
          type: PROPERTY_TYPES[(f + u) % PROPERTY_TYPES.length],
          area: 1200 + u * 115 + (f % 7) * 35,
          zBottom: Number(zBottom.toFixed(2)),
          zTop: Number(zTop.toFixed(2)),
          x: Number(((u - 3.5) * 4.8).toFixed(2)),
          y: Number(((u % 3) - 1) * 3.2).toFixed(2),
          z: Number(((zBottom + zTop) / 2).toFixed(2)),
          status: (f % 17 === 0) ? 'Pending' : (f % 29 === 0) ? 'Needs Review' : 'Validated',
          updated: '2026-09-11',
          occupancy: (f + u) % 3 === 0 ? 'Vacant' : 'Occupied',
        });
      }
    }
  });

  return props;
}

export { PROPERTY_TYPES };
