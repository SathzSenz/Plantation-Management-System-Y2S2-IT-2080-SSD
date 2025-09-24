import express from 'express';
import mongoose from 'mongoose';
import { Rotation } from '../../models/Crop Models/RotationModel.js';
import { asyncHandler } from '../../middleware/errorMiddleware.js';
import { createNotFoundError, createValidationError } from '../../utils/errors.js';
import { protect, authorize } from "../../middleware/auth.js";


const router = express.Router();

//Save new record
router.post('/',protect, authorize('user'), asyncHandler(async(request, response) => {
        if (
            !request.body.season||
            !request.body.fieldName||
            !request.body.cropType||
            !request.body.variety||
            !request.body.quantity||
            !request.body.yield||
            !request.body.remarks
        ) {
            throw createValidationError('Send all required fields');
        }
        const newRecord = {
            season: request.body.season,
            fieldName: request.body.fieldName,
            cropType: request.body.cropType,
            variety: request.body.variety,
            quantity: request.body.quantity,
            yield: request.body.yield,
            remarks: request.body.remarks
        };

        const result = await Rotation.create(newRecord);
        return response.success(result, 201);
}));

//Get all records
router.get('/',protect, authorize('user'), asyncHandler(async(request, response) => {
        const result = await Rotation.find({});
        return response.success({ count: result.length, data: result })
}));

//Get one record by id
router.get('/:id',protect, authorize('user'), asyncHandler(async(request, response) => {
        const {id} = request.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }
        const result = await Rotation.findById(id);
        if (!result) throw createNotFoundError('Rotation record');
        return response.success(result);
}));

//Update record
router.put('/:id',protect, authorize('user'), asyncHandler(async(request, response) => {
        if (
            !request.body.season||
            !request.body.fieldName||
            !request.body.cropType||
            !request.body.variety||
            !request.body.quantity||
            !request.body.yield||
            !request.body.remarks 
        ) {
            throw createValidationError('Send all required fields');
        }

        const {id} = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        // Extract only allowed fields from request body (alias reserved word 'yield')
        const { season, fieldName, cropType, variety, quantity, remarks, yield: cropYield } = request.body;

        // Create update object with only allowed fields
        const updateData = { season, fieldName, cropType, variety, quantity, yield: cropYield, remarks };

        const result = await Rotation.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!result) {
            throw createNotFoundError('Rotation record');
        }
        return response.success({message: 'Record updated successfully', data: result});
}));

//Route to delete a Record
router.delete('/:id',protect, authorize('user'), asyncHandler(async(request, response) => {
        const {id} = request.params
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }
        const result = await Rotation.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Rotation record');
        }
        return response.success({message: 'Record deleted successfully'});
}));

export default router;