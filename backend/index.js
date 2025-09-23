import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import { TestRecord } from "./models/TestModel.js";
import cors from 'cors';
import testRoute from "./routes/TestRoute.js";

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


const app = express();

app.use(express.json());
 
//app.use(cors());

//const Images = mongoose.model("productModel");


app.use(cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'https://elemahana.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

// response helpers and request id
import { attachResponseHelpers } from './middleware/responseMiddleware.js';
import { requestIdMiddleware, notFoundMiddleware, errorHandler } from './middleware/errorMiddleware.js';
app.use(requestIdMiddleware);
app.use(attachResponseHelpers);

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('welcome to Elemahana');
});



app.use('/financeincome', testRoute);
app.use('/transactions', TransactionsRoute);
app.use('/valuation', ValuationRoute);
app.use('/machines', MachineTaskRoute);
app.use('/machineRecord', MachineRecordRoute);
app.use('/salary', SalaryRoute);
app.use('/weather', WeatherAPI)

app.use('/booking', BookingRoute);
app.use('/confirmation', BookingRoute);
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

mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('App connected to the database');
        app.listen(PORT, () => {
            console.log(`App is listening to port : ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });

// centralized error handler must be the last middleware
app.use(errorHandler);
