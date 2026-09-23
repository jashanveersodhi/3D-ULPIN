import React from 'react';
import { Globe, Layers, ShieldCheck, Cpu, Rocket } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in-up">
      <div className="card-premium p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gis-accent to-transparent" />

        <div className="relative z-10">
          <h3 className="text-4xl font-black text-gis-ink mb-6 tracking-tighter">About 3D ULPIN Prototype</h3>
          <p className="text-xl text-gis-muted leading-relaxed mb-12 font-medium max-w-3xl">
            A specialized spatial registry prototype designed for the Smart India Hackathon 2026,
            addressing the critical limitation of 2D cadastral mapping in dense urban environments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="flex gap-5 group">
                <div className="p-4 rounded-2xl bg-gis-bg text-gis-accent shrink-0 border border-gis-line group-hover:border-gis-accent transition-colors">
                  <Globe size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gis-ink mb-2">The Problem</h4>
                  <p className="text-sm text-gis-muted leading-relaxed">
                    Conventional 2D footprints cannot uniquely represent multiple vertically stacked properties.
                    This leads to ambiguity in urban land records where a single coordinate set may correspond to dozens of distinct legal units.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 group">
                <div className="p-4 rounded-2xl bg-gis-bg text-purple-500 shrink-0 border border-gis-line group-hover:border-purple-500 transition-colors">
                  <Layers size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gis-ink mb-2">The Solution</h4>
                  <p className="text-sm text-gis-muted leading-relaxed">
                    Introducing a Vertical Property Identity system. By integrating Z-axis coordinates, we transform 2D parcels into 3D spatial volumes,
                    allowing each apartment, office, or parking slot to possess a unique 3D ULPIN.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex gap-5 group">
                <div className="p-4 rounded-2xl bg-gis-bg text-emerald-500 shrink-0 border border-gis-line group-hover:border-emerald-500 transition-colors">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gis-ink mb-2">Validation Engine</h4>
                  <p className="text-sm text-gis-muted leading-relaxed">
                    The prototype implements a spatial validation layer that ensures geometric integrity—verifying that
                    vertical extents are logical and that identifiers are unique within the building hierarchy.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 group">
                <div className="p-4 rounded-2xl bg-gis-bg text-amber-500 shrink-0 border border-gis-line group-hover:border-amber-500 transition-colors">
                  <Cpu size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gis-ink mb-2">Technology Stack</h4>
                  <p className="text-sm text-gis-muted leading-relaxed">
                    Built with React, Three.js (WebGL), and Vite for high-performance spatial rendering and
                    real-time data synchronization between 2D and 3D views.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gis-navy p-10 rounded-3xl shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gis-accent/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Rocket className="text-gis-accent" size={28} />
            <h4 className="text-2xl font-black text-white tracking-tight">Future Integration Roadmap</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'BIM Integration', desc: 'Direct import of Building Information Models for automated unit extraction.', color: 'text-blue-400' },
              { title: 'Govt. API Link', desc: 'Real-time synchronization with national land records and municipal databases.', color: 'text-emerald-400' },
              { title: 'AR Surveying', desc: 'Augmented Reality tools for field agents to validate vertical boundaries on-site.', color: 'text-amber-400' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 group">
                <span className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${item.color}`}>Phase {i+1}</span>
                <h5 className="text-lg font-bold text-white mb-2 group-hover:text-gis-accent transition-colors">{item.title}</h5>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-gis-bg border border-gis-line text-center">
        <p className="text-[11px] text-gis-muted font-medium italic leading-relaxed">
          Disclaimer: All identifiers and coordinates shown are for prototype demonstration purposes only and do not represent official government ULPINs, cadastral records, or legal property titles.
        </p>
      </div>
    </div>
  );
};

export default About;
