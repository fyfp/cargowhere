import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  service: string;
  ltaDatamallConfigured: boolean;
  endpoints: {
    health: string;
    carparkAvailability: string;
  };
}

/**
 * Health check endpoint for monitoring and serverless deployment status.
 * Route: GET /api/health
 */
export async function handleHealthCheck(): Promise<HealthResponse> {
  const isLtaConfigured = Boolean(
    process.env.LTA_ACCOUNT_KEY && process.env.LTA_ACCOUNT_KEY.trim() !== ''
  );

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'sg-parksense-lta-bridge',
    ltaDatamallConfigured: isLtaConfigured,
    endpoints: {
      health: '/api/health',
      carparkAvailability: '/api/carparkavailability',
    },
  };
}

/**
 * Default handler supporting Express / Node.js serverless runtimes
 */
export default async function handler(req: ExpressRequest, res: ExpressResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const data = await handleHealthCheck();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Internal health check failure',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Standard Web Fetch API handler (for Edge / Cloudflare Workers / Next.js / modern serverless)
 */
export async function GET() {
  const data = await handleHealthCheck();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}
