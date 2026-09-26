import React, { useState, useCallback } from 'react';
import { Upload, Cpu, CheckCircle, Download, Map, Box, Hash, FileJson, FileText, Trash2, Play, ImageIcon, AlertCircle, Layers, ArrowRight } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { Spinner } from '../components/ui/LoadingState';

const STEPS = [
  { id: 1, label: 'Input', description: 'Upload or select imagery' },
  { id: 2, label: 'AI Detection', description: 'Detect buildings & features' },
  { id: 3, label: 'Extraction', description: 'Extract spatial features' },
  { id: 4, label: 'Structuring', description: 'Structure spatial data' },
  { id: 5, label: 'ULPIN Generation', description: 'Generate hierarchical ULPINs' },
];

const Extraction = () => {
  const { startExtraction, updateExtraction, completeExtraction, resetExtraction, extractionResults, isExtracting, extractionStep, extractionProgress, addActivity, setActivePage } = useStore();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
      setCurrentStep(1);
      addActivity(`Image uploaded: ${file.name}`, 'info');
    }
  }, [addActivity]);

  const handleUseSample = useCallback(() => {
    setUploadedFile({ name: 'sample_area_pune.tif', size: 24580000, type: 'image/tiff' });
    setImagePreview(null);
    setCurrentStep(1);
    addActivity('Sample dataset loaded: sample_area_pune.tif', 'info');
  }, [addActivity]);

  const handleClear = useCallback(() => {
    setUploadedFile(null);
    setImagePreview(null);
    resetExtraction();
    setCurrentStep(1);
  }, [resetExtraction]);

  const handleRunExtraction = useCallback(async () => {
    if (!uploadedFile) return;

    startExtraction();
    setCurrentStep(2);

    const stages = [
      { step: 'Detecting buildings...', progress: 20, stage: 2 },
      { step: 'Extracting footprints...', progress: 40, stage: 2 },
      { step: 'Estimating floor levels...', progress: 55, stage: 3 },
      { step: 'Generating spatial features...', progress: 70, stage: 3 },
      { step: 'Creating structured data...', progress: 85, stage: 4 },
      { step: 'Generating ULPINs...', progress: 95, stage: 5 },
    ];

    for (const stage of stages) {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
      updateExtraction(stage.step, stage.progress);
      setCurrentStep(stage.stage);
    }

    // Generate results
    const results = {
      id: `EXTR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: uploadedFile.name,
      buildings: [
        { id: 'BLD-001', name: 'Building A', area_sq_m: 420, floors: 4, height: 15.2, confidence: 0.94, perimeter_m: 82.3, type: 'Residential', units: 16 },
        { id: 'BLD-002', name: 'Building B', area_sq_m: 380, floors: 3, height: 11.5, confidence: 0.89, perimeter_m: 76.1, type: 'Residential', units: 12 },
        { id: 'BLD-003', name: 'Building C', area_sq_m: 520, floors: 5, height: 18.0, confidence: 0.91, perimeter_m: 95.4, type: 'Commercial', units: 20 },
        { id: 'BLD-004', name: 'Building D', area_sq_m: 290, floors: 2, height: 7.8, confidence: 0.86, perimeter_m: 62.8, type: 'Residential', units: 8 },
        { id: 'BLD-005', name: 'Building E', area_sq_m: 610, floors: 6, height: 21.5, confidence: 0.93, perimeter_m: 108.2, type: 'Mixed-Use', units: 24 },
      ],
      roads: [
        { id: 'RD-001', length_m: 245, width_m: 12 },
        { id: 'RD-002', length_m: 180, width_m: 8 },
      ],
      parcels: [
        { id: 'P-001', area: 1250, landUse: 'Residential' },
        { id: 'P-002', area: 980, landUse: 'Mixed-Use' },
        { id: 'P-003', area: 1500, landUse: 'Commercial' },
      ],
      totalUnits: 80,
      processingStatus: 'Complete',
      confidence: 0.91,
    };

    completeExtraction(results);
    setCurrentStep(5);
  }, [uploadedFile, startExtraction, updateExtraction, completeExtraction, addActivity]);

  const handleExportGeoJSON = useCallback(() => {
    if (!extractionResults) return;
    const geojson = {
      type: 'FeatureCollection',
      features: [
        ...extractionResults.buildings.map(b => ({
          type: 'Feature',
          properties: { building_id: b.id, area_sq_m: b.area_sq_m, floors: b.floors, height: b.height, confidence: b.confidence, type: b.type },
          geometry: { type: 'Polygon', coordinates: [[[73.856, 18.520], [73.857, 18.520], [73.857, 18.521], [73.856, 18.521], [73.856, 18.520]]] },
        })),
        ...extractionResults.parcels.map(p => ({
          type: 'Feature',
          properties: { parcel_id: p.id, area: p.area, landUse: p.landUse },
          geometry: { type: 'Polygon', coordinates: [[[73.855, 18.519], [73.858, 18.519], [73.858, 18.522], [73.855, 18.522], [73.855, 18.519]]] },
        })),
      ],
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extraction_results.geojson';
    a.click();
    URL.revokeObjectURL(url);
    addActivity('GeoJSON exported', 'success');
  }, [extractionResults, addActivity]);

  const handleExportCSV = useCallback(() => {
    if (!extractionResults) return;
    const cols = ['id', 'name', 'type', 'area_sq_m', 'floors', 'height', 'confidence', 'units'];
    const csv = [
      cols.join(','),
      ...extractionResults.buildings.map(b => cols.map(k => `"${b[k] || ''}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extraction_results.csv';
    a.click();
    URL.revokeObjectURL(url);
    addActivity('CSV exported', 'success');
  }, [extractionResults, addActivity]);

  const handleAddToMap = useCallback(() => {
    addActivity('Features added to 2D map', 'success');
    setActivePage('map2d');
  }, [addActivity, setActivePage]);

  const handleSendTo3D = useCallback(() => {
    addActivity('Buildings sent to 3D viewer with neighborhood context', 'success');
    setActivePage('map3d');
  }, [addActivity, setActivePage]);

  const handleGenerateUlpin = useCallback(() => {
    addActivity('ULPINs generated for all parcels, buildings, and units', 'success');
    setActivePage('ulpin');
  }, [addActivity, setActivePage]);

  return (
    <div className="p-6 space-y-6 bg-overlay min-h-full animate-fade-in max-w-6xl mx-auto">
      {/* Step Timeline */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-gis-success border-gis-success text-white' :
                    currentStep === step.id ? 'bg-gis-accent border-gis-accent text-white animate-pulse' :
                    'bg-gis-surface border-gis-border text-gis-muted'
                  }`}>
                    {currentStep > step.id ? <CheckCircle size={18} /> : <span className="text-sm font-bold">{step.id}</span>}
                  </div>
                  <span className="text-xs font-semibold text-gis-ink mt-2 whitespace-nowrap">{step.label}</span>
                  <span className="text-[10px] text-gis-muted whitespace-nowrap">{step.description}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 min-w-[30px] transition-all duration-500 ${
                    currentStep > step.id ? 'bg-gis-success' : 'bg-gis-border'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input & Processing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gis-accent/10 text-gis-accent flex items-center justify-center text-xs font-bold">1</span>
                Input Imagery
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-3 mb-4">
                <label className="btn-secondary cursor-pointer">
                  <Upload size={16} />
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
                <Button variant="secondary" onClick={handleUseSample} icon={ImageIcon}>
                  Use Sample Dataset
                </Button>
                <Button variant="ghost" onClick={handleClear} icon={Trash2}>
                  Clear
                </Button>
              </div>

              {uploadedFile && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gis-surface border border-gis-border">
                  <div className="w-16 h-16 rounded-lg bg-gis-input border border-gis-border flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={24} className="text-gis-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gis-ink truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-gis-muted">
                      {uploadedFile.size ? `${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB` : 'Sample data'} • Ready for processing
                    </p>
                  </div>
                  <StatusBadge status="Validated" />
                </div>
              )}

              {!uploadedFile && (
                <div className="border-2 border-dashed border-gis-border rounded-xl p-8 text-center">
                  <Upload size={32} className="mx-auto text-gis-muted/30 mb-3" />
                  <p className="text-sm text-gis-muted">Upload satellite imagery or use the sample dataset</p>
                  <p className="text-xs text-gis-muted/60 mt-1">Supports GeoTIFF, PNG, JPG (max 50MB)</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Step 2: Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gis-accent/10 text-gis-accent flex items-center justify-center text-xs font-bold">2</span>
                AI Processing
              </CardTitle>
              <span className="badge-warning text-[10px]">Demo AI</span>
            </CardHeader>
            <CardBody>
              <Button
                onClick={handleRunExtraction}
                disabled={!uploadedFile || isExtracting}
                loading={isExtracting}
                icon={Cpu}
                className="w-full"
              >
                {isExtracting ? 'Processing...' : 'Run AI Extraction'}
              </Button>

              {isExtracting && (
                <div className="mt-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gis-ink font-medium">{extractionStep}</span>
                    <span className="text-gis-muted">{extractionProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${extractionProgress}%` }} />
                  </div>
                </div>
              )}

              {extractionResults && !isExtracting && (
                <div className="mt-4 p-4 rounded-xl bg-gis-success/10 border border-gis-success/20">
                  <div className="flex items-center gap-2 text-gis-success text-sm font-semibold">
                    <CheckCircle size={16} />
                    Extraction Complete
                  </div>
                  <p className="text-xs text-gis-muted mt-1">
                    {extractionResults.buildings.length} buildings • {extractionResults.totalUnits} units • {extractionResults.parcels.length} parcels detected
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Step 3: Results */}
          {extractionResults && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gis-success/10 text-gis-success flex items-center justify-center text-xs font-bold">3</span>
                  Extraction Results
                </CardTitle>
                <StatusBadge status="AI_DETECTED" />
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {extractionResults.buildings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-gis-surface border border-gis-border hover:border-gis-accent/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gis-accent/10 flex items-center justify-center">
                          <Box size={14} className="text-gis-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gis-ink">{b.name}</p>
                          <p className="text-[10px] text-gis-muted">{b.type} • {b.floors} floors • {b.area_sq_m} m² • {b.units} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gis-accent">{(b.confidence * 100).toFixed(0)}%</p>
                        <p className="text-[10px] text-gis-muted">confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right: Actions & Info */}
        <div className="space-y-6">
          {/* Step 4: Convert & Export */}
          <Card>
            <CardHeader>
              <CardTitle>Convert & Export</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button variant="secondary" className="w-full" icon={FileJson} onClick={handleExportGeoJSON} disabled={!extractionResults}>
                Convert to GeoJSON
              </Button>
              <Button variant="secondary" className="w-full" icon={FileText} onClick={handleExportCSV} disabled={!extractionResults}>
                Export as CSV
              </Button>
              <Button variant="secondary" className="w-full" icon={Download} onClick={handleExportGeoJSON} disabled={!extractionResults}>
                Export All Data
              </Button>
            </CardBody>
          </Card>

          {/* Step 5: Send to Other Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Send To</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button variant="secondary" className="w-full" icon={Map} onClick={handleAddToMap} disabled={!extractionResults}>
                Add to 2D Map
              </Button>
              <Button variant="secondary" className="w-full" icon={Box} onClick={handleSendTo3D} disabled={!extractionResults}>
                Send to 3D Model
              </Button>
              <Button variant="secondary" className="w-full" icon={Hash} onClick={handleGenerateUlpin} disabled={!extractionResults}>
                Generate ULPINs
              </Button>
            </CardBody>
          </Card>

          {/* Info */}
          <Card>
            <CardBody>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gis-warning/10 border border-gis-warning/20">
                <AlertCircle size={16} className="text-gis-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gis-warning">Demo AI Processing</p>
                  <p className="text-[10px] text-gis-muted mt-1">
                    Simulated inference for prototype demonstration. No real AI backend connected.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Extraction;
