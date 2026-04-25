import axios, { AxiosError, type AxiosInstance } from 'axios';

function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configured) {
    return '';
  }

  if (typeof window === 'undefined') {
    return configured;
  }

  const currentHost = window.location.hostname;
  const currentIsLocal = currentHost === 'localhost' || currentHost === '127.0.0.1';

  try {
    const configuredUrl = new URL(configured, window.location.origin);
    const configuredIsLocal =
      configuredUrl.hostname === 'localhost' || configuredUrl.hostname === '127.0.0.1';

    // If the app is opened on a real hostname behind nginx, keep API calls on
    // the same origin so CSRF/session cookies are scoped to the active site.
    if (configuredIsLocal && !currentIsLocal) {
      return '';
    }

    return configuredUrl.origin === window.location.origin ? '' : configuredUrl.origin;
  } catch {
    return configured;
  }
}

export const API_BASE = getApiBase();

const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  withCredentials: true,       // Send Sanctum session cookie
  withXSRFToken: true,         // Auto-attach XSRF-TOKEN header from cookie
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// On 401 — redirect to Entra ID login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect if we're in the browser and not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = `${API_BASE}/api/v1/auth/redirect`;
      }
    }
    return Promise.reject(error);
  },
);

export default api;

/** Fetch the Sanctum CSRF cookie before any state-changing request */
export async function initCsrf(): Promise<void> {
  await axios.get(`${API_BASE}/sanctum/csrf-cookie`, { withCredentials: true });
}
