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
      <div className="bg-coffee-100/90 text-coffee-700 text-xs px-3 sm:px-4 py-1.5 border-b border-coffee-200/50 flex items-center justify-between">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between min-w-0">
          <span className="truncate min-w-0 pr-2">
            <strong className="font-medium text-coffee-900">Independent & Rule-Based:</strong>{' '}
            <span className="hidden sm:inline">No AI fluff. Recommendations are never bought or influenced by affiliate links.</span>
          </span>
          <button 
            onClick={onOpenHowItWorks}
            className="text-crema underline hover:text-crema-hover shrink-0 whitespace-nowrap text-xs"
          >
            How gear is chosen
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between min-w-0">
        {/* Brand */}
        <button 
          onClick={onGoHome} 
          className="flex items-center gap-2 sm:gap-2.5 group text-left shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-coffee-900 text-crema-light flex items-center justify-center shadow-sm group-hover:bg-coffee-800 transition-colors shrink-0">
            <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-coffee-950 block leading-tight">
              EspressoPair
            </span>
            <span className="text-[11px] text-coffee-600 font-sans tracking-wide hidden sm:block leading-none">
              Machine + grinder pairings that actually work
            </span>
          </div>
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onOpenCatalog}
            className="text-xs sm:text-sm font-medium text-coffee-700 hover:text-coffee-950 px-2 sm:px-2.5 py-1.5 rounded hover:bg-coffee-100 transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-coffee-500" />
            <span><span className="hidden md:inline">Curated </span>Gear</span>
          </button>
          
          <button
            onClick={onOpenGuides}
            className="text-xs sm:text-sm font-medium text-coffee-700 hover:text-coffee-950 px-2 sm:px-2.5 py-1.5 rounded hover:bg-coffee-100 transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-coffee-500" />
            <span><span className="hidden md:inline">Editorial </span>Guides</span>
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="text-xs sm:text-sm font-medium text-coffee-700 hover:text-coffee-950 px-2 sm:px-2.5 py-1.5 rounded hover:bg-coffee-100 transition-colors flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-coffee-500" />
            <span className="hidden sm:inline">How it Works</span>
            <span className="sm:hidden">About</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

