const http = require("http");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ---------------------------------------------------------------------------
// Dev API proxy: /__api/* → local backend (wrangler dev on :8787).
//
// The device can always reach Metro (it loads the JS bundle from it) — over
// USB via Expo's automatic `adb reverse tcp:8081`, over Wi-Fi via the LAN IP,
// or from the emulator via 10.0.2.2. Routing API calls through Metro means
// they work in every one of those setups, with no second port to forward
// (a separate `adb reverse tcp:8787` silently disappears whenever the phone
// reconnects). src/lib/api-client.ts switches to this in __DEV__.
// ---------------------------------------------------------------------------

const API_PROXY_PREFIX = "/__api";
const API_PROXY_TARGET = new URL(process.env.DEV_API_PROXY_TARGET || "http://127.0.0.1:8787");

function proxyToApi(req, res) {
  const upstream = http.request(
    {
      hostname: API_PROXY_TARGET.hostname,
      port: API_PROXY_TARGET.port || 80,
      path: req.url.slice(API_PROXY_PREFIX.length) || "/",
      method: req.method,
      headers: { ...req.headers, host: API_PROXY_TARGET.host },
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );

  upstream.on("error", (error) => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: `Backend not reachable at ${API_PROXY_TARGET.origin} — is \`npm run dev\` running in fitpilot-backend? (${error.code || error.message})`,
      }),
    );
  });

  req.pipe(upstream);
}

const nativeWindConfig = withNativeWind(config, { input: "./src/global.css" });
const enhanceMiddleware = nativeWindConfig.server?.enhanceMiddleware;

nativeWindConfig.server = {
  ...nativeWindConfig.server,
  enhanceMiddleware: (middleware, server) => {
    const next = enhanceMiddleware ? enhanceMiddleware(middleware, server) : middleware;
    return (req, res, fallthrough) => {
      if (req.url && (req.url === API_PROXY_PREFIX || req.url.startsWith(`${API_PROXY_PREFIX}/`))) {
        proxyToApi(req, res);
        return;
      }
      return next(req, res, fallthrough);
    };
  },
};

module.exports = nativeWindConfig;
