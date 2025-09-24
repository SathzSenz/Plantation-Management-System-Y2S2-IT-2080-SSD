import axios from 'axios';

// Axios instance with credentials for CSRF-protected API
export const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://elemahana-backend.vercel.app',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Set defaults for modules that import axios directly
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://elemahana-backend.vercel.app';
axios.defaults.withCredentials = true;

function normalizeRequestUrl(url) {
    if (!url) return url;
    const base = process.env.REACT_APP_API_BASE_URL || '';
    const literal = '${process.env.REACT_APP_API_BASE_URL}';
    if (typeof url === 'string' && url.includes(literal)) {
        return url.replace(literal, base);
    }
    return url;
}
// CSRF token cache
let csrfToken = null; // refreshed via /csrf-token

// Fetch and cache CSRF token; also sets secret cookie from server
async function ensureCsrfToken() {
    if (csrfToken) return csrfToken;
    try {
        const res = await fetch((process.env.REACT_APP_API_BASE_URL || '') + '/csrf-token', {
            method: 'GET',
            credentials: 'include',
        });
        const json = await res.json().catch(() => ({}));
        csrfToken = json?.data?.csrfToken || null;
        return csrfToken;
    } catch (e) {
        return null;
    }
}

// Attach CSRF token for unsafe methods
api.interceptors.request.use(async (config) => {
    // Fix literal, un-evaluated env placeholders if present
    config.url = normalizeRequestUrl(config.url);
    const method = (config.method || 'get').toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        const token = await ensureCsrfToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers['X-CSRF-Token'] = token;
        }
    }
    config.withCredentials = true;
    return config;
});

// Apply same URL normalization to the global axios instance
axios.interceptors.request.use((config) => {
    config.url = normalizeRequestUrl(config.url);
    return config;
});

function normalizeSuccessResponse(response) {
    const payload = response?.data;
    if (payload && payload.success === true && Object.prototype.hasOwnProperty.call(payload, 'data')) {
        // unwrap to maintain backward compatibility: response.data becomes server data
        return { ...response, data: payload.data };
    }
    return response;
}

function normalizeError(error) {
    const status = error.response?.status || 0;
    const serverMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    const normalizedError = {
        status,
        message: serverMessage || 'Request failed',
        requestId: error.response?.headers?.['x-request-id'],
        data: error.response?.data,
    };
    return Promise.reject(normalizedError);
}

// If we get a CSRF failure, refresh token and retry once
async function handleCsrfAndRetry(error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.error?.message || error?.response?.data?.message || '';
    const config = error?.config || {};
    const shouldRetry = status === 403 && /invalid csrf token/i.test(message) && !config._retriedCsrf;
    if (!shouldRetry) return Promise.reject(error);
    try {
        csrfToken = null; // force refresh
        const token = await ensureCsrfToken();
        config._retriedCsrf = true;
        config.headers = config.headers || {};
        if (token) config.headers['X-CSRF-Token'] = token;
        config.withCredentials = true;
        return api(config);
    } catch (e) {
        return Promise.reject(error);
    }
}

api.interceptors.response.use(
    normalizeSuccessResponse,
    async (error) => handleCsrfAndRetry(error).catch(normalizeError)
);

// Also attach to default axios so existing imports benefit
axios.interceptors.response.use(
    normalizeSuccessResponse,
    async (error) => handleCsrfAndRetry(error).catch(normalizeError)
);

export async function safeFetch(input, init = {}) {
    try {
        const method = (init?.method || 'GET').toUpperCase();
        let headers = init?.headers || {};
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const token = await ensureCsrfToken();
            if (token) headers = { ...headers, 'X-CSRF-Token': token };
        }
        const response = await fetch(input, { ...init, headers, credentials: 'include' });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const message = data?.error?.message || data?.message || 'Request failed';
            const error = new Error(message);
            error.status = response.status;
            error.data = data;
            error.requestId = response.headers.get('x-request-id') || undefined;
            throw error;
        }
        return response;
    } catch (err) {
        throw err;
    }
}


