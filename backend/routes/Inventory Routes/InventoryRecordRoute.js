import express from 'express';
import mongoose from "mongoose";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";
import {InventoryInput} from "../../models/Inventory Models/InventoryRecordModel.js";
import { protect, authorize, authorizeResource, filterUserResources } from "../../middleware/auth.js";

const router = express.Router();

// Save a new inventory record
router.post('/',protect, authorize('user'), asyncHandler(async (request, response) => {
        const {
            type,
            record_ID,
            record_name,
            storage,
            size,
            unit,
            quantity,
            unit_price,
            payer,
            expire_date,
            description,
            ava_status
        } = request.body;

        // Check if all required fields are present
        if (!type || !record_ID || !record_name || !storage || !quantity || !unit_price || !payer || !description || !ava_status) {
            throw createValidationError('All required data must be provided');
        }

        // If type is Agrochemical or Fertilizer, require unit and size
        if ((type === 'Agrochemical' || type === 'Fertilizer') && (!unit || !size)) {
            throw createValidationError('Unit and size are required for agrochemical and fertilizer records');
        }

        // If type is Agrochemical, require expire_date
        if (type === 'Agrochemical' && !expire_date) {
            throw createValidationError('Expire date is required for agrochemical records');
        }

        // Create a new inventory record
        const newInventoryInput = await InventoryInput.create({
            type,
            record_ID,
            record_name,
            storage,
            size,
            unit,
            quantity,
            unit_price,
            payer,
            expire_date,
            description,
            ava_status,
            userId: request.user._id
        });

        return response.success(newInventoryInput, 201);
}));


// Get all inventory records
router.get('/',protect, authorize('user'), filterUserResources(InventoryInput, { userField: 'userId' }), asyncHandler(async (request, response) => {
        const inventoryinputs = await InventoryInput.find({ userId: request.user._id });
        return response.success({ count: inventoryinputs.length, data: inventoryinputs });
}));

// Get inventory record by ID
router.get('/:id',protect, authorize('user'), authorizeResource(InventoryInput), asyncHandler(async (request, response) => {
        const { id } = request.params;

        // Ensure id is not undefined
        if (!id) {
            throw createValidationError('ID parameter is required');
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        const inventoryinput = await InventoryInput.findById(id);
        if (!inventoryinput) {
            throw createNotFoundError('Inventory record');
        }
        return response.success(inventoryinput);
}));

// Update inventory record
router.put('/:id',protect, authorize('user'), authorizeResource(InventoryInput), asyncHandler(async (request, response) => {
        const { id } = request.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }
        const {
            type,
            record_ID,
            record_name,
            storage,
            size,
            unit,
            quantity,
            unit_price,
            payer,
            expire_date,
            description,
            ava_status
        } = request.body;

        // Check if all required fields are present
        if (!type || !record_ID || !record_name || !storage || !quantity || !unit_price || !payer || !description || !ava_status) {
            throw createValidationError('All required data must be provided');
        }

        // If type is Agrochemical or Fertilizer, require unit and size
        if ((type === 'Agrochemical' || type === 'Fertilizer') && (!unit || !size)) {
            throw createValidationError('Unit and size are required for agrochemical and fertilizer records');
        }

        // If type is Agrochemical, require expire_date
        if (type === 'Agrochemical' && !expire_date) {
            throw createValidationError('Expire date is required for agrochemical records');
        }

        // Find the inventory record by ID
        let inventoryInput = await InventoryInput.findById(id);

        // Check if the inventory record exists
        if (!inventoryInput) {
            throw createNotFoundError('Inventory record');
        }

        // Update the inventory record fields
        inventoryInput.type = type;
        inventoryInput.record_ID = record_ID;
        inventoryInput.record_name = record_name;
        inventoryInput.storage = storage;
        inventoryInput.size = size;
        inventoryInput.unit = unit;
        inventoryInput.quantity = quantity;
        inventoryInput.unit_price = unit_price;
        inventoryInput.payer = payer;
        inventoryInput.expire_date = expire_date;
        inventoryInput.description = description;
        inventoryInput.ava_status = ava_status;
        // Save the updated inventory record
        const updatedRecord = await inventoryInput.save();
        return response.success(updatedRecord);
}));


// Delete inventory record
router.delete('/:id',protect, authorize('user'), authorizeResource(InventoryInput), asyncHandler(async (request, response) => {
        const { id } = request.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }
        // Find and delete the inventory record
        const result = await InventoryInput.findByIdAndDelete(id);
        if (!result) {
            throw createNotFoundError('Inventory record');
        }
        return response.success({ message: 'Inventory record deleted successfully' });
}));

export default router;