import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const PORT = process.env.PORT || 5555;
export const mongoDBURL = process.env.MONGODB_URL;
export const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
export const CORS_ORIGINS = process.env.CORS_ORIGINS;
