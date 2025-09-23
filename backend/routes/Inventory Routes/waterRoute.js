import express from 'express';
import { WaterRecord } from "../../models/Inventory Models/waterModel.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";

const router = express.Router();

// Save a new water record
router.post('/', asyncHandler(async (request, response) => {
        const {
            water_level1,
            water_level2,
            water_date,
            water_des
        } = request.body;

        // Check if all required fields are present - validation
        if (!water_level1 || !water_level2 || !water_date || !water_des) {
            throw createValidationError('All required data must be provided');
        }
        const newWaterRecord = await WaterRecord.create({
            water_level1,
            water_level2,
            water_date,
            water_des
        });
        return response.success(newWaterRecord, 201);
}));

// Get all water records
router.get('/', asyncHandler(async (request, response) => {
        const waterRecords = await WaterRecord.find({});
        return response.success({ count: waterRecords.length, data: waterRecords });
}));

// Get water record by ID
router.get('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;
        if (!id) {
            throw createValidationError('ID parameter is required');
        }
        const waterRecord = await WaterRecord.findById(id);
        if (!waterRecord) {
            throw createNotFoundError('Water record');
        }
        return response.success(waterRecord);
}));

// Update water record
router.put('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;
        const {
            water_level1,
            water_level2,
            water_date,
            water_des
        } = request.body;
        if (!water_level1 || !water_level2 || !water_date || !water_des) {
            throw createValidationError('All required data must be provided');
        }

        // Create update object with only allowed fields
        const updateData = { water_level1, water_level2, water_date, water_des };

        // Find and update the water record
        const updatedRecord = await WaterRecord.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedRecord) {
            throw createNotFoundError('Water record');
        }
        return response.success(updatedRecord);
}));

// Delete water record
router.delete('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;
        const result = await WaterRecord.findByIdAndDelete(id);
        if (!result) {
            throw createNotFoundError('Water record');
        }
        return response.success({ message: 'Water record deleted successfully' });
}));

export default router;
