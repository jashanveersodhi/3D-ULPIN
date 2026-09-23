import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCcw, ShieldCheck } from 'lucide-react';
import { validateSpatialUnit } from '../utils/validation';

const Validation = ({ store }) => {
  const { buildings, properties } = store;
  const [formData, setFormData] = useState({
    buildingId: buildings[0]?.id || '',
    floor: 25,
    unit: '25A',
    type: 'Office',
    zBottom: 89.12,
    zTop: 92.84,
    identifier: 'PROTOTYPE-ESB-F025-U001',
  });
  const [result, setResult] = useState(null);

  const handleValidate = () => {
    const building = buildings.find(b => b.id === formData.buildingId);
    const floor = { id: `${formData.buildingId}-F${String(formData.floor).padStart(3, '0')}` };
    const unit = {
      ...formData,
      floorId: floor.id,
      x: 0, y: 0, z: (formData.zBottom + formData.zTop) / 2,
    };

    const validationResult = validateSpatialUnit(unit, building, floor);
    setResult(validationResult);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      <div className="lg:col-span-2 card-premium p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-2xl font-black text-gis-ink tracking-tight">Spatial Unit Validation</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gis-muted uppercase tracking-widest">Building Identification</label>
              <select
                className="w-full px-4 py-3 bg-gis-bg border border-gis-line rounded-xl outline-none focus:ring-2 focus:ring-gis-accent/30 transition-all text-gis-ink font-medium"
                value={formData.buildingId}
                onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
              >
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gis-muted uppercase tracking-widest">Floor</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-gis-bg border border-gis-line rounded-xl outline-none focus:ring-2 focus:ring-gis-accent/30 transition-all text-gis-ink font-bold"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gis-muted uppercase tracking-widest">Unit No.</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gis-bg border border-gis-line rounded-xl outline-none focus:ring-2 focus:ring-gis-accent/30 transition-all text-gis-ink font-bold"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gis-muted uppercase tracking-widest">Property Type</label>
              <select
                className="w-full px-4 py-3 bg-gis-bg border border-gis-line rounded-xl outline-none focus:ring-2 focus:ring-gis-accent/30 transition-all text-gis-ink font-medium"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Office</option>
                <option>Retail</option>
                <option>Parking</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gis-muted uppercase tracking-widest">Z-bottom (m)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gis-bg border border-gis-line rounded-xl outline-none focus:ring-2 focus:ring-gis-accent/30 transition-all text-gis-ink font-bold"
                  value={formData.zBottom}
                  onChange={(e) => setFormData({ ...formData, zBottom: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gis-muted uppercase tracking-widest">Z-top (m)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gis-bg border border-gis-line rounded-xl outline-none focus:ring-2 focus:ring-gis-accent/30 transition-all text-gis-ink font-bold"
                  value={formData.zTop}
                  onChange={(e) => setFormData({ ...formData, zTop: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gis-muted uppercase tracking-widest">Proposed 3D ULPIN</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gis-bg border border-gis-line rounded-xl outline-none focus:ring-2 focus:ring-gis-accent/30 transition-all font-mono text-sm text-gis-accent font-bold"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>

            <div className="p-5 rounded-2xl bg-gis-accent/10 border border-gis-accent/20 text-gis-accent text-xs leading-relaxed font-medium">
              <strong className="block mb-1 font-black uppercase tracking-wider text-[10px]">Technical Note</strong>
              To demonstrate a validation failure, try setting Z-bottom higher than Z-top.
            </div>
          </div>
        </div>

        <button
          onClick={handleValidate}
          className="btn-premium w-full mt-10 py-5 bg-gis-accent text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-gis-accent/30 hover:shadow-gis-accent/50"
        >
          <RefreshCcw size={24} /> Run Spatial Validation Audit
        </button>
      </div>

      <div className="card-premium p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-xl font-bold text-gis-ink tracking-tight">Validation Audit Report</h3>
        </div>

        {!result ? (
          <div className="flex flex-col items-center justify-center py-24 text-gis-muted text-center">
            <AlertCircle size={64} className="mb-6 opacity-10" />
            <p className="font-medium opacity-60">Complete the form and run the spatial audit to generate a report.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {result.details.map((check, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gis-bg border border-gis-line transition-all hover:border-gis-accent/30 group">
                  <span className="text-sm font-bold text-gis-ink group-hover:text-gis-accent transition-colors">{check.label}</span>
                  {check.valid ? (
                    <div className="p-1 bg-emerald-500/20 text-emerald-500 rounded-full">
                      <CheckCircle size={18} />
                    </div>
                  ) : (
                    <div className="p-1 bg-red-500/20 text-red-500 rounded-full">
                      <XCircle size={18} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={`mt-10 p-8 rounded-3xl text-center transition-all duration-500 ${
              result.isValid ? 'bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-red-500/10 border-2 border-red-500/30 text-red-500 shadow-lg shadow-red-500/10'
            }`}>
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-80">Final Audit Verdict</p>
              <p className="text-3xl font-black tracking-tighter">{result.isValid ? 'SPATIAL UNIT VALIDATED' : 'VALIDATION FAILED'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Validation;
