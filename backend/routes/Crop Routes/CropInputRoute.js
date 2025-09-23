import express from 'express';
import { CropInputs } from '../../models/Crop Models/CropInputModel.js';
import { asyncHandler } from '../../middleware/errorMiddleware.js';
import { createNotFoundError, createValidationError } from '../../utils/errors.js';

const router = express.Router();

router.post('/', asyncHandler(async (request, response) => {
        const {
            date,
            type,
            field,
            cropType,
            variety,
            quantity,
            remarks,
            chemicalName,
            unitCost
        } = request.body;

        // Validate type
        if (!type || (type !== 'Agrochemical' && type !== 'Planting')) {
            throw createValidationError('Invalid type provided');
        }

        let requiredFields = ['date', 'type', 'field', 'quantity', 'remarks', 'unitCost']; // Add unitCost to requiredFields
        if (type === 'Planting') {
            requiredFields = [...requiredFields, 'cropType', 'variety'];
        } else if (type === 'Agrochemical') {
            requiredFields = [...requiredFields, 'chemicalName'];
        }
        const missingFields = requiredFields.filter(field => !(field in request.body));

        if (missingFields.length > 0) {
            throw createValidationError(`Missing required fields: ${missingFields.join(', ')}`);
        }
        const newCropInput = {
            date,
            type,
            field,
            quantity,
            remarks,
            unitCost
        };

        if (type === 'Planting') {
            newCropInput.cropType = cropType;
            newCropInput.variety = variety;
        } else if (type === 'Agrochemical') {
            newCropInput.chemicalName = chemicalName;
        }
        const cropInput = await CropInputs.create(newCropInput);
        return response.success(cropInput, 201);
}));

// Get all records
router.get('/', asyncHandler(async (request, response) => {
        const cropInputs = await CropInputs.find({});
        return response.success({ count: cropInputs.length, data: cropInputs });
}));

// Get one record by id
router.get('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;
        const cropInput = await CropInputs.findById(id);
        if (!cropInput) throw createNotFoundError('Crop input');
        return response.success(cropInput);
}));

// Update record
router.put('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        // Check if unitCost is present in the request body
        if (!request.body.date || !request.body.type || !request.body.field ||
            !request.body.quantity || !request.body.remarks || !request.body.unitCost) {
            throw createValidationError('Send all required fields');
        }

        // Extract only allowed fields from request body
        const { date, type, field, quantity, remarks, unitCost } = request.body;

        // Create update object with only allowed fields
        const updateData = { date, type, field, quantity, remarks, unitCost };

        const cropInput = await CropInputs.findByIdAndUpdate(id, updateData, { new: true });
        if (!cropInput) {
            throw createNotFoundError('Crop input');
        }
        return response.success({ message: 'Crop Input updated successfully', data: cropInput });
}));

// Route to delete a record
router.delete('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;
        const cropInput = await CropInputs.findByIdAndDelete(id);
        if (!cropInput) {
            throw createNotFoundError('Crop input');
        }
        return response.success({ message: 'Crop Input deleted successfully' });
}));

export default router;
