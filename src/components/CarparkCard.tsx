import React from 'react';
import { Bookmark, BookmarkCheck, Navigation, ArrowUpRight, Zap, ShieldAlert, Check } from 'lucide-react';
import { Carpark, VehicleType, getAvailabilityStatus } from '../types/carpark';

interface CarparkCardProps {
  carpark: Carpark;
  isSelected: boolean;
  isSaved: boolean;
  vehicleType: VehicleType;
  onSelect: () => void;
  onToggleSave: () => void;
  onOpenDetails: () => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  isSaved,
  vehicleType,
  onSelect,
  onToggleSave,
  onOpenDetails,
}) => {
  let available = carpark.lots.car.available;
  let total = carpark.lots.car.total;

  if (vehicleType === 'motorcycle' && carpark.lots.motorcycle) {
    available = carpark.lots.motorcycle.available;
    total = carpark.lots.motorcycle.total;
  } else if (vehicleType === 'heavy' && carpark.lots.heavy) {
    available = carpark.lots.heavy.available;
    total = carpark.lots.heavy.total;
  } else if (vehicleType === 'ev' && carpark.lots.ev) {
    available = carpark.lots.ev.available;
    total = carpark.lots.ev.total;
  }

  const status = getAvailabilityStatus(available, total);
  const occupancyPct = total > 0 ? Math.round(((total - available) / total) * 100) : 100;
  const freePct = 100 - occupancyPct;

  // Status text styling
  let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let statusLabel = 'Available Lots';
  if (status === 'almost_full' || status === 'filling_fast') {
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
    statusLabel = 'Filling Up Fast';
  }
  if (status === 'full') {
    statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
    statusLabel = 'Nearly Full / Full';
  }

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-xl border transition-all duration-150 cursor-pointer bg-white text-slate-900 ${
        isSelected
          ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Top Header: Agency & ID and Save button */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          {/* Metadata unboxed row */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="font-semibold text-slate-800">{carpark.agency}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-600">ID: {carpark.id}</span>
            <span aria-hidden="true">·</span>
            <span>{carpark.area}</span>
            {carpark.distanceKm !== undefined && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-700 font-mono-numbers">{carpark.distanceKm} km away</span>
              </>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight">
            {carpark.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-1">{carpark.address}</p>
        </div>

        {/* Bookmark action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          title={isSaved ? 'Remove from saved' : 'Save carpark'}
          className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-50" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Real-time lot gauge row */}
      <div className="mt-3.5 pt-3 border-t border-slate-100">
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${statusColor}`}>
              {statusLabel}
            </span>
            {carpark.isHdbApiMatched && (
              <span className="text-[11px] text-slate-400 font-mono-numbers">Live SG API</span>
            )}
          </div>
          <div className="font-mono-numbers text-right">
            <span className="text-lg font-bold text-slate-900">{available}</span>
            <span className="text-xs text-slate-400 font-sans ml-1">/ {total} lots</span>
          </div>
        </div>

        {/* Visual progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              freePct > 25 ? 'bg-emerald-500' : freePct > 10 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(4, freePct))}%` }}
          />
        </div>
      </div>

      {/* Feature & Rules chips */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
        <div>
          <span className="text-[11px] text-slate-400 block">Weekday Rates</span>
          <span className="font-medium text-slate-800 line-clamp-1">{carpark.rates.weekdayDay}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Gantry Clearance</span>
          <span className="font-medium text-slate-800 font-mono-numbers">{carpark.gantryHeight}m max height</span>
        </div>
      </div>

      {/* EV and Free parking notifications */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        {carpark.freeParking !== 'NO' && (
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>{carpark.freeParking}</span>
          </span>
        )}
        {carpark.lots.ev && carpark.lots.ev.total > 0 && (
          <span className="text-slate-700 flex items-center gap-1 font-mono-numbers">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>{carpark.lots.ev.available} / {carpark.lots.ev.total} EV lots ({carpark.lots.ev.operator})</span>
          </span>
        )}
      </div>

      {/* Card action footer */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 py-1 cursor-pointer"
        >
          <span>Pricing & Forecast</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        >
          <Navigation className="w-3 h-3" />
          <span>Directions</span>
        </a>
      </div>
    </div>
  );
};
