import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

const LTA_DATAMALL_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LtaCarParkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // e.g. "1.29377 103.85718" (lat lng separated by space)
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y' | string; // C = Car, H = Heavy, Y = Motorcycle
  Agency: 'HDB' | 'LTA' | 'URA' | string;
}

export interface LtaApiResponse {
  'odata.metadata'?: string;
  value: LtaCarParkItem[];
}

interface CacheEntry {
  data: LtaApiResponse;
  timestamp: number;
}

// In-memory cache to prevent throttling by LTA (valid for 45 seconds)
let memoryCache: { [key: string]: CacheEntry } = {};
const CACHE_TTL_MS = 45 * 1000;

/**
 * Fetches carpark availability from LTA DataMall v2 endpoint
 */
export async function fetchLtaCarparkAvailability(options: {
  accountKey?: string;
  skip?: number;
  fetchAll?: boolean;
  bypassCache?: boolean;
}): Promise<{
  success: boolean;
  configured: boolean;
  count: number;
  data: LtaCarParkItem[];
  metadata?: string;
  cached?: boolean;
  message?: string;
  timestamp: string;
}> {
  const accountKey =
    options.accountKey ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY ||
    '';

  const timestamp = new Date().toISOString();

  // If no API key is supplied yet, return clear structured status without crashing
  if (!accountKey || accountKey.trim() === '' || accountKey === 'YOUR_LTA_DATAMALL_ACCOUNT_KEY') {
    return {
      success: false,
      configured: false,
      count: 0,
      data: [],
      message:
        'LTA_ACCOUNT_KEY is not configured yet. Please configure LTA_ACCOUNT_KEY in your environment or .env file.',
      timestamp,
    };
  }

  const cacheKey = `lta_carparks_skip_${options.skip || 0}_all_${Boolean(options.fetchAll)}`;
  const now = Date.now();

  // Check cache unless explicitly bypassed
  if (!options.bypassCache && memoryCache[cacheKey]) {
    const cached = memoryCache[cacheKey];
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return {
        success: true,
        configured: true,
        count: cached.data.value.length,
        data: cached.data.value,
        metadata: cached.data['odata.metadata'],
        cached: true,
        timestamp: new Date(cached.timestamp).toISOString(),
      };
    }
  }

  try {
    // If fetchAll is requested, paginate until all records are collected (500 records per page)
    if (options.fetchAll) {
      const allCarparks: LtaCarParkItem[] = [];
      let currentSkip = 0;
      let hasMore = true;
      let metadata = '';

      while (hasMore) {
        const url = `${LTA_DATAMALL_ENDPOINT}?$skip=${currentSkip}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            AccountKey: accountKey,
            accept: 'application/json',
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`LTA DataMall responded with ${res.status}: ${errText}`);
        }

        const json: LtaApiResponse = await res.json();
        metadata = json['odata.metadata'] || metadata;

        if (json.value && json.value.length > 0) {
          allCarparks.push(...json.value);
          currentSkip += json.value.length;
          // LTA returns batches of 500
          if (json.value.length < 500) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }

        // Safety cap to prevent runaway loops (maximum 10 pages / 5,000 records)
        if (currentSkip >= 5000) {
          hasMore = false;
        }
      }

      memoryCache[cacheKey] = {
        data: { value: allCarparks, 'odata.metadata': metadata },
        timestamp: now,
      };

      return {
        success: true,
        configured: true,
        count: allCarparks.length,
        data: allCarparks,
        metadata,
        cached: false,
        timestamp,
      };
    }

    // Single page fetch
    const skipParam = options.skip !== undefined ? `?$skip=${options.skip}` : '';
    const targetUrl = `${LTA_DATAMALL_ENDPOINT}${skipParam}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        AccountKey: accountKey,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        configured: true,
        count: 0,
        data: [],
        message: `LTA DataMall returned status ${response.status}: ${errText}`,
        timestamp,
      };
    }

    const payload: LtaApiResponse = await response.json();

    memoryCache[cacheKey] = {
      data: payload,
      timestamp: now,
    };

    return {
      success: true,
      configured: true,
      count: payload.value ? payload.value.length : 0,
      data: payload.value || [],
      metadata: payload['odata.metadata'],
      cached: false,
      timestamp,
    };
  } catch (error: any) {
    return {
      success: false,
      configured: true,
      count: 0,
      data: [],
      message: error?.message || 'Failed to connect to LTA DataMall',
      timestamp,
    };
  }
}

/**
 * Default serverless handler supporting Express / Node.js
 * Route: GET /api/carparkavailability
 */
export default async function handler(req: ExpressRequest, res: ExpressResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const accountKeyHeader = (req.headers['accountkey'] || req.headers['account-key']) as string | undefined;
  const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : undefined;
  const fetchAll = req.query.all === 'true' || req.query.fetchAll === 'true';
  const bypassCache = req.query.nocache === 'true';

  const result = await fetchLtaCarparkAvailability({
    accountKey: accountKeyHeader,
    skip,
    fetchAll,
    bypassCache,
  });

  const statusCode = result.configured ? (result.success ? 200 : 502) : 200;
  return res.status(statusCode).json(result);
}

/**
 * Standard Web Fetch API handler (for Edge / Vercel / Cloudflare Workers / Next.js)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const skipParam = url.searchParams.get('skip');
  const skip = skipParam ? parseInt(skipParam, 10) : undefined;
  const fetchAll = url.searchParams.get('all') === 'true' || url.searchParams.get('fetchAll') === 'true';
  const bypassCache = url.searchParams.get('nocache') === 'true';
  const accountKey = request.headers.get('AccountKey') || request.headers.get('accountkey') || undefined;

  const result = await fetchLtaCarparkAvailability({
    accountKey,
    skip,
    fetchAll,
    bypassCache,
  });

  return new Response(JSON.stringify(result), {
    status: result.configured ? (result.success ? 200 : 502) : 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=30',
    },
  });
}
