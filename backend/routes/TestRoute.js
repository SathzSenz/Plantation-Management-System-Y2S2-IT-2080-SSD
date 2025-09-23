import {TestRecord} from "../models/TestModel.js";
import express from "express";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../utils/errors.js";

const router = express.Router();

// create a new record
router.post('/', asyncHandler(async (request, response) => {
        if (
            !request.body.first_name ||
            !request.body.last_name ||
            !request.body.uemail ||
            !request.body.country ||
            !request.body.street_address ||
            !request.body.city ||
            !request.body.region ||
            !request.body.postal_code
        ) {
            throw createValidationError('Send all required fields: first_name, last_name, uemail, country, street_address, city, region, postal_code');
        }

        const NewTestRecord = {
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            uemail: request.body.uemail,
            country: request.body.country,
            street_address: request.body.street_address,
            city: request.body.city,
            region: request.body.region,
            postal_code: request.body.postal_code,
        };

        const testRecord = await TestRecord.create(NewTestRecord);
        return response.success(testRecord, 201);
}));

// Route for Get All from database

router.get('/', asyncHandler(async (request, response) => {
        const testRecords = await TestRecord.find({});
        return response.success({
            count: testRecords.length,
            data: testRecords,
        });
}));

// Route for Get One Book from database by id
router.get('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const testRecord = await TestRecord.findById(id);
        if (!testRecord) throw createNotFoundError('Test record');
        return response.success(testRecord);
}));

// Route for Update a Book
router.put('/:id', asyncHandler(async (request, response) => {
        if (
            !request.body.first_name ||
            !request.body.last_name ||
            !request.body.uemail ||
            !request.body.country ||
            !request.body.street_address ||
            !request.body.city ||
            !request.body.region ||
            !request.body.postal_code
        ) {
            throw createValidationError('Send all required fields');
        }

        const { id } = request.params;

        // Extract only allowed fields from request body
        const { first_name, last_name, uemail, country, street_address, city, region, postal_code } = request.body;

        // Create update object with only allowed fields
        const updateData = { first_name, last_name, uemail, country, street_address, city, region, postal_code };

        const result = await TestRecord.findByIdAndUpdate(id, updateData, { new: true });

        if (!result) {
            throw createNotFoundError('Test record');
        }
        return response.success({ message: 'Record updated successfully', data: result });
}));


// Route for Delete a book
router.delete('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const result = await TestRecord.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Test record');
        }
        return response.success({ message: 'Record deleted successfully' });
}));

export default router;