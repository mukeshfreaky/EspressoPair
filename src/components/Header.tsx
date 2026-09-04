import React from 'react';
import { Coffee, Info, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onOpenHowItWorks: () => void;
  onOpenGuides: () => void;
  onOpenCatalog: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenHowItWorks,
  onOpenGuides,
  onOpenCatalog
}) => {
  return (
    <header className="border-b border-coffee-200/80 bg-coffee-50/90 backdrop-blur-md sticky top-0 z-40">
      {/* Subtle Transparency Bar */}
      <div className="bg-coffee-100/90 text-coffee-700 text-xs px-4 py-1.5 border-b border-coffee-200/50 flex items-center justify-between">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <span className="truncate">
            <strong className="font-medium text-coffee-900">Independent & Rule-Based:</strong> No AI fluff. Recommendations are never bought or influenced by affiliate links.
          </span>
          <button 
            onClick={onOpenHowItWorks}
            className="text-crema underline hover:text-crema-hover ml-3 shrink-0"
          >
            How gear is chosen
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={onGoHome} 
          className="flex items-center gap-2.5 group text-left"
        >
          <div className="w-9 h-9 rounded-md bg-coffee-900 text-crema-light flex items-center justify-center shadow-sm group-hover:bg-coffee-800 transition-colors">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-coffee-950 block leading-tight">
              EspressoPair
            </span>
            <span className="text-[11px] text-coffee-600 font-sans tracking-wide block leading-none">
              Machine + grinder pairings that actually work
            </span>
          </div>
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onOpenCatalog}
            className="text-xs sm:text-sm font-medium text-coffee-700 hover:text-coffee-950 px-2.5 py-1.5 rounded hover:bg-coffee-100 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-coffee-500" />
            <span className="hidden sm:inline">Curated</span> Gear
          </button>
          
          <button
            onClick={onOpenGuides}
            className="text-xs sm:text-sm font-medium text-coffee-700 hover:text-coffee-950 px-2.5 py-1.5 rounded hover:bg-coffee-100 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-coffee-500" />
            <span className="hidden sm:inline">Editorial</span> Guides
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="text-xs sm:text-sm font-medium text-coffee-700 hover:text-coffee-950 px-2.5 py-1.5 rounded hover:bg-coffee-100 transition-colors flex items-center gap-1.5"
          >
            <Info className="w-4 h-4 text-coffee-500" />
            <span>How it Works</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

