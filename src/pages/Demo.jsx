import React, { useState, useEffect } from 'react';
import { PlayCircle, ChevronRight, ChevronLeft, XCircle, CheckCircle } from 'lucide-react';

const Demo = ({ store, onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "The Challenge",
      content: "Traditional 2D mapping identifies the building footprint, but it cannot distinguish between properties stacked vertically.",
      action: "Explain the vertical property problem."
    },
    {
      title: "3D Visualization",
      content: "Our system creates a 3D spatial representation where each floor is a distinct layer.",
      action: "Navigate to 3D Map."
    },
    {
      title: "Floor Segmentation",
      content: "By isolating Floor 25, we reveal the individual spatial units occupying that vertical level.",
      action: "Select Floor 25."
    },
    {
      title: "Unit Identification",
      content: "Flat 2506 is now isolated. We can see its exact spatial coordinates (X, Y, Z) and vertical extent.",
      action: "Select Unit 2506."
    },
    {
      title: "3D ULPIN Generation",
      content: "Based on the building, floor, and unit hierarchy, a unique Proposed 3D ULPIN is generated.",
      action: "Generate Identifier."
    },
    {
      title: "Spatial Validation",
      content: "The system validates the record's geometry to ensure it doesn't overlap with other units.",
      action: "Run Validation Engine."
    },
    {
      title: "Registry Entry",
      content: "The validated spatial record is then committed to the professional property registry.",
      action: "Update Registry."
    },
    {
      title: "Search & Retrieval",
      content: "Any authorized official can now instantly locate a vertical property using its 3D ULPIN.",
      action: "Global Search."
    },
    {
      title: "Analytics & Planning",
      content: "Aggregated data allows city planners to analyze vertical density and property distribution.",
      action: "View Analytics."
    },
    {
      title: "Outcome",
      content: "The result is a transparent, accurate, and digitally verifiable vertical property registry for smart cities.",
      action: "Demo Complete."
    },
  ];

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-8 py-12">
      <div className="relative w-full max-w-2xl">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-gis-accent text-white text-[10px] font-black uppercase rounded-full tracking-widest">
            Guided Judge Demo
          </span>
        </div>

        <div className="bg-white p-12 rounded-3xl border border-gis-line shadow-2xl relative">
          <div className="mb-8 flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? 'w-8 bg-gis-accent' : i < step ? 'w-3 bg-green-500' : 'w-3 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <h3 className="text-3xl font-black text-gis-ink mb-6">{steps[step].title}</h3>
          <p className="text-lg text-gis-muted leading-relaxed mb-10 min-h-[100px]">
            {steps[step].content}
          </p>

          <div className="flex items-center justify-between">
            <button
              disabled={step === 0}
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gis-muted hover:text-gis-ink disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={20} /> Previous
            </button>

            <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gis-line text-xs font-mono text-gis-muted">
              Step {step + 1} of {steps.length}
            </div>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-gis-accent text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Next <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
              >
                Finish Demo <CheckCircle size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="flex items-center gap-2 text-gis-muted hover:text-red-500 transition-colors text-sm font-medium"
      >
        <XCircle size={16} /> Exit Demo Mode
      </button>
    </div>
  );
};

export default Demo;
