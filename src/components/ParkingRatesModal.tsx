import React from 'react';
import { X, Check, AlertCircle, HelpCircle } from 'lucide-react';

interface ParkingRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParkingRatesModal: React.FC<ParkingRatesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Driver Reference Guide
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Singapore Parking Rates & Regulations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm text-slate-700">
          {/* HDB Rates Comparison */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. HDB & URA Standard Parking Charges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 block text-sm">Non-Central Area (Heartlands)</span>
                <p className="text-slate-600">
                  Tampines, Jurong, Woodlands, Bedok, Bishan, Ang Mo Kio, Yishun, Clementi, etc.
                </p>
                <div className="font-mono-numbers text-slate-900 font-semibold pt-1">
                  $0.60 per 30 minutes
                </div>
                <div className="text-[11px] text-slate-500">All days, 7:00 AM – 10:30 PM</div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 block text-sm">Central Area (CBD & Town)</span>
                <p className="text-slate-600">
                  Tanjong Pagar, Chinatown, Bugis, Bras Basah, Albert Centre, Rochor, etc.
                </p>
                <div className="font-mono-numbers text-slate-900 font-semibold pt-1">
                  $1.20 per 30 mins (Peak: 7am - 5pm Mon-Sat)
                </div>
                <div className="text-[11px] text-slate-500">$0.60 per 30 mins during off-peak hours</div>
              </div>
            </div>
          </div>

          {/* Special Schemes */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Free Parking & Night Parking Schemes</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 block">Sunday & Public Holiday Free Parking Scheme (FPS)</strong>
                  <p className="text-emerald-800 mt-0.5">
                    Free parking from <strong>7:30 AM to 10:30 PM</strong> on Sundays and Public Holidays at all designated HDB carparks displaying the orange FPS plate sign.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-slate-900 shrink-0 mt-1.5" />
                <div>
                  <strong className="text-slate-900 block">Night Parking Cap ($5.00 Maximum)</strong>
                  <p className="text-slate-600 mt-0.5">
                    For stays spanning <strong>10:30 PM to 7:00 AM</strong> the next morning, charges are $0.60 per 30 mins, but capped at a flat maximum of <strong>$5.00 per night</strong> across all HDB electronic carparks.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-slate-900 shrink-0 mt-1.5" />
                <div>
                  <strong className="text-slate-900 block">Grace Periods (10 to 15 Mins)</strong>
                  <p className="text-slate-600 mt-0.5">
                    HDB EPS carparks grant a <strong>10-minute grace period</strong>. If you enter and exit within 10 minutes (e.g. drop-off / deliveries), no parking fee is deducted. Many shopping malls allow 10 to 15 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Motorcycle and EV rules */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">3. Motorcycles & EV Charging Networks</h3>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div>
                <strong>Motorcycle Parking:</strong> $0.20 per hour (capped at $0.65 for day 7am-10:30pm, and $0.65 for night 10:30pm-7am).
              </div>
              <div>
                <strong>Electric Vehicle (EV) Charging:</strong> Normal parking gantry fees still apply while charging unless explicitly waived by commercial mall promotions. Common operators in HDB/malls: SP Mobility, CDG ENGIE, Shell Recharge, Charge+.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Got it, return to carparks
          </button>
        </div>
      </div>
    </div>
  );
};
