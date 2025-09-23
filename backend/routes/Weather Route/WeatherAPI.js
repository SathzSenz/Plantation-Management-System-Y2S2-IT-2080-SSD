// Import necessary libraries
import express from 'express';
import axios from 'axios';
import { asyncHandler } from '../../middleware/errorMiddleware.js';
import { createValidationError } from '../../utils/errors.js';

const router = express.Router();

// Your Tomorrow.io API key - ensure this is kept secure and not exposed to the client
const apiKey = process.env.OPENWEATHER_API_KEY;

router.get('/', asyncHandler(async (req, res) => {
    const lat = '7.851732';
    const lon = '80.098774'; // Assuming latitude and longitude are provided by the client
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    res.success(response.data);
}));

export default router;
