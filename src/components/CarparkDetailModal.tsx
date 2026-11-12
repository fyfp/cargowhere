import React, { useState } from 'react';
import { X, Navigation, Bookmark, BookmarkCheck, Zap, Shield, Clock, ExternalLink, Info, Check, Copy } from 'lucide-react';
import { Carpark } from '../types/carpark';
import { calculateEstimatedFee } from '../services/carparkService';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(120); // 2 hours default
  const [entryHour, setEntryHour] = useState<number>(new Date().getHours());
  const [isWeekend, setIsWeekend] = useState<boolean>(new Date().getDay() === 0);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  if (!isOpen || !carpark) return null;

  const currentHour = new Date().getHours();
  const feeEstimate = calculateEstimatedFee(carpark, durationMinutes, entryHour, isWeekend);

  const handleCopyId = () => {
    navigator.clipboard.writeText(carpark.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const hoursDuration = (durationMinutes / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-semibold text-slate-900">{carpark.agency}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-700">Code: {carpark.id}</span>
                <span aria-hidden="true">·</span>
                <span>{carpark.area}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{carpark.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{carpark.address}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onToggleSave}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                title={isSaved ? 'Remove from saved' : 'Save carpark'}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-50" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal content body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Real-time Lots breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Real-Time Lots Availability</h3>
              <span className="text-[11px] text-slate-400 font-mono-numbers">
                Updated {carpark.lastUpdated}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] text-slate-500 font-medium">Motor Cars</div>
                <div className="mt-1 font-mono-numbers">
                  <span className="text-xl font-bold text-slate-900">{carpark.lots.car.available}</span>
                  <span className="text-xs text-slate-400 font-sans ml-1">/ {carpark.lots.car.total}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Standard EPS Lot</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] text-slate-500 font-medium">Motorcycles</div>
                <div className="mt-1 font-mono-numbers">
                  <span className="text-xl font-bold text-slate-900">
                    {carpark.lots.motorcycle?.available ?? 'N/A'}
                  </span>
                  <span className="text-xs text-slate-400 font-sans ml-1">
                    {carpark.lots.motorcycle ? `/ ${carpark.lots.motorcycle.total}` : ''}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">$0.20/hr or $0.65/day</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] text-slate-500 font-medium">EV Charging</div>
                <div className="mt-1 font-mono-numbers">
                  <span className="text-xl font-bold text-emerald-700">
                    {carpark.lots.ev?.available ?? '0'}
                  </span>
                  <span className="text-xs text-slate-400 font-sans ml-1">
                    {carpark.lots.ev ? `/ ${carpark.lots.ev.total}` : ''}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  {carpark.lots.ev?.operator ?? 'None'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] text-slate-500 font-medium">Gantry Clearance</div>
                <div className="mt-1 font-mono-numbers">
                  <span className="text-xl font-bold text-slate-900">{carpark.gantryHeight}</span>
                  <span className="text-xs text-slate-500 font-sans ml-1">meters</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Check vehicle height</div>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Parking Cost Estimator */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Parking Fee Calculator</h3>
                <p className="text-xs text-slate-500">Calculate exact fee for your stay</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">Estimated Fee</div>
                <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
                  {feeEstimate.isFree ? (
                    <span className="text-emerald-700">FREE</span>
                  ) : (
                    <span>${feeEstimate.totalCost.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Slider control */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-medium">
                <span>Duration: {hoursDuration} hours ({durationMinutes} mins)</span>
                <span className="text-slate-400">Grace period: {carpark.rates.gracePeriodMinutes} mins</span>
              </div>
              <input
                type="range"
                min="10"
                max="720"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono-numbers">
                <span>15m</span>
                <span>2h</span>
                <span>4h</span>
                <span>8h</span>
                <span>12h</span>
              </div>
            </div>

            {/* Timing selectors */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <label className="text-xs text-slate-600 block mb-1 font-medium">Entry Hour:</label>
                <select
                  value={entryHour}
                  onChange={(e) => setEntryHour(parseInt(e.target.value, 10))}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, '0')}:00 {h >= 12 ? 'PM' : 'AM'} {h >= 22 || h < 7 ? '(Night Rate)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-medium">Day Type:</label>
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-lg">
                  <button
                    onClick={() => setIsWeekend(false)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      !isWeekend ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Weekday
                  </button>
                  <button
                    onClick={() => setIsWeekend(true)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      isWeekend ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sun / Holiday
                  </button>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Fee Breakdown: </span>
              <span>{feeEstimate.breakdown}</span>
            </div>
          </div>

          {/* Section 3: 24-Hour Peak Occupancy Trend */}
          {carpark.peakHourTrend && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">24-Hour Occupancy Forecast</h3>
                <span className="text-xs text-slate-500 font-mono-numbers">Now: {currentHour}:00 ({carpark.peakHourTrend[currentHour]}% full)</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="h-28 flex items-end gap-1.5 pt-4">
                  {carpark.peakHourTrend.map((pct, hour) => {
                    const isNow = hour === currentHour;
                    return (
                      <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 hidden group-hover:block bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-20 font-mono">
                          {hour}:00 · {pct}%
                        </div>
                        <div
                          className={`w-full rounded-t-xs transition-all duration-200 ${
                            isNow
                              ? 'bg-slate-900 ring-2 ring-slate-900/20'
                              : pct > 85
                              ? 'bg-rose-500'
                              : pct > 70
                              ? 'bg-amber-500'
                              : 'bg-slate-300 group-hover:bg-slate-400'
                          }`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono-numbers pt-1 border-t border-slate-200">
                  <span>12 AM</span>
                  <span>6 AM</span>
                  <span>12 PM (Lunch)</span>
                  <span>6 PM (Dinner)</span>
                  <span>11 PM</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Specifications & Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Official Rates Structure
              </span>
              <div className="text-slate-800">
                <strong>Weekday Daytime:</strong> {carpark.rates.weekdayDay}
              </div>
              <div className="text-slate-800">
                <strong>Evening / Night:</strong> {carpark.rates.weekdayEve}
              </div>
              <div className="text-slate-800">
                <strong>Weekend / Sunday:</strong> {carpark.rates.weekend}
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Features & Regulations
              </span>
              <div className="text-slate-800">
                <strong>System:</strong> {carpark.parkingSystem}
              </div>
              <div className="text-slate-800">
                <strong>Free Parking:</strong> {carpark.freeParking}
              </div>
              <div className="text-slate-800">
                <strong>Night Parking Scheme:</strong> {carpark.nightParking ? 'Available ($5 Cap for HDB)' : 'No overnight parking'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyId}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId ? 'Copied ID!' : `Copy Carpark ID (${carpark.id})`}</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={`https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span>Waze</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
