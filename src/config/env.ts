/**
 * Environment configuration for XYZ AI Frontend.
 * 
 * VITE_API_BASE_URL can be provided via .env / environment variables.
 * A developer or evaluator can also set or override the backend URL at runtime
 * in the Integration & Diagnostics settings panel without rebuilding.
 */

const getInitialBaseUrl = (): string => {
  // Check localStorage runtime override first
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('xyz_api_base_url');
    if (saved) return saved.trim();
  }
  // Fallback to build-time environment variable or default empty
  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return (metaEnv?.VITE_API_BASE_URL || '').trim();
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
