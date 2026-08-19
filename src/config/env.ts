/**
 * Environment configuration for XYZ AI Frontend.
 * 
 * VITE_API_BASE_URL can be provided via .env / environment variables.
 * A developer or evaluator can also set or override the backend URL at runtime
 * in the Integration & Diagnostics settings panel without rebuilding.
 */

const getInitialBaseUrl = (): string => {
  // Check build-time environment variable first (production authoritative)
  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const buildTimeUrl = (metaEnv?.VITE_API_BASE_URL || '').trim();
  
  // If build-time URL is configured, use it (production deployment)
  if (buildTimeUrl) {
    return buildTimeUrl;
  }
  
  // Only use localStorage override for development when no build-time URL is set
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('xyz_api_base_url');
    if (saved) return saved.trim();
  }
  
  // Production fallback to public backend
  return 'https://xyz-ai-backend-gu7m.onrender.com';
};

export const API_CONFIG = {
  get baseUrl(): string {
    return getInitialBaseUrl();
  },
  setBaseUrl(url: string) {
    if (typeof window !== 'undefined') {
      if (url.trim()) {
        localStorage.setItem('xyz_api_base_url', url.trim());
      } else {
        localStorage.removeItem('xyz_api_base_url');
      }
    }
  },
  requestTimeoutMs: 15000,
  isConfigured(): boolean {
    return Boolean(this.baseUrl);
  }
};
