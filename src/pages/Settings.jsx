import React, { useState } from 'react';
import { Settings as SettingsIcon, Map, Box, Bell, Shield, Database, RefreshCw, CheckCircle } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Settings = () => {
  const { neighborhood, addActivity } = useStore();
  const [settings, setSettings] = useState({
    mapStyle: 'dark',
    defaultZoom: 14,
    showLabels: true,
    enableNotifications: false,
    autoSave: true,
    demoMode: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    addActivity('Settings updated', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 bg-overlay min-h-full animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gis-ink">Settings</h1>
        <p className="text-sm text-gis-muted mt-1">Configure the 3D ULPIN Spatial Registry Platform</p>
      </div>

      {/* Map Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map size={16} className="text-gis-accent" />
            Map Configuration
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gis-ink">Map Style</p>
              <p className="text-xs text-gis-muted">Base map tile style</p>
            </div>
            <select
              value={settings.mapStyle}
              onChange={(e) => setSettings({ ...settings, mapStyle: e.target.value })}
              className="select w-40"
            >
              <option value="dark">Dark (CARTO)</option>
              <option value="satellite">Satellite</option>
              <option value="street">Street</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gis-ink">Default Zoom</p>
              <p className="text-xs text-gis-muted">Initial zoom level for 2D map</p>
            </div>
            <input
              type="number"
              min="10"
              max="18"
              value={settings.defaultZoom}
              onChange={(e) => setSettings({ ...settings, defaultZoom: parseInt(e.target.value) })}
              className="input w-20 text-center"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gis-ink">Show Labels in 3D</p>
              <p className="text-xs text-gis-muted">Display building name labels in 3D view</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, showLabels: !settings.showLabels })}
              className={`w-11 h-6 rounded-full transition-all ${settings.showLabels ? 'bg-gis-accent' : 'bg-gis-border'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.showLabels ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={16} className="text-gis-warning" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gis-ink">Enable Notifications</p>
              <p className="text-xs text-gis-muted">Get notified when extraction completes</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
              className={`w-11 h-6 rounded-full transition-all ${settings.enableNotifications ? 'bg-gis-accent' : 'bg-gis-border'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.enableNotifications ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Data Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={16} className="text-gis-success" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gis-ink">Auto-Save</p>
              <p className="text-xs text-gis-muted">Automatically save changes to local storage</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
              className={`w-11 h-6 rounded-full transition-all ${settings.autoSave ? 'bg-gis-accent' : 'bg-gis-border'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.autoSave ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gis-ink">Demo Mode</p>
              <p className="text-xs text-gis-muted">Show demo data labels and warnings</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, demoMode: !settings.demoMode })}
              className={`w-11 h-6 rounded-full transition-all ${settings.demoMode ? 'bg-gis-accent' : 'bg-gis-border'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.demoMode ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="pt-2 border-t border-gis-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gis-ink">Neighborhood Data</p>
                <p className="text-xs text-gis-muted">{neighborhood.parcels.length} parcels • {neighborhood.buildings.length} buildings • {neighborhood.units.length} units</p>
              </div>
              <Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => addActivity('Data refreshed', 'info')}>
                Refresh
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={16} className="text-gis-secondary" />
            Security & Access
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="p-4 rounded-xl bg-gis-surface border border-gis-border">
            <p className="text-xs text-gis-muted leading-relaxed">
              This is a prototype demonstration. No real PII or sensitive data is stored.
              All ULPINs are generated for demo purposes only and do not represent
              official government records.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} icon={saved ? CheckCircle : SettingsIcon}>
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
