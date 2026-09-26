import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Maximize2, X } from 'lucide-react';
import { useStore } from '../../data/store';

// Fix default marker icons (Leaflet + Vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * MiniMap — a 2D Leaflet map embedded as a sub-panel of the 3D viewer.
 * It mirrors the current selection and lets the user jump to the full 2D page.
 */
const MiniMap = ({ onClose }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const {
    parcels, buildings, roads, greenSpaces,
    selectedParcel, selectedBuilding, selectParcel, selectBuilding,
    setActivePage,
  } = useStore();

  // Initialize the Leaflet map once.
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [18.5204, 73.8567],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Rebuild layers when data / selection / layers change.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(layersRef.current).forEach((group) => map.removeLayer(group));
    layersRef.current = {};

    const roadsGroup = L.layerGroup();
    roads.forEach((road) => {
      L.polyline(road.path, {
        color: road.type === 'primary' ? '#4B5563' : '#374151',
        weight: road.width || 4,
        opacity: 0.85,
      }).addTo(roadsGroup);
    });
    roadsGroup.addTo(map);
    layersRef.current.roads = roadsGroup;

    const greenGroup = L.layerGroup();
    greenSpaces.forEach((gs) => {
      L.polygon(gs.polygon, {
        color: '#10B981', fillColor: '#10B981', fillOpacity: 0.18, weight: 1, opacity: 0.6,
      }).addTo(greenGroup);
    });
    greenGroup.addTo(map);
    layersRef.current.greenSpaces = greenGroup;

    const parcelGroup = L.layerGroup();
    parcels.forEach((parcel) => {
      const isSelected = selectedParcel?.id === parcel.id;
      const poly = L.polygon(parcel.polygon, {
        color: isSelected ? '#FF1E3C' : '#1E40AF',
        fillColor: isSelected ? '#FF1E3C' : '#1E40AF',
        fillOpacity: isSelected ? 0.35 : 0.12,
        weight: isSelected ? 3 : 1.5,
        opacity: isSelected ? 1 : 0.75,
      }).addTo(parcelGroup);
      poly.on('click', () => { selectParcel(parcel); selectBuilding(null); });
      poly.bindTooltip(
        `<div style="font-family:Inter;font-size:11px;">
          <strong>${parcel.ulpin}</strong><br/>${parcel.landUse} • ${parcel.area} m²
        </div>`,
        { className: 'bg-gis-card text-gis-ink border border-gis-border', direction: 'top' }
      );
    });
    parcelGroup.addTo(map);
    layersRef.current.parcels = parcelGroup;

    const bldgGroup = L.layerGroup();
    buildings.forEach((b) => {
      const isSelected = selectedBuilding?.id === b.id;
      const poly = L.polygon(b.polygon, {
        color: isSelected ? '#FF1E3C' : '#7C3AED',
        fillColor: isSelected ? '#FF1E3C' : '#7C3AED',
        fillOpacity: isSelected ? 0.4 : 0.22,
        weight: isSelected ? 3 : 1,
        opacity: isSelected ? 1 : 0.65,
      }).addTo(bldgGroup);
      poly.on('click', () => { selectBuilding(b); selectParcel(null); });
      poly.bindTooltip(
        `<div style="font-family:Inter;font-size:11px;">
          <strong>${b.name}</strong><br/>${b.floors} floors • ${b.ulpin}
        </div>`,
        { className: 'bg-gis-card text-gis-ink border border-gis-border', direction: 'top' }
      );
    });
    bldgGroup.addTo(map);
    layersRef.current.buildings = bldgGroup;
  }, [parcels, buildings, roads, greenSpaces, selectedParcel, selectedBuilding, selectParcel, selectBuilding]);

  // Keep the map sized correctly when the panel mounts.
  useEffect(() => {
    const t = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute bottom-4 right-4 z-20 w-72 sm:w-80 rounded-xl overflow-hidden border border-gis-border shadow-2xl shadow-black/50 bg-gis-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gis-border bg-gis-card/80">
        <span className="text-xs font-semibold text-gis-ink flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gis-accent" />
          2D Map
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActivePage('map2d')}
            className="p-1.5 rounded-md text-gis-muted hover:text-gis-ink hover:bg-gis-surface transition-colors"
            title="Open full 2D map"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gis-muted hover:text-gis-ink hover:bg-gis-surface transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div ref={mapRef} className="w-full h-52 sm:h-60 z-0" />
    </div>
  );
};

export default MiniMap;
