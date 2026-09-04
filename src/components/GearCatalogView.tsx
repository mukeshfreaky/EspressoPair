import React, { useState } from 'react';
import gearData from '../data/gear.json' with { type: 'json' };
import { Machine, Grinder } from '../types/index.ts';
import { ExternalLink, Search, ShieldCheck, ArrowLeft } from 'lucide-react';

const typedGear = gearData as { machines: Machine[]; grinders: Grinder[] };

interface GearCatalogViewProps {
  onBack: () => void;
}

export const GearCatalogView: React.FC<GearCatalogViewProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'machines' | 'grinders'>('machines');
  const [search, setSearch] = useState('');

  const filteredMachines = typedGear.machines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.brand.toLowerCase().includes(search.toLowerCase()) ||
    m.boiler_type.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGrinders = typedGear.grinders.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.brand.toLowerCase().includes(search.toLowerCase()) ||
    g.burr_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-coffee-200">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-coffee-600 hover:text-coffee-950 font-medium flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Finder
          </button>
          <h1 className="font-serif text-3xl font-bold text-coffee-950">
            Curated Espresso Gear Database
          </h1>
          <p className="text-coffee-600 text-xs sm:text-sm mt-0.5">
            15 machines and 12 grinders representing the active enthusiast consensus. All prices and specs verified.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gear..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-coffee-200 rounded-lg text-xs text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:border-crema"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-coffee-200">
        <button
          onClick={() => setTab('machines')}
          className={`pb-3 font-serif font-bold text-sm sm:text-base border-b-2 transition-colors ${
            tab === 'machines'
              ? 'border-crema text-crema'
              : 'border-transparent text-coffee-600 hover:text-coffee-950'
          }`}
        >
          Espresso Machines ({filteredMachines.length})
        </button>
        <button
          onClick={() => setTab('grinders')}
          className={`pb-3 font-serif font-bold text-sm sm:text-base border-b-2 transition-colors ${
            tab === 'grinders'
              ? 'border-crema text-crema'
              : 'border-transparent text-coffee-600 hover:text-coffee-950'
          }`}
        >
          Espresso Grinders ({filteredGrinders.length})
        </button>
      </div>

      {/* Machines Grid */}
      {tab === 'machines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMachines.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-coffee-200 p-5 shadow-sm space-y-4 hover:border-coffee-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-coffee-500 tracking-wider block">{m.brand}</span>
                    <h3 className="font-serif font-bold text-coffee-950 text-lg leading-tight">{m.name}</h3>
                  </div>
                  <span className="font-serif font-bold text-coffee-950 text-lg bg-coffee-50 px-2.5 py-0.5 rounded border border-coffee-200/60">
                    ${m.price}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-coffee-100 my-2 text-coffee-700">
                  <div>
                    <span className="text-[10px] uppercase text-coffee-400 block">Boiler Type</span>
                    <strong className="capitalize">{m.boiler_type.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-coffee-400 block">Warmup Time</span>
                    <strong>{m.warmup_minutes === 0 ? 'Instant' : `${m.warmup_minutes} min`}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-coffee-400 block">PID Temperature</span>
                    <strong>{m.has_pid ? 'Yes (Digital)' : 'No (Thermostat)'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-coffee-400 block">Footprint</span>
                    <strong className="capitalize">{m.footprint} ({m.dimensions_in.width}" W)</strong>
                  </div>
                </div>

                <p className="text-xs text-coffee-700 bg-coffee-50/70 p-3 rounded border border-coffee-100/80 leading-relaxed italic">
                  "{m.my_take}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-coffee-100 text-coffee-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified: {m.last_verified}
                </span>
                <a
                  href={m.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-crema hover:underline flex items-center gap-1"
                >
                  Official Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grinders Grid */}
      {tab === 'grinders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGrinders.map(g => (
            <div key={g.id} className="bg-white rounded-xl border border-coffee-200 p-5 shadow-sm space-y-4 hover:border-coffee-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-coffee-500 tracking-wider block">{g.brand}</span>
                    <h3 className="font-serif font-bold text-coffee-950 text-lg leading-tight">{g.name}</h3>
                  </div>
                  <span className="font-serif font-bold text-coffee-950 text-lg bg-coffee-50 px-2.5 py-0.5 rounded border border-coffee-200/60">
                    ${g.price}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-coffee-100 my-2 text-coffee-700">
                  <div>
                    <span className="text-[10px] uppercase text-coffee-400 block">Burrs</span>
                    <strong className="capitalize">{g.burr_type} ({g.burr_size_mm}mm)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-coffee-400 block">Workflow</span>
                    <strong className="capitalize">{g.type.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-coffee-400 block">Retention</span>
                    <strong className="capitalize">{g.retention_level.replace('_', ' ')} ({g.retention_grams}g)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-coffee-400 block">Adjustment</span>
                    <strong>{g.is_stepless ? 'Stepless' : 'Micro-stepped'}</strong>
                  </div>
                </div>

                <p className="text-xs text-coffee-700 bg-coffee-50/70 p-3 rounded border border-coffee-100/80 leading-relaxed italic">
                  "{g.my_take}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-coffee-100 text-coffee-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified: {g.last_verified}
                </span>
                <a
                  href={g.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-crema hover:underline flex items-center gap-1"
                >
                  Official Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
