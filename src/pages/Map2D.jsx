import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Search, Layers, ZoomIn, ZoomOut, Maximize, Locate, Filter, X, Building, MapPin } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Map2D = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const { parcels, buildings, roads, greenSpaces, activeMapLayers, toggleMapLayer, selectParcel, selectedParcel, setActivePage } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [landUseFilter, setLandUseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredParcels = parcels.filter(p => {
    const matchesSearch = !searchQuery || p.ulpin.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLandUse = !landUseFilter || p.landUse === landUseFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesLandUse && matchesStatus;
  });

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [18.5204, 73.8567],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update layers when data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layers
    Object.values(layersRef.current).forEach(layerGroup => {
      map.removeLayer(layerGroup);
    });
    layersRef.current = {};

    // Roads
    if (activeMapLayers.roads) {
      const roadGroup = L.layerGroup();
      roads.forEach(road => {
        L.polyline(road.path, {
          color: road.type === 'primary' ? '#4B5563' : '#374151',
          weight: road.width || 4,
          opacity: 0.8,
        }).addTo(roadGroup);
      });
      roadGroup.addTo(map);
      layersRef.current.roads = roadGroup;
    }

    // Green spaces
    if (activeMapLayers.greenSpaces) {
      const gsGroup = L.layerGroup();
      greenSpaces.forEach(gs => {
        L.polygon(gs.polygon, {
          color: '#10B981',
          fillColor: '#10B981',
          fillOpacity: 0.15,
          weight: 1,
          opacity: 0.5,
        }).addTo(gsGroup);
      });
      gsGroup.addTo(map);
      layersRef.current.greenSpaces = gsGroup;
    }

    // Parcels
    if (activeMapLayers.parcels) {
      const parcelGroup = L.layerGroup();
      filteredParcels.forEach(parcel => {
        const isSelected = selectedParcel?.id === parcel.id;
        const poly = L.polygon(parcel.polygon, {
          color: isSelected ? '#FF1E3C' : '#1E40AF',
          fillColor: isSelected ? '#FF1E3C' : '#1E40AF',
          fillOpacity: isSelected ? 0.3 : 0.1,
          weight: isSelected ? 3 : 1.5,
          opacity: isSelected ? 1 : 0.7,
        }).addTo(parcelGroup);

        poly.on('click', () => selectParcel(parcel));
        poly.bindTooltip(
          `<div style="font-family:Inter;font-size:12px;">
            <strong>${parcel.ulpin}</strong><br/>
            ${parcel.landUse} • ${parcel.area} m²<br/>
            ${parcel.buildingCount} building(s)
          </div>`,
          { className: 'bg-gis-card text-gis-ink border border-gis-border', direction: 'top' }
        );
      });
      parcelGroup.addTo(map);
      layersRef.current.parcels = parcelGroup;
    }

    // Buildings
    if (activeMapLayers.buildings) {
      const bldgGroup = L.layerGroup();
      buildings.forEach(b => {
        L.polygon(b.polygon, {
          color: '#7C3AED',
          fillColor: '#7C3AED',
          fillOpacity: 0.2,
          weight: 1,
          opacity: 0.6,
        }).addTo(bldgGroup);
      });
      bldgGroup.addTo(map);
      layersRef.current.buildings = bldgGroup;
    }
  }, [filteredParcels, activeMapLayers, buildings, roads, greenSpaces, selectedParcel]);

  // Fly to selected parcel
  useEffect(() => {
    if (selectedParcel && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedParcel.coordinates.lat, selectedParcel.coordinates.lng],
        16,
        { duration: 0.8 }
      );
    }
  }, [selectedParcel]);

  const handleLocate = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([18.5204, 73.8567], 14, { duration: 1 });
    }
  };

  const handleFullscreen = () => {
    const el = document.getElementById('map2d-container');
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen();
      }
    }
  };

  const layerButtons = [
    { id: 'parcels', label: 'Parcels', color: 'bg-blue-500' },
    { id: 'buildings', label: 'Buildings', color: 'bg-purple-500' },
    { id: 'roads', label: 'Roads', color: 'bg-gray-500' },
    { id: 'greenSpaces', label: 'Green Spaces', color: 'bg-green-500' },
  ];

  return (
    <div className="flex h-full">
      {/* Map */}
      <div className="flex-1 relative" id="map2d-container">
        <div ref={mapRef} className="w-full h-full z-0" />

        {/* Search overlay */}
        <div className="absolute top-4 left-4 z-10 w-80">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gis-muted" />
            <input
              type="text"
              placeholder="Search parcel / ULPIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gis-card/90 backdrop-blur-sm border border-gis-border rounded-lg text-sm text-gis-ink placeholder:text-gis-muted/60 outline-none focus:border-gis-accent/50 transition-all"
            />
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button onClick={() => mapInstanceRef.current?.zoomIn()} className="map-control" title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => mapInstanceRef.current?.zoomOut()} className="map-control" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleLocate} className="map-control" title="Reset View">
            <Locate size={16} />
          </button>
          <button onClick={handleFullscreen} className="map-control" title="Fullscreen">
            <Maximize size={16} />
          </button>
        </div>

        {/* Layer toggle */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-gis-card/90 backdrop-blur-sm border border-gis-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={14} className="text-gis-muted" />
              <span className="text-xs font-semibold text-gis-ink">Layers</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {layerButtons.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleMapLayer(layer.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all ${
                    activeMapLayers[layer.id]
                      ? 'bg-gis-accent/10 text-gis-accent border border-gis-accent/20'
                      : 'bg-gis-surface text-gis-muted border border-gis-border'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${layer.color} ${activeMapLayers[layer.id] ? '' : 'opacity-30'}`} />
                  {layer.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <select
            value={landUseFilter}
            onChange={(e) => setLandUseFilter(e.target.value)}
            className="px-3 py-2 bg-gis-card/90 backdrop-blur-sm border border-gis-border rounded-lg text-xs text-gis-ink outline-none"
          >
            <option value="">All Land Uses</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Mixed-Use">Mixed-Use</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gis-card/90 backdrop-blur-sm border border-gis-border rounded-lg text-xs text-gis-ink outline-none"
          >
            <option value="">All Status</option>
            <option value="Validated">Validated</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 border-l border-gis-border bg-gis-panel overflow-y-auto shrink-0 hidden lg:block">
          <CardHeader>
            <CardTitle>Parcel Details</CardTitle>
            <button onClick={() => setSidebarOpen(false)} className="text-gis-muted hover:text-gis-ink">
              <X size={16} />
            </button>
          </CardHeader>
          <CardBody>
            {selectedParcel ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                  <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">ULPIN</span>
                  <p className="font-mono text-sm text-gis-accent font-bold mt-1">{selectedParcel.ulpin}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Land Use</span>
                    <p className="text-sm font-bold text-gis-ink mt-1">{selectedParcel.landUse}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Area</span>
                    <p className="text-sm font-bold text-gis-ink mt-1">{selectedParcel.area.toLocaleString()} m²</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Buildings</span>
                    <p className="text-sm font-bold text-gis-ink mt-1">{selectedParcel.buildingCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Status</span>
                    <div className="mt-1"><StatusBadge status={selectedParcel.status} /></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                  <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Coordinates</span>
                  <p className="text-xs font-mono text-gis-ink mt-1">
                    {selectedParcel.coordinates.lat.toFixed(6)}, {selectedParcel.coordinates.lng.toFixed(6)}
                  </p>
                </div>

                {/* Buildings on this parcel */}
                {selectedParcel.buildings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gis-muted uppercase tracking-wider mb-2">Buildings</h4>
                    <div className="space-y-2">
                      {selectedParcel.buildings.map(b => (
                        <div key={b.id} className="p-2.5 rounded-lg bg-gis-surface border border-gis-border flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-gis-ink">{b.name}</p>
                            <p className="text-[10px] text-gis-muted">{b.floors} floors • {b.area.toLocaleString()} m²</p>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setActivePage('map3d')}>
                    View 3D
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => setActivePage('ulpin')}>
                    ULPIN Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin size={40} className="mx-auto text-gis-muted/30 mb-3" />
                <p className="text-sm text-gis-muted">Click a parcel on the map to view details</p>
                <p className="text-xs text-gis-muted/60 mt-1">{filteredParcels.length} parcels visible</p>
              </div>
            )}
          </CardBody>
        </div>
      )}

      {/* Mobile sidebar toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 right-20 z-10 lg:hidden map-control"
        >
          <Filter size={16} />
        </button>
      )}
    </div>
  );
};

export default Map2D;
