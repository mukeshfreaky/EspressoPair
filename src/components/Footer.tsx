import React from 'react';
import { Coffee, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenHowItWorks: () => void;
  onOpenGuides: () => void;
  onOpenCatalog: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenHowItWorks,
  onOpenGuides,
  onOpenCatalog
}) => {
  return (
    <footer className="border-t border-coffee-200 bg-coffee-100/60 mt-20 text-coffee-800 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-coffee-950 font-serif font-bold text-lg">
              <Coffee className="w-5 h-5 text-crema" />
              EspressoPair
            </div>
            <p className="text-coffee-600 text-xs sm:text-sm leading-relaxed max-w-md">
              A personal, opinionated tool built by someone who spent way too many evenings comparing dual boilers, thermojets, flat burrs, and 900 conflicting forum opinions. No AI marketing fluff. Just deterministic rules and equipment that actually makes sense together.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-coffee-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Catalog last verified: <strong>September 2026</strong></span>
            </div>
          </div>

          {/* Col 2: Guides */}
          <div>
            <h4 className="font-serif font-bold text-coffee-900 mb-3 text-sm">Free Guides</h4>
            <ul className="space-y-2 text-xs text-coffee-600">
              <li>
                <button onClick={onOpenGuides} className="hover:text-crema transition-colors text-left">
                  Machine vs. Grinder Budget
                </button>
              </li>
              <li>
                <button onClick={onOpenGuides} className="hover:text-crema transition-colors text-left">
                  Single Boiler vs. Dual Boiler vs. HX
                </button>
              </li>
              <li>
                <button onClick={onOpenGuides} className="hover:text-crema transition-colors text-left">
                  Single-Dosing vs. Hopper Workflow
                </button>
              </li>
              <li>
                <button onClick={onOpenCatalog} className="hover:text-crema transition-colors text-left">
                  Curated Gear Catalog (15 Machines, 12 Grinders)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Transparency */}
          <div>
            <h4 className="font-serif font-bold text-coffee-900 mb-3 text-sm">Transparency</h4>
            <ul className="space-y-2 text-xs text-coffee-600">
              <li>
                <button onClick={onOpenHowItWorks} className="hover:text-crema transition-colors text-left">
                  How recommendations are scored
                </button>
              </li>
              <li>
                <button onClick={onOpenHowItWorks} className="hover:text-crema transition-colors text-left">
                  Affiliate Disclosure Policy
                </button>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-crema transition-colors"
                >
                  Version 1.0 (Public release)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Box */}
        <div className="pt-6 border-t border-coffee-200/80 text-[11px] leading-relaxed text-coffee-500 space-y-2">
          <p>
            <strong>Affiliate Disclosure:</strong> EspressoPair is an independent editorial recommendation project. If you purchase equipment through merchant links (such as Clive Coffee, Seattle Coffee Gear, or Amazon), I may earn an affiliate commission at no extra cost to you. These commercial relationships never alter ranking scores, budget constraints, or algorithmic pairing logic.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-coffee-400">
            <p>© 2026 EspressoPair. Built with coffee and care.</p>
            <p className="flex items-center gap-1">
              Pulling shots at 9 bars <Heart className="w-3 h-3 text-crema inline" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

