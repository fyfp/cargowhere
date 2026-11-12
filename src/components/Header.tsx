import React from 'react';
import { Navigation, Compass } from 'lucide-react';

interface HeaderProps {
  onFindNearby: () => void;
  isLocating: boolean;
  onNavigateTab: (tab: 'map' | 'explore' | 'cbd' | 'rates' | 'saved') => void;
  activeTab: string;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onFindNearby,
  isLocating,
  onNavigateTab,
  activeTab,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand title, one line */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg tracking-wider">
              SG
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigateTab('map');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-slate-700 transition-colors"
            >
              SG ParkSense
            </a>
          </div>

          {/* Zone 2: 4-5 nav links, 1-2 word labels, single-line */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigateTab('map')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeTab === 'map' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              Live Map
            </button>
            <button
              onClick={() => onNavigateTab('explore')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeTab === 'explore' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              Explore Carparks
            </button>
            <button
              onClick={() => onNavigateTab('cbd')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeTab === 'cbd' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              CBD & Orchard
            </button>
            <button
              onClick={() => onNavigateTab('rates')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeTab === 'rates' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              Rates Guide
            </button>
            <button
              onClick={() => onNavigateTab('saved')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saved' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              <span>Saved Lots</span>
              {savedCount > 0 && (
                <span className="text-xs font-mono tabular-nums px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onFindNearby}
              disabled={isLocating}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-70 whitespace-nowrap shrink-0 shadow-xs"
            >
              {isLocating ? (
                <>
                  <Compass className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Find Nearby Lots</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
