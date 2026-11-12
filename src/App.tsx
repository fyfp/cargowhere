/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { CarparkMap } from './components/CarparkMap';
import { CarparkCard } from './components/CarparkCard';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { ParkingRatesModal } from './components/ParkingRatesModal';
import { INITIAL_SINGAPORE_CARPARKS } from './data/singaporeCarparks';
import { fetchLiveCarparkData, calculateDistanceKm } from './services/carparkService';
import { Carpark, FilterState, AreaRegion } from './types/carpark';
import { Car, Compass, Layers, ShieldCheck, MapPin, Zap, RefreshCw, X, AlertTriangle } from 'lucide-react';

const LOCAL_STORAGE_SAVED_KEY = 'sg_parksense_saved_carparks_v1';

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_SINGAPORE_CARPARKS);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(true);
  const [syncTime, setSyncTime] = useState<string>('Just now');
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(60);

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState<'map' | 'explore' | 'cbd' | 'rates' | 'saved'>('map');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'grid'>('split');
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [detailModalCarpark, setDetailModalCarpark] = useState<Carpark | null>(null);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState<boolean>(false);

  // Saved Bookmarks
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
      return stored ? JSON.parse(stored) : ['MBS01', 'ACB', 'ION01'];
    } catch {
      return ['MBS01', 'ACB', 'ION01'];
    }
  });

  // User Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedArea: 'All',
    selectedAgency: 'All',
    vehicleType: 'car',
    onlyAvailable: false,
    hasEv: false,
    hasFreeParking: false,
    shelteredOnly: false,
    sortBy: 'availability',
  });

  // Save Bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedIds]);

  // Initial Fetch & Refresh Handler
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLiveCarparkData(carparks);
      // Re-calculate distances if user location exists
      let updated = result.carparks;
      if (userLocation) {
        updated = updated.map((cp) => ({
          ...cp,
          distanceKm: calculateDistanceKm(
            userLocation.lat,
            userLocation.lng,
            cp.coordinates.lat,
            cp.coordinates.lng
          ),
        }));
      }
      setCarparks(updated);
      setIsLiveApi(result.isLiveApi);
      setSyncTime(result.syncTime);
      setMatchedCount(result.matchedCount);
      setCountdownSeconds(60);
    } catch (err) {
      console.error('Error refreshing carpark data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [carparks, userLocation]);

  // First mount data sync
  useEffect(() => {
    handleRefreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 60-Second Auto Refresh Timer (matches Singapore LTA update intervals)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          handleRefreshData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleRefreshData]);

  // Handle Find Nearby Lots
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      setLocationToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationToast(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);

        // Update carparks with distance
        setCarparks((prev) =>
          prev.map((cp) => ({
            ...cp,
            distanceKm: calculateDistanceKm(loc.lat, loc.lng, cp.coordinates.lat, cp.coordinates.lng),
          }))
        );

        setFilters((f) => ({ ...f, sortBy: 'distance' }));
        setIsLocating(false);
        setLocationToast(`Location identified. Sorted by distance to you.`);
        setTimeout(() => setLocationToast(null), 4000);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback: simulate user in Central Singapore (Marina Bay)
        const fallbackLoc = { lat: 1.285, lng: 103.854 };
        setUserLocation(fallbackLoc);
        setCarparks((prev) =>
          prev.map((cp) => ({
            ...cp,
            distanceKm: calculateDistanceKm(
              fallbackLoc.lat,
              fallbackLoc.lng,
              cp.coordinates.lat,
              cp.coordinates.lng
            ),
          }))
        );
        setFilters((f) => ({ ...f, sortBy: 'distance' }));
        setIsLocating(false);
        setLocationToast(`Using Central Singapore as reference point.`);
        setTimeout(() => setLocationToast(null), 4000);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Bookmark Toggle
  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Navigation tab switcher
  const handleNavigateTab = (tab: 'map' | 'explore' | 'cbd' | 'rates' | 'saved') => {
    setActiveTab(tab);
    if (tab === 'map') {
      setViewMode('split');
    } else if (tab === 'explore') {
      setViewMode('grid');
    } else if (tab === 'cbd') {
      setViewMode('split');
      setFilters((f) => ({ ...f, selectedArea: 'Central / CBD' }));
    } else if (tab === 'rates') {
      setIsRatesModalOpen(true);
    } else if (tab === 'saved') {
      setViewMode('grid');
    }
  };

  // Filter & Sort Logic
  const filteredCarparks = useMemo(() => {
    let list = [...carparks];

    // Filter by Saved tab
    if (activeTab === 'saved') {
      list = list.filter((cp) => savedIds.includes(cp.id));
    }

    // Filter by Area
    if (filters.selectedArea !== 'All') {
      list = list.filter((cp) => cp.area === filters.selectedArea);
    }

    // Filter by Agency
    if (filters.selectedAgency !== 'All') {
      list = list.filter((cp) => cp.agency === filters.selectedAgency);
    }

    // Filter by Vehicle Type
    if (filters.vehicleType === 'ev') {
      list = list.filter((cp) => (cp.lots.ev?.total ?? 0) > 0);
    } else if (filters.vehicleType === 'motorcycle') {
      list = list.filter((cp) => (cp.lots.motorcycle?.total ?? 0) > 0);
    } else if (filters.vehicleType === 'heavy') {
      list = list.filter((cp) => (cp.lots.heavy?.total ?? 0) > 0);
    }

    // Quick toggles
    if (filters.onlyAvailable) {
      list = list.filter((cp) => cp.lots.car.available > 15);
    }
    if (filters.hasFreeParking) {
      list = list.filter((cp) => cp.freeParking !== 'NO');
    }
    if (filters.shelteredOnly) {
      list = list.filter((cp) => cp.carparkType !== 'Surface');
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (cp) =>
          cp.name.toLowerCase().includes(q) ||
          cp.id.toLowerCase().includes(q) ||
          cp.address.toLowerCase().includes(q) ||
          cp.area.toLowerCase().includes(q) ||
          cp.postalCode.includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (filters.sortBy === 'availability') {
        return b.lots.car.available - a.lots.car.available;
      }
      if (filters.sortBy === 'percentage') {
        const ratioA = a.lots.car.total > 0 ? a.lots.car.available / a.lots.car.total : 0;
        const ratioB = b.lots.car.total > 0 ? b.lots.car.available / b.lots.car.total : 0;
        return ratioB - ratioA;
      }
      if (filters.sortBy === 'cheapest') {
        return a.rates.ratePer30MinStandard - b.rates.ratePer30MinStandard;
      }
      if (filters.sortBy === 'distance') {
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      }
      if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [carparks, filters, activeTab, savedIds]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedArea: 'All',
      selectedAgency: 'All',
      vehicleType: 'car',
      onlyAvailable: false,
      hasEv: false,
      hasFreeParking: false,
      shelteredOnly: false,
      sortBy: 'availability',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <Header
        onFindNearby={handleFindNearby}
        isLocating={isLocating}
        onNavigateTab={handleNavigateTab}
        activeTab={activeTab}
        savedCount={savedIds.length}
      />

      {/* Network Stats & Live API Status Banner */}
      <StatsBanner
        carparks={carparks}
        isLiveApi={isLiveApi}
        syncTime={syncTime}
        isRefreshing={isRefreshing}
        countdownSeconds={countdownSeconds}
        onRefresh={handleRefreshData}
        matchedCount={matchedCount}
      />

      {/* Filters & Search Control Bar */}
      <FilterBar
        filters={filters}
        onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasUserLocation={!!userLocation}
        totalFiltered={filteredCarparks.length}
      />

      {/* Toast notification for GPS location */}
      {locationToast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 w-full">
          <div className="p-2.5 bg-slate-900 text-white text-xs rounded-lg flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{locationToast}</span>
            </div>
            <button
              onClick={() => setLocationToast(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* VIEW MODE 1: Split View (Map + Side List) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-270px)] min-h-[580px]">
            {/* Left: Map viewport */}
            <div className="lg:col-span-7 h-[360px] lg:h-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative">
              <CarparkMap
                carparks={filteredCarparks}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={(cp) => setSelectedCarpark(cp)}
                onOpenDetails={(cp) => setDetailModalCarpark(cp)}
                vehicleType={filters.vehicleType}
                userLocation={userLocation}
              />
            </div>

            {/* Right: Scrollable carparks list */}
            <div className="lg:col-span-5 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {filters.selectedArea === 'All' ? 'Singapore Carparks' : `${filters.selectedArea} Carparks`}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono-numbers">
                    Showing {filteredCarparks.length} matching locations
                  </div>
                </div>
                {selectedCarpark && (
                  <button
                    onClick={() => setSelectedCarpark(null)}
                    className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {filteredCarparks.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-slate-900">No carparks match your filters</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Try adjusting the area, searching with a broader keyword, or turning off restrictive lot filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  filteredCarparks.map((carpark) => (
                    <CarparkCard
                      key={carpark.id}
                      carpark={carpark}
                      isSelected={selectedCarpark?.id === carpark.id}
                      isSaved={savedIds.includes(carpark.id)}
                      vehicleType={filters.vehicleType}
                      onSelect={() => setSelectedCarpark(carpark)}
                      onToggleSave={() => handleToggleSave(carpark.id)}
                      onOpenDetails={() => setDetailModalCarpark(carpark)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: Full Map View */}
        {viewMode === 'map' && (
          <div className="w-full h-[calc(100vh-270px)] min-h-[580px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative">
            <CarparkMap
              carparks={filteredCarparks}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={(cp) => setSelectedCarpark(cp)}
              onOpenDetails={(cp) => setDetailModalCarpark(cp)}
              vehicleType={filters.vehicleType}
              userLocation={userLocation}
            />

            {/* Floating Quick Drawer for Selected Carpark */}
            {selectedCarpark && (
              <div className="absolute bottom-6 right-6 z-20 w-80 max-w-[calc(100%-2rem)]">
                <CarparkCard
                  carpark={selectedCarpark}
                  isSelected={true}
                  isSaved={savedIds.includes(selectedCarpark.id)}
                  vehicleType={filters.vehicleType}
                  onSelect={() => {}}
                  onToggleSave={() => handleToggleSave(selectedCarpark.id)}
                  onOpenDetails={() => setDetailModalCarpark(selectedCarpark)}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE 3: Grid Cards Directory */}
        {viewMode === 'grid' && (
          <div>
            {activeTab === 'saved' && (
              <div className="mb-4 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-900">Bookmarked Locations:</strong> Showing your personal quick-access carparks saved on this device.
                </div>
                <button
                  onClick={() => handleNavigateTab('explore')}
                  className="text-xs text-slate-700 hover:text-slate-900 font-medium underline underline-offset-2 cursor-pointer"
                >
                  Browse all carparks
                </button>
              </div>
            )}

            {filteredCarparks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-6">
                <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-slate-900">
                  {activeTab === 'saved' ? 'No saved carparks yet' : 'No carparks match your filters'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {activeTab === 'saved'
                    ? 'Click the bookmark icon on any carpark card to save it for quick lot status checks on your commute.'
                    : 'Try clearing your search terms or picking another Singapore planning region.'}
                </p>
                <button
                  onClick={activeTab === 'saved' ? () => handleNavigateTab('explore') : handleResetFilters}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {activeTab === 'saved' ? 'Explore All Carparks' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCarparks.map((carpark) => (
                  <CarparkCard
                    key={carpark.id}
                    carpark={carpark}
                    isSelected={selectedCarpark?.id === carpark.id}
                    isSaved={savedIds.includes(carpark.id)}
                    vehicleType={filters.vehicleType}
                    onSelect={() => setSelectedCarpark(carpark)}
                    onToggleSave={() => handleToggleSave(carpark.id)}
                    onOpenDetails={() => setDetailModalCarpark(carpark)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Carpark In-Depth Details & Parking Calculator Modal */}
      <CarparkDetailModal
        carpark={detailModalCarpark}
        isOpen={!!detailModalCarpark}
        onClose={() => setDetailModalCarpark(null)}
        isSaved={detailModalCarpark ? savedIds.includes(detailModalCarpark.id) : false}
        onToggleSave={() => detailModalCarpark && handleToggleSave(detailModalCarpark.id)}
      />

      {/* Driver Parking Rates & HDB/URA Regulations Reference Modal */}
      <ParkingRatesModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SG ParkSense</span>
            <span aria-hidden="true">·</span>
            <span>Real-time availability feed for Singapore drivers</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRatesModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              HDB/URA Rates Guide
            </button>
            <span aria-hidden="true">·</span>
            <span>Data source: Data.gov.sg & LTA DataMall</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
