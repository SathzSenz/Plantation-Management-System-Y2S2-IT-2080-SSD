import {MachinesRecord} from "../../models/Finance Models/MachineRecordModel.js";
import express from "express";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";

const router = express.Router();

// create a new record
router.post('/', asyncHandler(async (request, response) => {
        if (
            !request.body.task_id ||
            !request.body.record_date ||
            !request.body.reading_start ||
            !request.body.reading_end ||
            !request.body.record_pay
        ) {
            throw createValidationError('Send all required fields');
        }

        const NewMachinesRecord = {
            task_id: request.body.task_id,
            record_date: request.body.record_date,
            reading_start: request.body.reading_start,
            reading_end: request.body.reading_end,
            record_pay: request.body.record_pay,
        };

        const MachineRecord = await MachinesRecord.create(NewMachinesRecord);
        return response.success(MachineRecord, 201);
}));

// Route for Get All from database

router.get('/', asyncHandler(async (request, response) => {
        const MachineRecord = await MachinesRecord.find({});
        return response.success({ count: MachineRecord.length, data: MachineRecord });
}));

// Route for Get One transaction from database by id
router.get('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const MachineRecord = await MachinesRecord.findById(id);
        if (!MachineRecord) throw createNotFoundError('Machine record');
        return response.success(MachineRecord);
}));

// Route for Update a transaction
router.put('/:id', asyncHandler(async (request, response) => {
        if (
            !request.body.task_id ||
            !request.body.record_date ||
            !request.body.reading_start ||
            !request.body.reading_end ||
            !request.body.record_pay
        ) {
            throw createValidationError('Send all required fields');
        }

        const { id } = request.params;

        const result = await MachinesRecord.findByIdAndUpdate(id, request.body, { new: true });

        if (!result) {
            throw createNotFoundError('Machine record');
        }
        return response.success({ message: 'Machine record updated successfully', data: result });
}));

// Route for Delete a book
router.delete('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const result = await MachinesRecord.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Machine record');
        }
        return response.success({ message: 'Machine record deleted successfully' });
}));

export default router;