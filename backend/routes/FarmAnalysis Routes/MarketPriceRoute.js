import express from "express";
import {MarketPriceRecord} from "../../models/FarmAnalysis Models/MarketPriceModel.js";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";

const router = express.Router();

router.post('/', asyncHandler(async (request, response) => {
        console.log('Request Body:', request.body);

        const {name, date} = request.body;

        const existingRecord = await MarketPriceRecord.findOne({name, date});
        if(existingRecord) {
            throw createValidationError('A Record already exists for this Given Date!');
        }
        if (
            !request.body.name ||
            !request.body.type ||
            !request.body.date ||
            !request.body.min_price||
            !request.body.max_price
        ) {
            throw createValidationError('Send all required fields');
        }
        /*if(request.body.min_price > request.body.max_price)
        {
            return response.status(400).send({
                message: 'Minimum Price cannot be greater than the Maximum Price'
            });
        }*/
        const newMarketPriceRecord = {
            name: request.body.name,
            type: request.body.type,
            date: request.body.date,
            min_price: request.body.min_price,
            max_price: request.body.max_price,

        };

        const marketPrice = await MarketPriceRecord.create(newMarketPriceRecord);
        return response.success(marketPrice, 201);
}));

router.get('/', asyncHandler(async (request, response) => {
        let filter = {};
        // Check if a name filter is provided in the query parameters
        if (request.query.name) {
            // If a name filter is provided, construct the filter object accordingly
            filter.name = request.query.name;
        }

        const marketPrice = await MarketPriceRecord.find({});
        return response.success({ count : marketPrice.length, data : marketPrice });
}));

router.put('/:id', asyncHandler(async (request, response) => {
        if (
            !request.body.name ||
            !request.body.type ||
            !request.body.date ||
            !request.body.min_price||
            !request.body.max_price
        ) {
            throw createValidationError('Send all required fields');
        }

        const {id} = request.params;

        // Extract only allowed fields from request body
        const { name, type, date, min_price, max_price } = request.body;

        // Create update object with only allowed fields
        const updateData = { name, type, date, min_price, max_price };

        const result = await MarketPriceRecord.findByIdAndUpdate(id, updateData, { new: true });

        if(!result){
            throw createNotFoundError('Market Price record');
        }
        return response.success({message : 'Market Price record updated successfully', data: result});
}));

router.delete('/:id', asyncHandler(async (request, response) => {
        const {id} = request.params;

        const result = await MarketPriceRecord.findByIdAndDelete(id);

        if(!result){
            throw createNotFoundError('Market Price record');
        }
        return response.success({message : 'Market Price record deleted successfully'});
}));

export default router;