let userConfig = undefined;

try {
  // Try to import ESM first
  userConfig = await import("./v0-user-next.config.mjs");
} catch (e) {
  try {
    // Fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // Ignore error
  }
}

/** @type {import('next').NextConfig} */
const baseConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // ✅ Must be at top-level
  allowedDevOrigins: ["http://10.0.38.43"], // Allow WebSocket and HTTP origins
};

// Initialize nextConfig by copying baseConfig
const nextConfig = { ...baseConfig };

// Merge with userConfig if it exists
if (userConfig) {
  const config = userConfig.default || userConfig;

  // Deep merge objects to handle nested config objects
  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      if (
        typeof config[key] === "object" &&
        !Array.isArray(config[key]) &&
        config[key] !== null
      ) {
        nextConfig[key] = {
          ...baseConfig[key],
          ...config[key],
        };
      } else {
        nextConfig[key] = config[key];
      }
    }
  }
}

export default nextConfig;
