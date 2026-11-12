import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark, VehicleType, getAvailabilityStatus } from '../types/carpark';

interface CarparkMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  onOpenDetails: (carpark: Carpark) => void;
  vehicleType: VehicleType;
  userLocation: { lat: number; lng: number } | null;
}

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  onOpenDetails,
  vehicleType,
  userLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Singapore center coordinates
      const map = L.map(mapContainerRef.current, {
        center: [1.3521, 103.8198],
        zoom: 12,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false,
      });

      // Add zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: 'custom-user-pin',
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute w-8 h-8 rounded-full bg-blue-500/25 animate-ping"></span>
              <span class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindPopup('<b>Your Current Location</b>', { closeButton: false });
      }
    }
  }, [userLocation]);

  // Update Carpark Markers whenever carparks list, vehicleType, or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    carparks.forEach((cp) => {
      let available = cp.lots.car.available;
      let total = cp.lots.car.total;

      if (vehicleType === 'motorcycle' && cp.lots.motorcycle) {
        available = cp.lots.motorcycle.available;
        total = cp.lots.motorcycle.total;
      } else if (vehicleType === 'heavy' && cp.lots.heavy) {
        available = cp.lots.heavy.available;
        total = cp.lots.heavy.total;
      } else if (vehicleType === 'ev' && cp.lots.ev) {
        available = cp.lots.ev.available;
        total = cp.lots.ev.total;
      }

      const status = getAvailabilityStatus(available, total);
      const isSelected = selectedCarpark?.id === cp.id;

      // Color coding
      let bgColor = 'bg-emerald-600 text-white';
      let ringColor = 'ring-emerald-200';
      if (status === 'almost_full' || status === 'filling_fast') {
        bgColor = 'bg-amber-600 text-white';
        ringColor = 'ring-amber-200';
      }
      if (status === 'full') {
        bgColor = 'bg-rose-600 text-white';
        ringColor = 'ring-rose-200';
      }
      if (vehicleType === 'ev') {
        bgColor = available > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white';
        ringColor = 'ring-emerald-200';
      }

      const pinHtml = `
        <div class="group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          <div class="flex items-center justify-center min-w-[36px] h-7 px-1.5 rounded-full font-mono text-[11px] font-bold shadow-md border-2 border-white ${bgColor} ring-2 ${ringColor}">
            ${vehicleType === 'ev' ? '⚡ ' : ''}${available}
          </div>
          <div class="w-1.5 h-1.5 bg-slate-800 rotate-45 mx-auto -mt-1 shadow-xs"></div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: pinHtml,
        iconSize: [42, 34],
        iconAnchor: [21, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: markerIcon,
        zIndexOffset: isSelected ? 500 : 10,
      });

      // Custom sleek popup
      const pctFree = total > 0 ? Math.round((available / total) * 100) : 0;
      const popupHtml = `
        <div class="w-64 p-3.5 bg-white text-slate-900 rounded-xl">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">${cp.agency} · ${cp.id}</span>
              <h4 class="text-sm font-semibold text-slate-900 leading-snug mt-0.5 line-clamp-1">${cp.name}</h4>
            </div>
          </div>

          <div class="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div class="flex items-baseline justify-between text-xs">
              <span class="text-slate-500 font-medium">Available Lots:</span>
              <span class="font-mono font-bold text-slate-900 text-sm">${available} <span class="text-[11px] text-slate-400 font-normal">/ ${total}</span></span>
            </div>
            <div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div class="h-full ${pctFree > 20 ? 'bg-emerald-500' : pctFree > 10 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${Math.min(100, Math.max(5, pctFree))}%"></div>
            </div>
          </div>

          <div class="mt-2 text-[11px] text-slate-600 space-y-0.5">
            <div><strong>Rates:</strong> ${cp.rates.weekdayDay}</div>
            <div><strong>Gantry Clearance:</strong> ${cp.gantryHeight}m</div>
            ${cp.freeParking !== 'NO' ? `<div class="text-emerald-700 font-medium">✓ ${cp.freeParking}</div>` : ''}
          </div>

          <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
            <button id="popup-btn-detail-${cp.id}" class="flex-1 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md text-center transition-colors">
              Details & Rates
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${cp.coordinates.lat},${cp.coordinates.lng}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md text-center transition-colors">
              Navigate
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: 'modern-popup',
      });

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      marker.on('popupopen', () => {
        // Wire up popup button
        const btn = document.getElementById(`popup-btn-detail-${cp.id}`);
        if (btn) {
          btn.onclick = () => {
            onOpenDetails(cp);
          };
        }
      });

      markersGroup.addLayer(marker);

      // If this carpark is selected, open popup and pan
      if (isSelected) {
        setTimeout(() => {
          marker.openPopup();
        }, 50);
      }
    });
  }, [carparks, selectedCarpark, vehicleType, onSelectCarpark, onOpenDetails]);

  // Center on selected carpark when changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedCarpark) {
      map.flyTo([selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng], 15, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedCarpark]);

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-100 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating map legend bottom-left */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-2.5 shadow-md text-xs pointer-events-auto max-w-[200px]">
        <div className="text-[11px] font-semibold text-slate-700 mb-1.5">Availability Legend</div>
        <div className="space-y-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Lots Available (&gt; 20)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Filling Up (5 - 20)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Nearly Full / Full (&lt; 5)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
