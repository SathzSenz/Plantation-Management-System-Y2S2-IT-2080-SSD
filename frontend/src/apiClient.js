import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://elemahana-backend.vercel.app',
    headers: {
        'Content-Type': 'application/json',
    },
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

api.interceptors.response.use(
    normalizeSuccessResponse,
    normalizeError
);

// Also attach to default axios so existing imports benefit
axios.interceptors.response.use(normalizeSuccessResponse, normalizeError);

export async function safeFetch(input, init = {}) {
    try {
        const response = await fetch(input, init);
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


