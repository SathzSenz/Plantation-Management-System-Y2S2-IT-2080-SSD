import {TransactionsRecord} from "../../models/Finance Models/TransactionsModel.js";
import express from "express";
import mongoose from 'mongoose';
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";
import { protect, authorize, authorizeResource, filterUserResources } from "../../middleware/auth.js";


const router = express.Router();

// create a new record
router.post('/',protect, authorize('user'), asyncHandler(async (request, response) => {
        if (
            !request.body.date ||
            !request.body.type ||
            !request.body.subtype ||
            !request.body.amount ||
            !request.body.description ||
            !request.body.payer_payee ||
            !request.body.method
        ) {
            throw createValidationError('Send all required fields: date, type, subtype, amount, description, payer_payee, method');
        }

        const NewTransactionsRecord = {
            date: request.body.date,
            type: request.body.type,
            subtype: request.body.subtype,
            amount: request.body.amount,
            description: request.body.description,
            payer_payee: request.body.payer_payee,
            method: request.body.method,
            userId: request.user._id,
        };

        const TransactionRecord = await TransactionsRecord.create(NewTransactionsRecord);
        return response.success(TransactionRecord, 201);
}));

// Route for Get All from database

router.get('/',protect, authorize('user'), filterUserResources(TransactionsRecord, { userField: 'userId' }), asyncHandler(async (request, response) => {
        const TransactionRecord = await TransactionsRecord.find({ userId: request.user._id });
        return response.success({ count: TransactionRecord.length, data: TransactionRecord });
}));

// Route for Get One transaction from database by id
router.get('/:id',protect, authorize('user'), authorizeResource(TransactionsRecord), asyncHandler(async (request, response) => {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        const TransactionRecord = await TransactionsRecord.findById(id);
        if (!TransactionRecord) throw createNotFoundError('Transaction record');
        return response.success(TransactionRecord);
}));

// Route for Update a transaction
router.put('/:id',protect, authorize('user'), authorizeResource(TransactionsRecord), asyncHandler(async (request, response) => {
        if (
            !request.body.date ||
            !request.body.type ||
            !request.body.subtype ||
            !request.body.amount ||
            !request.body.description ||
            !request.body.payer_payee ||
            !request.body.method
        ) {
            throw createValidationError('Send all required fields: date, type, subtype, amount, description, payer_payee, method');
        }

        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        // Extract only allowed fields from request body
        const { date, type, subtype, amount, description, payer_payee, method } = request.body;

        // Create update object with only allowed fields
        const updateData = { date, type, subtype, amount, description, payer_payee, method };

        const result = await TransactionsRecord.findByIdAndUpdate(id, updateData, { new: true });

        if (!result) {
            throw createNotFoundError('Transaction record');
        }
        return response.success({ message: 'Transaction record updated successfully', data: result });
}));

// Route for Delete a book
router.delete('/:id',protect, authorize('user'), authorizeResource(TransactionsRecord), asyncHandler(async (request, response) => {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        const result = await TransactionsRecord.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Transaction record');
        }
        return response.success({ message: 'Transaction record deleted successfully' });
}));

export default router;