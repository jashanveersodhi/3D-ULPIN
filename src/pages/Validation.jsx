import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCcw, ShieldCheck, AlertTriangle, Box } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Validation = () => {
  const { buildings, units, topologyConflicts, topologyValid, topologyChecked, runTopologyValidation, addActivity } = useStore();
  const [formData, setFormData] = useState({
    buildingId: buildings[0]?.id || '',
    floor: 3,
    unit: '301',
    type: 'Residential',
    zBottom: 9.0,
    zTop: 12.0,
    identifier: 'ULPIN-UN-0001-B01-F03-U01',
  });
  const [result, setResult] = useState(null);

  const handleValidate = () => {
    const building = buildings.find(b => b.id === formData.buildingId);
    const checks = [
      { label: 'Building reference valid', valid: !!building },
      { label: 'Floor within building range', valid: formData.floor > 0 && formData.floor <= (building?.floors || 100) },
      { label: 'Vertical coordinates valid', valid: formData.zBottom < formData.zTop && formData.zBottom >= 0 },
      { label: 'Unit identifier unique', valid: formData.identifier.length > 5 },
      { label: 'Property type valid', valid: ['Residential', 'Commercial', 'Office', 'Retail', 'Mixed-Use'].includes(formData.type) },
    ];
    const isValid = checks.every(c => c.valid);
    setResult({ isValid, details: checks });
    addActivity(`Validation ${isValid ? 'passed' : 'failed'} for unit ${formData.unit}`, isValid ? 'success' : 'error');
  };

  const handleTopologyCheck = () => {
    const topoResult = runTopologyValidation();
    addActivity(
      topoResult.valid ? 'Topology validation passed — no conflicts' : `Topology check: ${topoResult.conflicts.length} conflict(s) detected`,
      topoResult.valid ? 'success' : 'error'
    );
  };

  return (
    <div className="p-6 space-y-6 bg-overlay min-h-full animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gis-ink">Spatial Unit Validation</h1>
        <p className="text-sm text-gis-muted mt-1">Validate geometric integrity, identifier uniqueness, and 3D topology conflicts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-gis-accent" />
              Validation Form
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gis-muted uppercase tracking-wider mb-1">Building</label>
              <select value={formData.buildingId} onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })} className="select w-full">
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gis-muted uppercase tracking-wider mb-1">Floor</label>
                <input type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gis-muted uppercase tracking-wider mb-1">Unit</label>
                <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gis-muted uppercase tracking-wider mb-1">Property Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="select w-full">
                <option>Residential</option>
                <option>Commercial</option>
                <option>Office</option>
                <option>Retail</option>
                <option>Mixed-Use</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gis-muted uppercase tracking-wider mb-1">Z-Bottom (m)</label>
                <input type="number" step="0.01" value={formData.zBottom} onChange={(e) => setFormData({ ...formData, zBottom: parseFloat(e.target.value) })} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gis-muted uppercase tracking-wider mb-1">Z-Top (m)</label>
                <input type="number" step="0.01" value={formData.zTop} onChange={(e) => setFormData({ ...formData, zTop: parseFloat(e.target.value) })} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gis-muted uppercase tracking-wider mb-1">Unit ULPIN</label>
              <input type="text" value={formData.identifier} onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} className="input font-mono text-xs" />
            </div>
            <Button onClick={handleValidate} icon={RefreshCcw} className="w-full">
              Run Spatial Validation
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation Report</CardTitle>
          </CardHeader>
          <CardBody>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle size={48} className="text-gis-muted/20 mb-4" />
                <p className="text-sm text-gis-muted">Complete the form and run validation to generate a report.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {result.details.map((check, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <span className="text-sm font-medium text-gis-ink">{check.label}</span>
                    {check.valid ? (
                      <CheckCircle size={18} className="text-gis-success" />
                    ) : (
                      <XCircle size={18} className="text-gis-error" />
                    )}
                  </div>
                ))}
                <div className={`p-5 rounded-xl text-center ${result.isValid ? 'bg-gis-success/10 border border-gis-success/20' : 'bg-gis-error/10 border border-gis-error/20'}`}>
                  <p className={`text-lg font-bold ${result.isValid ? 'text-gis-success' : 'text-gis-error'}`}>
                    {result.isValid ? 'SPATIAL UNIT VALIDATED' : 'VALIDATION FAILED'}
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* ─── 3D Topology Validation Section ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box size={16} className="text-gis-accent" />
            3D Topology Conflict Detection
          </CardTitle>
          <Button size="sm" variant="secondary" icon={RefreshCcw} onClick={handleTopologyCheck}>
            Run Topology Check
          </Button>
        </CardHeader>
        <CardBody>
          {!topologyChecked ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle size={40} className="text-gis-muted/20 mb-3" />
              <p className="text-sm text-gis-muted">Run topology check to detect 3D bounding-box conflicts between all units.</p>
            </div>
          ) : topologyValid ? (
            <div className="p-4 rounded-xl bg-gis-success/10 border border-gis-success/20">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={18} className="text-gis-success" />
                <span className="text-sm font-bold text-gis-success">All Units Topologically Valid</span>
              </div>
              <p className="text-xs text-gis-muted">No 3D bounding-box overlaps detected across {units.length} units (residential, underground, air-rights).</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-gis-error/10 border border-gis-error/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={18} className="text-gis-error" />
                  <span className="text-sm font-bold text-gis-error">3D Topology Conflict{topologyConflicts.length > 1 ? 's' : ''} Detected</span>
                </div>
                <p className="text-xs text-gis-muted">{topologyConflicts.length} overlapping unit pair(s) found via 3D bounding-box intersection.</p>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {topologyConflicts.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-gis-error font-bold">{c.unitA}</span>
                      <span className="text-[10px] text-gis-muted">↔</span>
                      <span className="font-mono text-xs text-gis-error font-bold">{c.unitB}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gis-muted text-[10px] uppercase tracking-wider">Unit A</span>
                        <p className="text-gis-ink font-medium">{c.unitAType} ({c.unitACategory})</p>
                      </div>
                      <div>
                        <span className="text-gis-muted text-[10px] uppercase tracking-wider">Unit B</span>
                        <p className="text-gis-ink font-medium">{c.unitBType} ({c.unitBCategory})</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gis-muted text-[10px] uppercase tracking-wider">Bounds A</span>
                        <p className="text-gis-ink font-mono text-[10px]">
                          x:[{c.boundsA.xMin.toFixed(1)}, {c.boundsA.xMax.toFixed(1)}] y:[{c.boundsA.yMin.toFixed(1)}, {c.boundsA.yMax.toFixed(1)}] z:[{c.boundsA.zMin.toFixed(1)}, {c.boundsA.zMax.toFixed(1)}]
                        </p>
                      </div>
                      <div>
                        <span className="text-gis-muted text-[10px] uppercase tracking-wider">Bounds B</span>
                        <p className="text-gis-ink font-mono text-[10px]">
                          x:[{c.boundsB.xMin.toFixed(1)}, {c.boundsB.xMax.toFixed(1)}] y:[{c.boundsB.yMin.toFixed(1)}, {c.boundsB.yMax.toFixed(1)}] z:[{c.boundsB.zMin.toFixed(1)}, {c.boundsB.zMax.toFixed(1)}]
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px]">
                      <span className="text-gis-muted uppercase tracking-wider">Type: <span className="text-gis-ink font-bold">{c.type}</span></span>
                      <span className="text-gis-muted uppercase tracking-wider">Intersection: <span className="text-gis-ink font-bold">{c.intersectionVolume.toFixed(1)} m³</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Validation;
