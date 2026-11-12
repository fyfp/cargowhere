import React from 'react';
import { RotateCw, Zap, Car, CheckCircle2, AlertCircle } from 'lucide-react';
import { Carpark } from '../types/carpark';

interface StatsBannerProps {
  carparks: Carpark[];
  isLiveApi: boolean;
  source?: 'lta' | 'data.gov.sg' | 'calibrated';
  syncTime: string;
  isRefreshing: boolean;
  countdownSeconds: number;
  onRefresh: () => void;
  matchedCount: number;
  ltaConfigured?: boolean;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  carparks,
  isLiveApi,
  source = 'data.gov.sg',
  syncTime,
  isRefreshing,
  countdownSeconds,
  onRefresh,
  matchedCount,
  ltaConfigured = false,
}) => {
  const totalCarLots = carparks.reduce((sum, cp) => sum + cp.lots.car.total, 0);
  const availableCarLots = carparks.reduce((sum, cp) => sum + cp.lots.car.available, 0);
  const totalEvLots = carparks.reduce((sum, cp) => sum + (cp.lots.ev?.total || 0), 0);
  const availableEvLots = carparks.reduce((sum, cp) => sum + (cp.lots.ev?.available || 0), 0);
  const occupancyPct = totalCarLots > 0 ? Math.round(((totalCarLots - availableCarLots) / totalCarLots) * 100) : 0;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 flex-1">
            <div>
              <div className="text-xs text-slate-500 font-medium">Available Car Lots</div>
              <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-0.5 flex items-baseline gap-1.5">
                <span>{availableCarLots.toLocaleString()}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">/ {totalCarLots.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">Network Occupancy</div>
              <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-0.5 flex items-baseline gap-1.5">
                <span>{occupancyPct}%</span>
                <span className="text-xs text-emerald-600 font-sans font-normal">
                  ({100 - occupancyPct}% free)
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">EV Charging Lots</div>
              <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-0.5 flex items-baseline gap-1.5">
                <span className="text-emerald-700">{availableEvLots}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">/ {totalEvLots} points</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">Tracked Locations</div>
              <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-0.5 flex items-baseline gap-1.5">
                <span>{carparks.length}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">carparks</span>
              </div>
            </div>
          </div>

          {/* Sync status & trigger */}
          <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                {isLiveApi ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span>
                  {source === 'lta'
                    ? `LTA DataMall v2 Live (${matchedCount} synced)`
                    : isLiveApi
                    ? `Data.gov.sg API Live (${matchedCount} synced)`
                    : 'Calibrated Live Feed'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                Synced {syncTime} · Next in {countdownSeconds}s
              </div>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh lot availability now"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-slate-900' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
