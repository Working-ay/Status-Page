import type { VercelRequest, VercelResponse } from '@vercel/node';

// CRITICAL: Disable strict SSL check to allow monitoring VPS IPs and self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface ServiceResult {
  status: 'online' | 'offline';
  latency: number;
  lastChecked: number;
}

interface ServiceTarget {
    id: string;
    url: string;
}

interface CacheEntry {
  data: ServiceResult;
  expires: number;
}

// IN-MEMORY DATABASE
let statusDatabase: Record<string, CacheEntry> = {};

const CACHE_DURATION_MS = 10 * 1000; 
const TIMEOUT_MS = 5000; // 5 seconds timeout (Lowered to allow function to return before cloud limit)

async function checkService(url: string): Promise<ServiceResult> {
  const start = Date.now();
  
  // 1. Smart Protocol Fixer
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `http://${targetUrl}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    // MIMIC REAL BROWSER to bypass 403 Forbidden / Bot Protection
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    };

    try {
        await fetch(targetUrl, { 
            method: 'GET', 
            signal: controller.signal,
            headers: headers,
            cache: 'no-store'
        });
    } catch (err) {
        // If GET fails, it's effectively offline for user-facing purposes
        throw err;
    }
    
    clearTimeout(timeoutId);
    
    // CALC LATENCY
    const latency = Date.now() - start;

    return {
      status: 'online',
      latency: latency < 1 ? 1 : latency, 
      lastChecked: Date.now()
    };

  } catch (error: any) {
    return {
      status: 'offline',
      latency: 0,
      lastChecked: Date.now()
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Global Error Handler Wrapper
  try {
      res.setHeader('Access-Control-Allow-Credentials', "true");
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      let targets: ServiceTarget[] = [];
      
      // Robust body parsing
      if (req.method === 'POST') {
          try {
              if (typeof req.body === 'string') {
                  const parsed = JSON.parse(req.body);
                  targets = parsed.targets || [];
              } else if (req.body && typeof req.body === 'object') {
                  targets = req.body.targets || [];
              }
          } catch (e) {
              targets = [];
          }
      } else {
        return res.status(200).json({ message: "Status Engine Online. Send POST request with targets." });
      }

      if (!targets.length) {
          return res.status(200).json({});
      }

      const responsePayload: Record<string, ServiceResult> = {};
      const pendingChecks = [];

      for (const target of targets) {
          const now = Date.now();
          const cachedEntry = statusDatabase[target.id];

          // Serve from cache if fresh
          if (cachedEntry && cachedEntry.expires > now) {
              responsePayload[target.id] = cachedEntry.data;
          } else {
              // Queue check
              pendingChecks.push(
                  checkService(target.url).then((result) => {
                      responsePayload[target.id] = result;
                      statusDatabase[target.id] = {
                          data: result,
                          expires: now + CACHE_DURATION_MS
                      };
                  })
              );
          }
      }

      await Promise.all(pendingChecks);

      return res.status(200).json(responsePayload);
  } catch (error) {
      console.error("Backend API Error:", error);
      // Return 200 with empty object rather than 500 to prevent frontend crash if possible, 
      // though frontend handles 500 now.
      return res.status(500).json({ error: "Internal Server Error" });
  }
}