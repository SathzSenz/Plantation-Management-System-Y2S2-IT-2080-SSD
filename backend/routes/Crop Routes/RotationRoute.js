import express from 'express';
import { Rotation } from '../../models/Crop Models/RotationModel.js';
import { asyncHandler } from '../../middleware/errorMiddleware.js';
import { createNotFoundError, createValidationError } from '../../utils/errors.js';

const router = express.Router();

//Save new record
router.post('/', asyncHandler(async(request, response) => {
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
router.get('/', asyncHandler(async(request, response) => {
        const result = await Rotation.find({});
        return response.success({ count: result.length, data: result })
}));

//Get one record by id
router.get('/:id', asyncHandler(async(request, response) => {
        const {id} = request.params;
        const result = await Rotation.findById(id);
        if (!result) throw createNotFoundError('Rotation record');
        return response.success(result);
}));

//Update record
router.put('/:id', asyncHandler(async(request, response) => {
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

        // Extract only allowed fields from request body
        const { season, fieldName, cropType, variety, quantity, yield, remarks } = request.body;

        // Create update object with only allowed fields
        const updateData = { season, fieldName, cropType, variety, quantity, yield, remarks };

        const result = await Rotation.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!result) {
            throw createNotFoundError('Rotation record');
        }
        return response.success({message: 'Record updated successfully', data: result});
}));

//Route to delete a Record
router.delete('/:id', asyncHandler(async(request, response) => {
        const {id} = request.params
        const result = await Rotation.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Rotation record');
        }
        return response.success({message: 'Record deleted successfully'});
}));

export default router;