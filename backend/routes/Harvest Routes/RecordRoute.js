import {HarvestingRecord} from "../../models/Harvest Models/RecordModels.js";
import express from "express";
import mongoose from 'mongoose';
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";
import { protect, authorize } from "../../middleware/auth.js";

const router = express.Router();


//Route to create new harvest record
router.post('/', protect, authorize('user'),asyncHandler(async(request, response) =>
{
        if(
            !request.body.date ||
            !request.body.cropType ||
            !request.body.ageOfYield ||
            !request.body.wayPicked ||
            !request.body.treesPicked ||
            !request.body.quantity ||
            !request.body.remarks
            ){
            throw createValidationError('Send all required fields');
         }

        const NewHarvestRecord = {
            date: request.body.date,
            cropType: request.body.cropType,
            ageOfYield: request.body.ageOfYield,
            wayPicked: request.body.wayPicked,
            treesPicked: request.body.treesPicked,
            quantity: request.body.quantity,
            remarks: request.body.remarks,
        };

        const HarvestRecord = await HarvestingRecord.create(NewHarvestRecord);
        return response.success(HarvestRecord, 201);
}));

//Route to get harvest records
router.get('/', protect, authorize('user'),asyncHandler(async (request, response) => {
        const Records = await HarvestingRecord.find({});
        return response.success({ count: Records.length, data: Records });
}));

//Route to get a harvest record by ID
router.get('/:id',protect, authorize('user'), asyncHandler(async (request, response) => {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        const record = await HarvestingRecord.findById(id);

        if (!record) {
            throw createNotFoundError('Harvest record');
        }
        return response.success(record);
}));



//Route to update harvest record
router.put('/:id',protect, authorize('user'), asyncHandler(async (request, response) => {
        if(
            !request.body.date ||
            !request.body.cropType ||
            !request.body.ageOfYield ||
            !request.body.wayPicked ||
            !request.body.treesPicked ||
            !request.body.quantity ||
            !request.body.remarks
        ){
            throw createValidationError('Send all required fields');
        }

        const { id } = request.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        // Extract only allowed fields from request body
        const { date, cropType, ageOfYield, wayPicked, treesPicked, quantity, remarks } = request.body;

        // Create update object with only allowed fields
        const updateData = { date, cropType, ageOfYield, wayPicked, treesPicked, quantity, remarks };

        const result = await HarvestingRecord.findByIdAndUpdate(id, updateData, { new: true });

        if (!result) {
            throw createNotFoundError('Harvest record');
        }
        return response.success({ message: 'Harvest record updated successfully', data: result });
}));

// Route for Delete a harvest record
router.delete('/:id',protect, authorize('user'), asyncHandler(async (request, response) => {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        const result = await HarvestingRecord.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Harvest record');
        }
        return response.success({ message: 'Harvest record deleted successfully' });
}));


export default router;