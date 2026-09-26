import React from 'react';
import { Globe, Layers, ShieldCheck, Cpu, Rocket } from 'lucide-react';
import Card, { CardBody } from '../components/ui/Card';

const About = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card>
        <CardBody className="py-8">
          <h2 className="text-3xl font-bold text-gis-ink mb-4">About 3D ULPIN Prototype</h2>
          <p className="text-gis-muted leading-relaxed mb-8 max-w-2xl">
            A specialized spatial registry prototype designed for the Smart India Hackathon 2026,
            addressing the critical limitation of 2D cadastral mapping in dense urban environments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="p-3 rounded-xl bg-gis-surface text-gis-accent border border-gis-border shrink-0">
                <Globe size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gis-ink mb-1">The Problem</h4>
                <p className="text-xs text-gis-muted leading-relaxed">
                  Conventional 2D footprints cannot uniquely represent multiple vertically stacked properties.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 rounded-xl bg-gis-surface text-gis-secondary border border-gis-border shrink-0">
                <Layers size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gis-ink mb-1">The Solution</h4>
                <p className="text-xs text-gis-muted leading-relaxed">
                  Vertical Property Identity system integrating Z-axis coordinates for unique 3D ULPINs.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 rounded-xl bg-gis-surface text-gis-success border border-gis-border shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gis-ink mb-1">Validation Engine</h4>
                <p className="text-xs text-gis-muted leading-relaxed">
                  Spatial validation layer ensuring geometric integrity and identifier uniqueness.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 rounded-xl bg-gis-surface text-gis-warning border border-gis-border shrink-0">
                <Cpu size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gis-ink mb-1">Technology Stack</h4>
                <p className="text-xs text-gis-muted leading-relaxed">
                  React, Three.js (WebGL), Leaflet, Zustand, Tailwind CSS, Vite.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-3 mb-6">
            <Rocket size={24} className="text-gis-accent" />
            <h3 className="text-lg font-bold text-gis-ink">Future Integration Roadmap</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'BIM Integration', desc: 'Direct import of Building Information Models for automated unit extraction.' },
              { title: 'Govt. API Link', desc: 'Real-time synchronization with national land records and municipal databases.' },
              { title: 'AR Surveying', desc: 'Augmented Reality tools for field agents to validate vertical boundaries on-site.' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-gis-surface border border-gis-border">
                <span className="block text-[10px] font-bold text-gis-accent uppercase tracking-wider mb-2">Phase {i + 1}</span>
                <h5 className="text-sm font-bold text-gis-ink mb-1">{item.title}</h5>
                <p className="text-xs text-gis-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="p-4 rounded-xl bg-gis-surface border border-gis-border text-center">
        <p className="text-[11px] text-gis-muted leading-relaxed">
          Disclaimer: All identifiers and coordinates shown are for prototype demonstration purposes only and do not represent official government ULPINs, cadastral records, or legal property titles.
        </p>
      </div>
    </div>
  );
};

export default About;
