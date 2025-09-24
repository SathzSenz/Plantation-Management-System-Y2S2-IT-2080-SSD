import express, {request} from "express";
import {MarketPriceRecord} from "../../models/FarmAnalysis Models/MarketPriceModel.js";
import {linearRegression, linearRegressionLine, } from "simple-statistics";
import regression from "regression";
import * as tf from '@tensorflow/tfjs';
import {predictFuturePricesTF1} from "./predictionUtil.js";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createValidationError, createNotFoundError } from "../../utils/errors.js";
import { protect, authorize } from "../../middleware/auth.js";


const router = express.Router();

router.get('/',protect, authorize('user'), asyncHandler(async (req, res) => {

        const {name} = req.query;  //retrieves name as parameter

        if(!name) {
            throw createValidationError('Fruit type is required');
        }

        //retrieves records from parameter passed and sorts date in ascending order
        const historicalData = await MarketPriceRecord.find({name : name}).sort({date: 1});

        //if no records available
        if (historicalData.length === 0) {
            throw createNotFoundError('No historical data found for the specified fruit');
        }

        const dates = historicalData.map(record => new Date(record.date)); //map dates
        const maxPrices = historicalData.map(record => record.max_price);  //map max prices
        const minPrices = historicalData.map(record => record.min_price);   //map min prices

        const futureMaxPrices = predictFuturePrices(dates, maxPrices);   //call predict function
        const futureMinPrices = predictFuturePrices(dates, minPrices);

        //call tensorflow predict function
        const futureTensorFlowModel = await predictFuturePricesTF1(dates, minPrices, maxPrices);

        res.success({futureMaxPrices, futureMinPrices, futureTensorFlowModel}); //send generted prices
}));

//function to convert date format
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

//Linear Regression method
function predictFuturePrices(dates, prices) {
    try {

        const timestamps = dates.map(date => date.getTime());

        const {m, b} = linearRegression(timestamps.map((t, i) => [t, prices[i]]));

        const futurePrices = [];
        const lastDate = dates[dates.length - 1];

        for (let i = 1; i <= 365; i++) {
            const futureDate = new Date(lastDate);
            futureDate.setDate(futureDate.getDate() + i);

            const futureTimestamp = futureDate.getTime();
            const predictedPrice = m * futureTimestamp + b;
            const roundedPredictedPrice = parseFloat(predictedPrice.toFixed(4));
            futurePrices.push({date: formatDate(futureDate), price: roundedPredictedPrice});

            console.log(`Predicted price for ${formatDate(futureDate)} : ${roundedPredictedPrice}`);
        }
        return futurePrices;
    } catch (error) {
        console.error('Error calculating regression line : ', error);
        return [];
    }
}

//more dynamic method
async function predictFuturePricesTF(dates, minPrices, maxPrices) {
    try {
        const normalizeData = (data) => {
            const min = tf.min(data);  //calculate min value in data
            const max = tf.max(data);  //calculate max value in data
            //returning an object containing min, max and normalized data
            return {
                data: data.sub(min).div(max.sub(min)),   // Formula: (data - min) / (max - min)
                min: min,
                max: max
            };
        };

        //converts each date to a numerical representation of time
        const normalizeDates = normalizeData(tf.tensor1d(dates.map(date => date.getTime())));
        const normalizeMinPrices = normalizeData(tf.tensor1d(minPrices)); //normalize arrays of min prices
        const normalizeMaxPrices = normalizeData(tf.tensor1d(maxPrices)); //normalize arrays of max prices

        const model = tf.sequential();  //creating sequential model(contains linear stack of layers)
        //1-dimensional tensor is added and input shape specifies shape of input
        model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [1] }));
        model.add(tf.layers.dense({ units: 32, activation: 'relu' }));  //add another dense layer
        model.add(tf.layers.dense({ units: 2 }));   //add output layer
        // Compiles the model with the Adam optimizer and mean squared error loss function.
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });  //configures model for training

        // Normalizing the input dates and reshape it into a 2D tensor with one column.
        const xs = normalizeDates.data.reshape([-1, 1]);
        // Concatenate the normalized minimum and maximum prices data into a single tensor.
        // The resulting tensor will have two columns: one for normalized minimum prices and one for normalized maximum prices.
        const ys = tf.concat([normalizeMinPrices.data.reshape([-1, 1]), normalizeMaxPrices.data.reshape([-1, 1])], 1);
        // Train the model using the input (xs) and target (ys) data for a specified number of epochs
        await model.fit(xs, ys, { epochs: 1000 }); //epochs(no of times data is passed back and forth through the neural network).

        //calculate start date for future prices(day after last historical date)
        const startDate = new Date(dates[dates.length - 1].getTime() + 24 * 60 * 60 * 1000); // Start from the day after the last historical date
        const numDays = 365;  //no of days to be predicted
        //generates an array of future dates
        const futureDates = Array.from({ length: numDays }, (_, i) => new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000));
        //converting future dates into a tensor and normalizing them
        const normalizedFutureDates = normalizeData(tf.tensor1d(futureDates.map(date => date.getTime())));
        //use trained model to predict future prices based on normalized future dates
        const futurePredictions = model.predict(normalizedFutureDates.data.reshape([-1, 1]));

        // Extract the predicted min & max prices from the future predictions tensor and denormalize them(into a js array)
        const minPricePredictions = futurePredictions.slice([0, 0], [numDays, 1]).mul(normalizeMinPrices.max.sub(normalizeMinPrices.min)).add(normalizeMinPrices.min).arraySync();
        const maxPricePredictions = futurePredictions.slice([0, 1], [numDays, 1]).mul(normalizeMaxPrices.max.sub(normalizeMaxPrices.min)).add(normalizeMaxPrices.min).arraySync();

        //combining future dats, min and max prices to a single array
        const futurePricePredictions = futureDates.map((date, i) => ({
            date: formatDate(date),  //format date
            minPrice: parseFloat(minPricePredictions[i][0].toFixed(4)), // Limiting to 4 decimal points
            maxPrice: parseFloat(maxPricePredictions[i][0].toFixed(4))
        }));

        console.log('TensorFlow model predictions:', futurePricePredictions);

        return futurePricePredictions;
    } catch (error) {
        console.error('Error predicting future prices using TensorFlow:', error);
        return [];
    }
}

export default router;