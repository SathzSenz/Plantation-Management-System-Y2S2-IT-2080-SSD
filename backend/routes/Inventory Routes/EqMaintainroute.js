import express from 'express';
import { InventoryRecord } from "../../models/Inventory Models/EqMaintainModel.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";

const router = express.Router();

// Save a new inventory record
router.post('/', asyncHandler(async (request, response) => {
        const {
            Eq_machine_main,
            Eq_id_main,
            date_referred,
            date_received,
            price,
            pay_person,
            ref_loc,
            status,
            comment
        } = request.body;

        // Check if all required fields are present - validation
        if (!Eq_machine_main || !Eq_id_main || !date_referred || !date_received || !price || !pay_person || !ref_loc || !status || !comment) {
            throw createValidationError('All required data must be provided');
        }

        // Create a new inventory record
        const newInventoryRecord = await InventoryRecord.create({
            Eq_machine_main,
            Eq_id_main,
            date_referred,
            date_received,
            price,
            pay_person,
            ref_loc,
            status,
            comment
        });
        return response.success(newInventoryRecord, 201);
}));

// Get all inventory records
router.get('/', asyncHandler(async (request, response) => {
        const inventoryrecords = await InventoryRecord.find({});
        return response.success({ count: inventoryrecords.length, data: inventoryrecords });
}));

// Get inventory record by ID
router.get('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        // Ensure id is not undefined
        if (!id) {
            throw createValidationError('ID parameter is required');
        }

        const inventoryrecord = await InventoryRecord.findById(id);
        if (!inventoryrecord) {
            throw createNotFoundError('Inventory record');
        }
        return response.success(inventoryrecord);
}));

// Update inventory record
router.put('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;
        const {
            Eq_machine_main,
            Eq_id_main,
            date_referred,
            date_received,
            price,
            pay_person,
            ref_loc,
            status,
            comment
        } = request.body;

        // Check if all required fields are present
        if (!Eq_machine_main || !Eq_id_main || !date_referred || !date_received || !price || !pay_person || !ref_loc || !status || !comment) {
            throw createValidationError('All required data must be provided');
        }

        // Find and update the inventory record
        const updatedRecord = await InventoryRecord.findByIdAndUpdate(id, request.body, { new: true });

        if (!updatedRecord) {
            throw createNotFoundError('Inventory record');
        }
        return response.success(updatedRecord);
}));

// Delete inventory record
router.delete('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;
        // Find and delete the inventory record
        const result = await InventoryRecord.findByIdAndDelete(id);
        if (!result) {
            throw createNotFoundError('Inventory record');
        }
        return response.success({ message: 'Inventory record deleted successfully' });
}));

export default router;
