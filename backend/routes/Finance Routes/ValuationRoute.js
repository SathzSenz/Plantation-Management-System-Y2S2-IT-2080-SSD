import {ValuationsRecord} from "../../models/Finance Models/ValuationModel.js";
import express from "express";
import mongoose from 'mongoose';
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";
import { protect, authorize } from "../../middleware/auth.js";


const router = express.Router();

// create a new record
router.post('/',protect, authorize('user'), asyncHandler(async (request, response) => {
        if (
            !request.body.date ||
            !request.body.type ||
            !request.body.subtype ||
            !request.body.quantity ||
            !request.body.price ||
            !request.body.description ||
            !request.body.payer_payee ||
            !request.body.appreciationOrDepreciation
        ) {
            throw createValidationError('Send all required fields');
        }

        const NewValuationsRecord = {
            date: request.body.date,
            type: request.body.type,
            subtype: request.body.subtype,
            quantity: request.body.quantity,
            price: request.body.price,
            description: request.body.description,
            payer_payee: request.body.payer_payee,
            appreciationOrDepreciation: request.body.appreciationOrDepreciation,
        };

        const ValuationRecord = await ValuationsRecord.create(NewValuationsRecord);
        return response.success(ValuationRecord, 201);
}));

// Route for Get All from database

router.get('/',protect, authorize('user'), asyncHandler(async (request, response) => {
        const ValuationRecord = await ValuationsRecord.find({});
        return response.success({ count: ValuationRecord.length, data: ValuationRecord });
}));

// Route for Get One transaction from database by id
router.get('/:id',protect, authorize('user'), asyncHandler(async (request, response) => {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        const ValuationRecord = await ValuationsRecord.findById(id);
        if (!ValuationRecord) throw createNotFoundError('Valuation record');
        return response.success(ValuationRecord);
}));

// Route for Update a transaction
router.put('/:id',protect, authorize('user'), asyncHandler(async (request, response) => {
        if (
            !request.body.date ||
            !request.body.type ||
            !request.body.subtype ||
            !request.body.quantity ||
            !request.body.price ||
            !request.body.description ||
            !request.body.payer_payee ||
            !request.body.appreciationOrDepreciation
        ) {
            throw createValidationError('Send all required fields');
        }

        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        // Extract only allowed fields from request body
        const { date, type, subtype, quantity, price, description, payer_payee, appreciationOrDepreciation } = request.body;

        // Create update object with only allowed fields
        const updateData = { date, type, subtype, quantity, price, description, payer_payee, appreciationOrDepreciation };

        const result = await ValuationsRecord.findByIdAndUpdate(id, updateData, { new: true });

        if (!result) {
            throw createNotFoundError('Valuation record');
        }
        return response.success({ message: 'Valuation record updated successfully', data: result });
}));

// Route for Delete a book
router.delete('/:id',protect, authorize('user'), asyncHandler(async (request, response) => {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        const result = await ValuationsRecord.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Valuation record');
        }
        return response.success({ message: 'Valuation record deleted successfully' });
}));

export default router;