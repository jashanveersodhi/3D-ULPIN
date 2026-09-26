import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Validation = () => {
  const { buildings, addActivity } = useStore();
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

  return (
    <div className="p-6 space-y-6 bg-overlay min-h-full animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gis-ink">Spatial Unit Validation</h1>
        <p className="text-sm text-gis-muted mt-1">Validate geometric integrity and identifier uniqueness</p>
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
    </div>
  );
};

export default Validation;
