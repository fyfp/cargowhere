import React from 'react';
import { Search, SlidersHorizontal, Map, LayoutGrid, Split, X, Car, Bike, Truck, Zap } from 'lucide-react';
import { AreaRegion, AgencyType, VehicleType, FilterState } from '../types/carpark';

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  viewMode: 'split' | 'map' | 'grid';
  onViewModeChange: (mode: 'split' | 'map' | 'grid') => void;
  hasUserLocation: boolean;
  totalFiltered: number;
}

const AREAS: AreaRegion[] = [
  'All',
  'Central / CBD',
  'Orchard',
  'Bugis & Marina',
  'East',
  'West',
  'North',
  'North-East',
  'Changi & Sentosa',
];

const AGENCIES: { label: string; value: AgencyType }[] = [
  { label: 'All Operators', value: 'All' },
  { label: 'HDB Housing', value: 'HDB' },
  { label: 'Shopping Malls & Commercial', value: 'Commercial' },
  { label: 'URA Public', value: 'URA' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  viewMode,
  onViewModeChange,
  hasUserLocation,
  totalFiltered,
}) => {
  const isFiltered =
    filters.searchQuery ||
    filters.selectedArea !== 'All' ||
    filters.selectedAgency !== 'All' ||
    filters.vehicleType !== 'car' ||
    filters.onlyAvailable ||
    filters.hasEv ||
    filters.hasFreeParking ||
    filters.shelteredOnly;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Row 1: Search, Vehicle segment, View toggles, Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px] max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onChange({ searchQuery: e.target.value })}
              placeholder="Search carpark name, ID (e.g. HE12, MBS), street, mall..."
              className="w-full pl-9.5 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onChange({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Vehicle type segmented control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => onChange({ vehicleType: 'car' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filters.vehicleType === 'car'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Cars</span>
            </button>
            <button
              onClick={() => onChange({ vehicleType: 'motorcycle' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filters.vehicleType === 'motorcycle'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Motorcycles</span>
            </button>
            <button
              onClick={() => onChange({ vehicleType: 'ev' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filters.vehicleType === 'ev'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>EV Only</span>
            </button>
            <button
              onClick={() => onChange({ vehicleType: 'heavy' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filters.vehicleType === 'heavy'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Heavy</span>
            </button>
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 py-2 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            >
              <option value="availability">Sort: Most Available Lots</option>
              <option value="percentage">Sort: Highest Free %</option>
              <option value="cheapest">Sort: Cheapest Rates</option>
              {hasUserLocation && <option value="distance">Sort: Nearest to Me</option>}
              <option value="name">Sort: Alphabetical</option>
            </select>

            {/* View layout segmented control */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => onViewModeChange('split')}
                title="Split Map and List View"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Split className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('map')}
                title="Full Interactive Map"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Map className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('grid')}
                title="Grid Directory View"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Areas Horizontal Scroll & Quick Filter Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Area buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <span className="text-slate-400 mr-1 text-[11px] font-medium uppercase tracking-wider shrink-0">
              Region:
            </span>
            {AREAS.map((area) => (
              <button
                key={area}
                onClick={() => onChange({ selectedArea: area })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  filters.selectedArea === area
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          {/* Quick toggle chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">
            <button
              onClick={() => onChange({ onlyAvailable: !filters.onlyAvailable })}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filters.onlyAvailable
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Has &gt; 15 Lots
            </button>

            <button
              onClick={() => onChange({ hasFreeParking: !filters.hasFreeParking })}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filters.hasFreeParking
                  ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Free Parking Scheme
            </button>

            <button
              onClick={() => onChange({ shelteredOnly: !filters.shelteredOnly })}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filters.shelteredOnly
                  ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Sheltered Only
            </button>

            {isFiltered && (
              <button
                onClick={onReset}
                className="text-slate-500 hover:text-slate-900 text-xs font-medium underline underline-offset-2 ml-1 cursor-pointer shrink-0"
              >
                Reset filters
              </button>
            )}

            <div className="text-[11px] text-slate-400 font-mono-numbers pl-2 border-l border-slate-200 shrink-0">
              {totalFiltered} results
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
