import { create } from 'zustand';
import { generateNeighborhood } from './neighborhood';

const DEMO_NEIGHBORHOOD = generateNeighborhood();

const INITIAL_STATE = {
  activePage: 'dashboard',
  sidebarCollapsed: false,

  neighborhood: DEMO_NEIGHBORHOOD,
  parcels: DEMO_NEIGHBORHOOD.parcels,
  buildings: DEMO_NEIGHBORHOOD.buildings,
  units: DEMO_NEIGHBORHOOD.units,
  roads: DEMO_NEIGHBORHOOD.roads,
  greenSpaces: DEMO_NEIGHBORHOOD.greenSpaces,

  // Selection
  selectedParcel: null,
  selectedBuilding: null,
  selectedUnit: null,
  selectedFloor: null,

  // 3D layer toggles
  showFloors: true,
  showUnits: true,
  showNeighborhood: true,
  showLabels: true,

  // Camera focus
  cameraFocus: 'neighborhood', // 'reference' | 'neighborhood' | buildingId | 'unit:<id>'

  // Map state
  mapCenter: [DEMO_NEIGHBORHOOD.center.lat, DEMO_NEIGHBORHOOD.center.lng],
  mapZoom: 15,
  activeMapLayers: {
    parcels: true,
    buildings: true,
    roads: true,
    greenSpaces: true,
    units: false,
  },

  // Extraction
  extractionResults: null,
  isExtracting: false,
  extractionStep: '',
  extractionProgress: 0,

  // Activity log
  activities: [
    { id: 1, message: 'Neighborhood data loaded — 1 reference + 8 buildings + 4 houses', type: 'info', timestamp: new Date().toISOString() },
    { id: 2, message: '15-floor reference building with 75 units generated', type: 'success', timestamp: new Date().toISOString() },
    { id: 3, message: 'All ULPINs generated hierarchically', type: 'success', timestamp: new Date().toISOString() },
    { id: 4, message: 'Demo mode — no real AI backend connected', type: 'warning', timestamp: new Date().toISOString() },
  ],

  // Filters
  searchQuery: '',
  landUseFilter: '',
  statusFilter: '',

  // Spatial data layers
  spatialLayers: [
    { id: 'parcels', name: 'Parcels', visible: true, count: DEMO_NEIGHBORHOOD.parcels.length },
    { id: 'buildings', name: 'Buildings', visible: true, count: DEMO_NEIGHBORHOOD.buildings.length },
    { id: 'roads', name: 'Roads', visible: true, count: DEMO_NEIGHBORHOOD.roads.length },
    { id: 'units', name: 'Property Units', visible: false, count: DEMO_NEIGHBORHOOD.units.length },
    { id: 'greenSpaces', name: 'Green Spaces', visible: true, count: DEMO_NEIGHBORHOOD.greenSpaces.length },
  ],
};

export const useStore = create((set, get) => ({
  ...INITIAL_STATE,

  setActivePage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  selectParcel: (parcel) => set({ selectedParcel: parcel, selectedBuilding: null, selectedUnit: null, selectedFloor: null }),
  selectBuilding: (building) => set({ selectedBuilding: building, selectedUnit: null, selectedFloor: null }),
  selectUnit: (unit) => set({ selectedUnit: unit }),
  // Select an apartment together with its building + floor context (used by 3D unit clicks).
  selectApartment: (unit, building) => set({
    selectedUnit: unit,
    selectedBuilding: building || null,
    selectedFloor: unit ? unit.floorLevel : null,
    selectedParcel: null,
  }),
  selectFloor: (floor) => set({ selectedFloor: floor, selectedUnit: null }),
  clearSelection: () => set({ selectedParcel: null, selectedBuilding: null, selectedUnit: null, selectedFloor: null }),

  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  toggleMapLayer: (layerId) => set((s) => ({
    activeMapLayers: { ...s.activeMapLayers, [layerId]: !s.activeMapLayers[layerId] }
  })),

  // 3D layer toggles
  toggleFloors: () => set((s) => ({ showFloors: !s.showFloors })),
  toggleUnits: () => set((s) => ({ showUnits: !s.showUnits })),
  toggleNeighborhood: () => set((s) => ({ showNeighborhood: !s.showNeighborhood })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),

  setCameraFocus: (focus) => set({ cameraFocus: focus }),

  startExtraction: () => set({ isExtracting: true, extractionProgress: 0, extractionStep: 'Initializing...' }),
  updateExtraction: (step, progress) => set({ extractionStep: step, extractionProgress: progress }),
  completeExtraction: (results) => set({
    isExtracting: false,
    extractionResults: results,
    extractionProgress: 100,
    extractionStep: 'Complete',
    activities: [...get().activities, {
      id: Date.now(),
      message: `AI extraction complete — ${results.buildings.length} buildings detected`,
      type: 'success',
      timestamp: new Date().toISOString(),
    }],
  }),
  resetExtraction: () => set({ isExtracting: false, extractionResults: null, extractionProgress: 0, extractionStep: '' }),

  addActivity: (message, type = 'info') => set((s) => ({
    activities: [...s.activities, { id: Date.now(), message, type, timestamp: new Date().toISOString() }],
  })),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setLandUseFilter: (f) => set({ landUseFilter: f }),
  setStatusFilter: (f) => set({ statusFilter: f }),

  toggleSpatialLayer: (layerId) => set((s) => ({
    spatialLayers: s.spatialLayers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l),
  })),

  generateUlpinForParcel: (parcelId) => {
    const parcel = get().parcels.find(p => p.id === parcelId);
    if (parcel) {
      get().addActivity(`ULPIN generated for parcel ${parcelId}`, 'success');
      return parcel.ulpin;
    }
    return null;
  },
}));

// Dev-only: expose the store on window so e2e/debug scripts (and the browser
// console) can drive selection and verify the info panel. Stripped in production.
if (import.meta.env.DEV) {
  window.__ULPIN_STORE__ = useStore;
}

// Selectors
export const useParcels = () => useStore((s) => s.parcels);
export const useBuildings = () => useStore((s) => s.buildings);
export const useUnits = () => useStore((s) => s.units);
export const useSelectedParcel = () => useStore((s) => s.selectedParcel);
export const useSelectedBuilding = () => useStore((s) => s.selectedBuilding);
export const useSelectedUnit = () => useStore((s) => s.selectedUnit);
export const useSelectedFloor = () => useStore((s) => s.selectedFloor);
export const useExtractionResults = () => useStore((s) => s.extractionResults);
export const useActivities = () => useStore((s) => s.activities);
export const useMapLayers = () => useStore((s) => s.activeMapLayers);
