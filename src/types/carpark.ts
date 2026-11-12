export type AreaRegion = 
  | 'All'
  | 'Central / CBD'
  | 'Orchard'
  | 'Bugis & Marina'
  | 'East'
  | 'West'
  | 'North'
  | 'North-East'
  | 'Changi & Sentosa';

export type AgencyType = 'All' | 'HDB' | 'URA' | 'Commercial' | 'LTA';

export type VehicleType = 'car' | 'motorcycle' | 'heavy' | 'ev';

export interface CarparkLots {
  car: { total: number; available: number };
  motorcycle?: { total: number; available: number };
  heavy?: { total: number; available: number };
  ev?: { total: number; available: number; powerKw?: number; operator?: string };
}

export interface CarparkRates {
  weekdayDay: string; // e.g. "$1.20 / 30 mins"
  weekdayEve: string; // e.g. "$5.00 entry after 6pm"
  weekend: string; // e.g. "$2.40 1st hr, $0.60/15 mins"
  gracePeriodMinutes: number; // e.g. 10 or 15
  ratePer30MinStandard: number; // in SGD e.g. 0.60 or 1.20
}

export interface Carpark {
  id: string; // e.g. "ACB", "HE12", "MBS01"
  name: string;
  address: string;
  postalCode: string;
  area: AreaRegion;
  agency: 'HDB' | 'URA' | 'Commercial' | 'LTA';
  carparkType: 'Multi-Storey (MSCP)' | 'Basement' | 'Surface' | 'Mechanised';
  coordinates: {
    lat: number;
    lng: number;
  };
  lots: CarparkLots;
  parkingSystem: 'Electronic Parking System (EPS)' | 'Autopay / Barrier' | 'Coupon';
  shortTermParking: 'WHOLE DAY' | '7AM-10.30PM' | 'NO';
  freeParking: string; // e.g. "SUN & PH 7.00 AM - 10.30 PM" or "NO"
  nightParking: boolean;
  gantryHeight: number; // in meters, e.g. 2.1, 1.9, 2.0
  rates: CarparkRates;
  lastUpdated: string;
  isHdbApiMatched?: boolean;
  distanceKm?: number;
  peakHourTrend?: number[]; // 24 values representing occupancy % per hour 00:00 to 23:00
}

export type AvailabilityStatus = 'available' | 'filling_fast' | 'almost_full' | 'full';

export function getAvailabilityStatus(available: number, total: number): AvailabilityStatus {
  if (total <= 0) return 'full';
  const ratio = available / total;
  if (available <= 3 || ratio <= 0.05) return 'full';
  if (available <= 15 || ratio <= 0.20) return 'almost_full';
  if (ratio <= 0.45) return 'filling_fast';
  return 'available';
}

export interface FilterState {
  searchQuery: string;
  selectedArea: AreaRegion;
  selectedAgency: AgencyType;
  vehicleType: VehicleType;
  onlyAvailable: boolean;
  hasEv: boolean;
  hasFreeParking: boolean;
  shelteredOnly: boolean;
  sortBy: 'availability' | 'percentage' | 'cheapest' | 'distance' | 'name';
}
