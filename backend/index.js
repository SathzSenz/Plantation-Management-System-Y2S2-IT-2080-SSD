import express from "express";
import helmet from "helmet";
import passport from "passport";
import dotenv from "dotenv";
import sesssion from "express-session";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import { TestRecord } from "./models/TestModel.js";
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import testRoute from "./routes/TestRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import setupGooglePassport from "./auth/passportGoogle.js";
import { protect } from "./middleware/auth.js";

import BookingRoute from "./routes/AgroTourism Routes/BookingRoute.js";
import FeedbackRoute from "./routes/AgroTourism Routes/FeedbackRoute.js";

import TransactionsRoute from "./routes/Finance Routes/TransactionsRoute.js";
import ValuationRoute from "./routes/Finance Routes/ValuationRoute.js";
import MachineTaskRoute from "./routes/Finance Routes/MachineTaskRoute.js";
import SalaryRoute from "./routes/Finance Routes/SalaryRoute.js";
import WeatherAPI from "./routes/Weather Route/WeatherAPI.js";

import DiseaseRoute from "./routes/Disease Tracking Routes/DiseaseRoute.js";

import RotationRoute from "./routes/Crop Routes/RotationRoute.js"
import CropInputRoute from "./routes/Crop Routes/CropInputRoute.js"

import EqMaintainroute from "./routes/Inventory Routes/EqMaintainroute.js";
import WaterRoute from "./routes/Inventory Routes/waterRoute.js";
import InventoryRecordRoute from "./routes/Inventory Routes/InventoryRecordRoute.js";

import RegistrationRoute from "./routes/Employee Routes/RegistrationRoute.js";
import TaskRoute from "./routes/Employee Routes/TaskRoute.js";

import ProductRoute from "./routes/Wholesale  Routes/ProductRoute.js";
import OrderRoute from "./routes/Wholesale  Routes/OrderRoute.js";

import recordRoute from "./routes/Harvest Routes/RecordRoute.js";
import AttendanceRoute from "./routes/Employee Routes/AttendanceRoute.js";

import MarketPriceRoute from "./routes/FarmAnalysis Routes/MarketPriceRoute.js";
import DiseaseCountRoute from "./routes/Disease Tracking Routes/DiseaseCountRoute.js";
import TreatmentSelectionRoute from "./routes/Disease Tracking Routes/TreatmentSelectionRoute.js";
import PredictMarketPriceRoute from "./routes/FarmAnalysis Routes/PredictMarketPriceRoute.js";
import MachineRecordRoute from "./routes/Finance Routes/MachineRecordRoute.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(helmet());
app.use(helmet.noSniff());

setupGooglePassport();
app.use(passport.initialize());




//app.use(cors());

//const Images = mongoose.model("productModel");

const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,  // 15 minutes
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });

    const bookingLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 10,
      message: { error: 'Too many booking requests, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use(globalLimiter);

app.use(cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'https://elemahana.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    credentials: true,
}));

// response helpers and request id
import { attachResponseHelpers } from './middleware/responseMiddleware.js';
import { requestIdMiddleware, notFoundMiddleware, errorHandler } from './middleware/errorMiddleware.js';
app.use(requestIdMiddleware);
app.use(attachResponseHelpers);

// CSRF protection (cookie-based secret)
const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
});

// Mount CSRF after CORS/cookies but before routes
app.use(csrfProtection);

// CSRF token endpoint for SPA to fetch token
app.get('/csrf-token', (req, res) => {
    // Optionally also mirror token in a readable cookie for non-AJAX forms
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return res.status(200).json({ success: true, data: { csrfToken: req.csrfToken() }, requestId: req.requestId });
});

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('welcome to Elemahana');
});

app.use('/auth', AuthRoute);

app.use('/financeincome', testRoute);
app.use('/transactions', TransactionsRoute);
app.use('/valuation', ValuationRoute);
app.use('/machines', MachineTaskRoute);
app.use('/machineRecord', MachineRecordRoute);
app.use('/salary', SalaryRoute);
app.use('/weather', WeatherAPI)

app.use(['/booking', '/confirmation'], bookingLimiter, BookingRoute);

app.use('/feedbacklist',FeedbackRoute);
app.use('/feedback',FeedbackRoute);

app.use('/diseases', DiseaseRoute);
app.use('/marketprice', MarketPriceRoute);
app.use('/generate_market_prices', PredictMarketPriceRoute);

app.use('/rotation', RotationRoute);

app.use('/cropinput', CropInputRoute);

app.use('/inventoryrecords', EqMaintainroute);
app.use('/waterRecords', WaterRoute);
app.use('/inventoryinputs', InventoryRecordRoute);

app.use('/employeeRecords',RegistrationRoute);
app.use('/taskRecords',TaskRoute);
app.use('/attendanceRecords',AttendanceRoute);

app.use('/productRecords' ,ProductRoute);
app.use('/orderRecords', OrderRoute);


app.use('/record', recordRoute);

app.use('/checkTreatment',TreatmentSelectionRoute);
app.use('/count', DiseaseCountRoute);

// 404 for unmatched routes
app.use(notFoundMiddleware);

if (process.env.NODE_ENV !== "test") {
    // dev/prod mode → connect DB + start server
    mongoose
        .connect(mongoDBURL)
        .then(() => {
            console.log("App connected to the database");
            app.listen(PORT, () => {
                console.log(`App is listening on port : ${PORT}`);
            });
        })
        .catch((error) => console.error(error));
} else {
    // test mode → connect DB only, no listen()
    mongoose
        .connect(mongoDBURL)
        .then(() => console.log("App connected to the test database"))
        .catch((error) => console.error(error));
}

export default app; // for Supertest


// centralized error handler must be the last middleware
app.use(errorHandler);
