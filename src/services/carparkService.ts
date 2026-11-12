import { Carpark } from '../types/carpark';

interface DataGovSgCarparkInfo {
  total_lots: string;
  lot_type: string; // 'C' | 'Y' | 'H'
  lots_available: string;
}

interface DataGovSgCarparkItem {
  carpark_number: string;
  update_datetime: string;
  carpark_info: DataGovSgCarparkInfo[];
}

interface DataGovSgResponse {
  items: Array<{
    timestamp: string;
    carpark_data: DataGovSgCarparkItem[];
  }>;
}

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates estimated parking fee given duration, time, and carpark pricing structure
 */
export function calculateEstimatedFee(
  carpark: Carpark,
  durationMinutes: number,
  entryHour: number = 14,
  isWeekend: boolean = false
): { totalCost: number; breakdown: string; isFree: boolean } {
  // Check grace period
  if (durationMinutes <= carpark.rates.gracePeriodMinutes) {
    return {
      totalCost: 0,
      breakdown: `Within ${carpark.rates.gracePeriodMinutes}-minute grace period (Free)`,
      isFree: true,
    };
  }

  // Check Sunday Free Parking Scheme for HDB
  if (isWeekend && carpark.freeParking.includes('SUN') && entryHour >= 7 && entryHour <= 22) {
    return {
      totalCost: 0,
      breakdown: `Sunday & Public Holiday Free Parking Scheme (7am-10:30pm)`,
      isFree: true,
    };
  }

  const billableMinutes = durationMinutes;
  const halfHours = Math.ceil(billableMinutes / 30);

  // Simplified calculation based on carpark type & standard rate
  let totalCost = 0;
  let breakdown = '';

  const isNight = entryHour >= 22 || entryHour < 7;

  if (carpark.agency === 'HDB') {
    if (isNight && carpark.nightParking) {
      // HDB night parking is capped at $5.00
      const standardCost = halfHours * carpark.rates.ratePer30MinStandard;
      totalCost = Math.min(standardCost, 5.0);
      breakdown = `${halfHours} x 30m @ $${carpark.rates.ratePer30MinStandard.toFixed(2)} (Night Cap: max $5.00)`;
    } else {
      totalCost = halfHours * carpark.rates.ratePer30MinStandard;
      breakdown = `${halfHours} half-hour blocks @ $${carpark.rates.ratePer30MinStandard.toFixed(2)} / 30 mins`;
    }
  } else {
    // Commercial rates
    const hours = Math.ceil(billableMinutes / 60);
    if (isNight) {
      totalCost = 4.0; // Flat night entry estimate
      breakdown = `Evening / Night Per-Entry Rate (~$4.00 - $7.00)`;
    } else {
      const baseHour = carpark.rates.ratePer30MinStandard * 2;
      totalCost = hours * baseHour;
      breakdown = `${hours} hours @ approx $${baseHour.toFixed(2)}/hr`;
    }
  }

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    breakdown,
    isFree: false,
  };
}

/**
 * Fetches real-time carpark availability directly from Singapore Data.gov.sg API
 * Falls back seamlessly to calibrated time-of-day model if offline or rate limited.
 */
export async function fetchLiveCarparkData(
  currentCarparks: Carpark[]
): Promise<{
  carparks: Carpark[];
  isLiveApi: boolean;
  syncTime: string;
  matchedCount: number;
}> {
  const currentHour = new Date().getHours();
  const timeString = new Date().toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://api.data.gov.sg/v1/transport/carpark-availability', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Data.gov.sg responded with status ${response.status}`);
    }

    const data: DataGovSgResponse = await response.json();
    const carparkData = data.items?.[0]?.carpark_data || [];

    // Map by carpark_number
    const apiMap = new Map<string, DataGovSgCarparkItem>();
    for (const item of carparkData) {
      apiMap.set(item.carpark_number.toUpperCase(), item);
    }

    let matched = 0;

    const updatedCarparks = currentCarparks.map((cp) => {
      const match = apiMap.get(cp.id.toUpperCase());
      if (match) {
        matched++;
        const carInfo = match.carpark_info.find((i) => i.lot_type === 'C');
        const motoInfo = match.carpark_info.find((i) => i.lot_type === 'Y');
        const heavyInfo = match.carpark_info.find((i) => i.lot_type === 'H');

        const totalCarLots = carInfo ? parseInt(carInfo.total_lots, 10) || cp.lots.car.total : cp.lots.car.total;
        const availCarLots = carInfo ? Math.min(parseInt(carInfo.lots_available, 10) || 0, totalCarLots) : cp.lots.car.available;

        return {
          ...cp,
          isHdbApiMatched: true,
          lastUpdated: timeString,
          lots: {
            ...cp.lots,
            car: {
              total: totalCarLots,
              available: availCarLots,
            },
            motorcycle: motoInfo
              ? {
                  total: parseInt(motoInfo.total_lots, 10) || (cp.lots.motorcycle?.total ?? 50),
                  available: parseInt(motoInfo.lots_available, 10) || 0,
                }
              : cp.lots.motorcycle,
            heavy: heavyInfo
              ? {
                  total: parseInt(heavyInfo.total_lots, 10) || (cp.lots.heavy?.total ?? 10),
                  available: parseInt(heavyInfo.lots_available, 10) || 0,
                }
              : cp.lots.heavy,
          },
        };
      }

      // For commercial carparks or unmapped ones, compute realistic live state using time-of-day curve
      const trendOccupancyPct = (cp.peakHourTrend?.[currentHour] ?? 70) / 100;
      // Slight natural noise ±3%
      const jitter = (Math.sin(Date.now() / 15000 + cp.name.length) * 0.04);
      const effectiveOccupancy = Math.max(0.05, Math.min(0.98, trendOccupancyPct + jitter));
      const simulatedAvailable = Math.max(1, Math.round(cp.lots.car.total * (1 - effectiveOccupancy)));

      return {
        ...cp,
        lastUpdated: timeString,
        lots: {
          ...cp.lots,
          car: {
            ...cp.lots.car,
            available: simulatedAvailable,
          },
        },
      };
    });

    return {
      carparks: updatedCarparks,
      isLiveApi: true,
      syncTime: timeString,
      matchedCount: matched,
    };
  } catch {
    // Graceful fallback to calibrated live simulation
    const updatedCarparks = currentCarparks.map((cp) => {
      const trendOccupancyPct = (cp.peakHourTrend?.[currentHour] ?? 65) / 100;
      const jitter = Math.sin(Date.now() / 20000 + cp.id.charCodeAt(0)) * 0.03;
      const effectiveOccupancy = Math.max(0.04, Math.min(0.98, trendOccupancyPct + jitter));
      const calculatedAvail = Math.max(2, Math.round(cp.lots.car.total * (1 - effectiveOccupancy)));

      return {
        ...cp,
        lastUpdated: timeString,
        lots: {
          ...cp.lots,
          car: {
            ...cp.lots.car,
            available: calculatedAvail,
          },
        },
      };
    });

    return {
      carparks: updatedCarparks,
      isLiveApi: false,
      syncTime: timeString,
      matchedCount: 0,
    };
  }
}
