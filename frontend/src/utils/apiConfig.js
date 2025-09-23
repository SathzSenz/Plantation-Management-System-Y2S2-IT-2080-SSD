// Centralized API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5555';
const PRODUCTION_API_URL = process.env.REACT_APP_PRODUCTION_API_URL || 'https://elemahana-backend.vercel.app';

// Helper function to get the appropriate API URL
export const getApiUrl = (endpoint = '') => {
    const baseUrl = process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : API_BASE_URL;
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Export commonly used API endpoints
export const API_ENDPOINTS = {
    // Employee Management
    EMPLOYEES: '/employees',
    ATTENDANCE: '/attendanceRecords',
    TASKS: '/tasks',
    
    // Finance
    TRANSACTIONS: '/transactions',
    SALARIES: '/salaries',
    VALUATIONS: '/valuations',
    MACHINE_RECORDS: '/machinerecords',
    MACHINE_TASKS: '/machinetasks',
    
    // Crop Management
    CROP_INPUTS: '/cropinput',
    ROTATIONS: '/rotation',
    PLANTING: '/planting',
    CHEMICALS: '/chemical',
    
    // Harvest
    HARVEST_RECORDS: '/record',
    
    // Inventory
    INVENTORY_RECORDS: '/inventoryrecords',
    INVENTORY_INPUTS: '/inventoryinputs',
    EQUIPMENT_MAINTENANCE: '/eqmaintain',
    WATER: '/water',
    
    // Disease Management
    DISEASES: '/diseases',
    DISEASE_COUNT: '/diseasecount',
    TREATMENT_SELECTION: '/treatmentselection',
    
    // Agro Tourism
    BOOKINGS: '/booking',
    FEEDBACK: '/feedback',
    
    // Wholesale
    PRODUCTS: '/products',
    ORDERS: '/orders',
    
    // Market Analysis
    MARKET_PRICES: '/marketprice',
    PREDICT_PRICES: '/predictmarketprice',
    
    // Weather
    WEATHER: '/weather'
};

export default getApiUrl;
