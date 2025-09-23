import {DiseasesRecord} from "../../models/Disease Tracking Models/DiseasesModel.js";
import express, {request, response} from "express";
import {InventoryRecord} from "../../models/Inventory Models/EqMaintainModel.js";
import {InventoryInput} from "../../models/Inventory Models/InventoryRecordModel.js";
import {subMonths, subYears, format, subWeeks} from "date-fns";
import {CropInputs} from "../../models/Crop Models/CropInputModel.js";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";

const router = express.Router();

//create new disease record
router.post('/', asyncHandler(async (request, response) => {
        console.log('Request Body:', request.body);
        if (
            !request.body.disease_name ||
            !request.body.plant_id||
            !request.body.crop ||
            !request.body.date ||
            !request.body.location ||
            !request.body.plant_count ||
            !request.body.treatment ||
            !request.body.severity ||
            !request.body.status
        ) {
            throw createValidationError('Send all required fields');
        }

        if(request.body.status === "Under Treatment") {
            const {treatment} = request.body;
            const {plant_count} = request.body;
            const amountUsedPerTree = 50;
            const totalAmountNeeded = amountUsedPerTree * plant_count;

            let foundSufficientInventory = false;
            let insufficientInventoryMessage = "Insufficient Quantity in the Inventory!!";
            let treatmentNotFoundMessage = "Treatment not Available in Inventory!!";

            // Find all records with the specified treatment name
            const inventoryRecords = await InventoryInput.find({ record_name: treatment });

            if (inventoryRecords.length === 0) {
                throw createValidationError(treatmentNotFoundMessage);
            }

            for (const inventoryRecord of inventoryRecords) {
                // Calculate the remaining amount after deducting the total amount needed
                const remainingAmount = inventoryRecord.quantity * inventoryRecord.size - totalAmountNeeded;
                // If remaining amount is sufficient or equal to zero, update the record and break the loop
                if (remainingAmount >= 0) {
                    inventoryRecord.quantity = remainingAmount / inventoryRecord.size;
                    await inventoryRecord.save();
                    foundSufficientInventory = true;
                    break;
                }
            }
            // If no record had sufficient quantity, return a message
            if (!foundSufficientInventory) {
                throw createValidationError(insufficientInventoryMessage);
            }
        }

        const newDiseaseRecord = {
            disease_name: request.body.disease_name,
            plant_id: request.body.plant_id,
            crop: request.body.crop,
            date: request.body.date,
            location: request.body.location,
            plant_count: request.body.plant_count,
            treatment: request.body.treatment,
            severity: request.body.severity,
            status: request.body.status,
        };

        const disease = await DiseasesRecord.create(newDiseaseRecord);
        return response.success(disease, 201);
} ));

//get disease records
router.get('/', asyncHandler(async (request, response) => {
        const disease = await DiseasesRecord.find({});
        return response.success({ count : disease.length, data : disease });
}));

router.get('/g', asyncHandler(async (request, response) => {
        const timeline = request.query.timeline
        let startDate;

        // Determine the start date based on the timeline filter
        if (timeline === '1 Year') {
            startDate = subYears(new Date(), 1); // Subtract 1 year from the current date
        } else if (timeline === '1 Month') {
            startDate = subMonths(new Date(), 1); // Subtract 1 month from the current date
        } else if (timeline === '1 Week') {
            startDate = subWeeks(new Date(), 1);// Calculate start date for 1 week
        } else {
            // Default to current date if timeline filter is not provided or invalid
            startDate = new Date();
        }

        // Convert the start date to string format 'yyyy-MM-dd'
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');

        // Query the database for records within the specified time range
        const diseases = await DiseasesRecord.find({
            date: { $gte: formattedStartDate, $lte: format(new Date(), 'yyyy-MM-dd') } // Filter records from start date to current date
        });

        return response.success({ count: diseases.length, data: diseases });
}));

//get disease record by id
router.get('/:id', asyncHandler(async (request, response) => {
        const {id} = request.params;

        const disease = await DiseasesRecord.findById(id);
        if (!disease) throw createNotFoundError('Disease record');
        return response.success(disease);
}));

//updating disease record
router.put('/:id', asyncHandler(async (request, response) => {
        if (
            !request.body.disease_name ||
            !request.body.plant_id||
            !request.body.crop ||
            !request.body.date ||
            !request.body.location ||
            !request.body.plant_count ||
            !request.body.treatment ||
            !request.body.severity ||
            !request.body.status
        ) {
            throw createValidationError('Send all required fields');
        }

        const {id} = request.params;
        const updatedRecord = request.body;
        const currentRecord = await DiseasesRecord.findById(id);

        const diffPlantCount = updatedRecord.plant_count - currentRecord.plant_count;

        if(diffPlantCount !==0 && request.body.status === "Under Treatment") {
            const {treatment} = request.body;
            const {plant_count} = request.body;
            const amountUsedPerTree = 50;
            const totalAmountNeeded = Math.abs(diffPlantCount) * amountUsedPerTree;

            let foundSufficientInventory = false;
            let insufficientInventoryMessage = "Insufficient Quantity in the Inventory!!";
            let treatmentNotFoundMessage = "Treatment not Available in Inventory!!";

            // Find all records with the specified treatment name
            const inventoryRecords = await InventoryInput.find({ record_name: treatment });

            if (inventoryRecords.length === 0) {
                throw createValidationError(treatmentNotFoundMessage);
            }

            for (const inventoryRecord of inventoryRecords) {
                // Calculate the remaining amount after deducting the total amount needed
                if(diffPlantCount > 0){
                    const remainingAmount = inventoryRecord.quantity * inventoryRecord.size - totalAmountNeeded;
                    // If remaining amount is sufficient or equal to zero, update the record and break the loop
                    if (remainingAmount >= 0) {
                        inventoryRecord.quantity = remainingAmount / inventoryRecord.size;
                        await inventoryRecord.save();
                        foundSufficientInventory = true;
                        break;
                    }
                }else if(diffPlantCount < 0) {
                    inventoryRecord.quantity += totalAmountNeeded / inventoryRecord.size;
                    await inventoryRecord.save();
                    foundSufficientInventory = true;
                    break;
                }

            }
            // If no record had sufficient quantity, return a message
            if (!foundSufficientInventory) {
                throw createValidationError(insufficientInventoryMessage);
            }
        }

        // Extract only allowed fields from request body
        const { disease_name, plant_id, crop, date, location, plant_count, treatment, severity, status } = request.body;

        // Create update object with only allowed fields
        const updateData = { disease_name, plant_id, crop, date, location, plant_count, treatment, severity, status };

        const result = await DiseasesRecord.findByIdAndUpdate(id, updateData, { new: true });
        if(!result){
            throw createNotFoundError('Disease record');
        }
        return response.success({message : 'Disease record updated successfully', data: result});
}));

//delete disease record
router.delete('/:id', asyncHandler(async (request, response) => {
        const {id} = request.params;

        const result = await DiseasesRecord.findByIdAndDelete(id);

        if(!result){
            throw createNotFoundError('Disease record');
        }
        return response.success({message : 'Disease record deleted successfully'});
}));

router.get('/cropTypes', asyncHandler(async (req, res) => {
    const { location } = req.query;
    console.log('Selected location:', location);
    const cropRecords = await CropInputs.find({ field: location, cropType: {$exists: true} });
    console.log('Crop Types',cropRecords);

    const crops = cropRecords.map(record => record.cropType);
    const uniqueCropTypes = [...new Set(crops)];

    res.success(uniqueCropTypes);
}));

export default router;
