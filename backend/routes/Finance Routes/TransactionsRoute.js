import {TransactionsRecord} from "../../models/Finance Models/TransactionsModel.js";
import express from "express";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";

const router = express.Router();

// create a new record
router.post('/', asyncHandler(async (request, response) => {
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
        };

        const TransactionRecord = await TransactionsRecord.create(NewTransactionsRecord);
        return response.success(TransactionRecord, 201);
}));

// Route for Get All from database

router.get('/', asyncHandler(async (request, response) => {
        const TransactionRecord = await TransactionsRecord.find({});
        return response.success({ count: TransactionRecord.length, data: TransactionRecord });
}));

// Route for Get One transaction from database by id
router.get('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const TransactionRecord = await TransactionsRecord.findById(id);
        if (!TransactionRecord) throw createNotFoundError('Transaction record');
        return response.success(TransactionRecord);
}));

// Route for Update a transaction
router.put('/:id', asyncHandler(async (request, response) => {
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

        const result = await TransactionsRecord.findByIdAndUpdate(id, request.body, { new: true });

        if (!result) {
            throw createNotFoundError('Transaction record');
        }
        return response.success({ message: 'Transaction record updated successfully', data: result });
}));

// Route for Delete a book
router.delete('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const result = await TransactionsRecord.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Transaction record');
        }
        return response.success({ message: 'Transaction record deleted successfully' });
}));

export default router;