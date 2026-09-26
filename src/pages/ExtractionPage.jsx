import React, { useState } from 'react';
import { Upload, CheckCircle, Info, Layers, Map as MapIcon } from 'lucide-react';

const ExtractionPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedFeatures, setDetectedFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleUpload = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        const mockResults = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                building_id: 'BLD-001',
                area_sq_m: 228.4,
                perimeter_m: 61.4,
                estimated_floors: 3,
                estimated_height: 12.5,
                confidence: 0.94,
                status: 'AI_DETECTED'
              },
              geometry: { type: 'Polygon', coordinates: [] }
            },
            {
              type: 'Feature',
              properties: {
                building_id: 'BLD-002',
                area_sq_m: 180.2,
                perimeter_m: 52.1,
                estimated_floors: 2,
                estimated_height: 8.0,
                confidence: 0.88,
                status: 'AI_DETECTED'
              },
              geometry: { type: 'Polygon', coordinates: [] }
            }
          ]
        };
        setDetectedFeatures(mockResults.features);
      } catch (error) {
        console.error("Extraction failed", error);
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full bg-gis-base overflow-hidden animate-fade-in-up">
      {/* Simplified Data Map Area */}
      <div className="flex-1 relative bg-gis-card flex flex-col items-center justify-center p-10">
        <div className="absolute top-6 left-6 z-10 flex gap-3">
          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className={`btn-primary flex items-center gap-2 transition-all ${
              isProcessing ? 'opacity-50' : ''
            }`}
          >
            {isProcessing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={18} />}
            {isProcessing ? 'Analyzing Imagery...' : 'Upload & Extract'}
          </button>
        </div>

        {detectedFeatures.length > 0 ? (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            {detectedFeatures.map((f, i) => (
              <div
                key={i}
                onClick={() => setSelectedFeature(f.properties)}
                className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                  selectedFeature?.building_id === f.properties.building_id
                  ? 'border-gis-accent bg-gis-accent/10 shadow-lg shadow-gis-accent/20'
                  : 'border-gis-line bg-gis-card hover:border-gis-accent'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xl font-bold text-gis-ink">{f.properties.building_id}</span>
                  <span className="text-xs font-bold bg-gis-accent text-white px-2 py-1 rounded">{f.properties.confidence * 100}% Conf.</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gis-muted">
                  <span>Area: {f.properties.area_sq_m}m²</span>
                  <span>Height: {f.properties.estimated_height}m</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gis-muted">
            <MapIcon size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium">Upload imagery to extract property features</p>
            <p className="text-sm opacity-50">The AI will identify building footprints and boundaries</p>
          </div>
        )}
      </div>

      {/* Side Panel */}
      <div className="w-96 bg-gis-card border-l border-gis-line p-6 overflow-y-auto animate-slide-in-right">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
            <Info size={20} />
          </div>
          <h2 className="text-xl font-bold text-gis-ink tracking-tight">Feature Analysis</h2>
        </div>

        {selectedFeature ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-gis-base border border-gis-line">
              <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest mb-2">Building ID</span>
              <div className="text-2xl font-mono font-bold text-gis-ink">{selectedFeature.building_id}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gis-base border border-gis-line">
                <span className="block text-[10px] font-black text-gis-muted uppercase mb-1">Area</span>
                <div className="text-sm font-bold text-gis-ink">{selectedFeature.area_sq_m} m²</div>
              </div>
              <div className="p-4 rounded-2xl bg-gis-base border border-gis-line">
                <span className="block text-[10px] font-black text-gis-muted uppercase mb-1">Perimeter</span>
                <div className="text-sm font-bold text-gis-ink">{selectedFeature.perimeter_m} m</div>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-gis-base border border-gis-line space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gis-muted">AI Confidence</span>
                <span className="text-sm font-black text-gis-accent">{(selectedFeature.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gis-line h-1.5 rounded-full overflow-hidden">
                <div className="bg-gis-accent h-full transition-all duration-1000" style={{ width: `${selectedFeature.confidence * 100}%` }} />
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-gis-base border border-gis-line space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gis-muted">Est. Floors</span>
                <span className="text-sm font-black text-gis-ink">{selectedFeature.estimated_floors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gis-muted">Est. Height</span>
                <span className="text-sm font-black text-gis-ink">{selectedFeature.estimated_height} m</span>
              </div>
            </div>
            <button className="w-full py-4 rounded-2xl bg-gis-accent text-white font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-gis-accent/20">
              <CheckCircle size={18} /> Verify Footprint
            </button>
          </div>
        ) : (
          <div className="py-24 text-center text-gis-muted">
            <Layers size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">Select a detected building to analyze its spatial features.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractionPage;
