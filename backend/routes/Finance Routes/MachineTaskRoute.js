import {MachinesTask} from "../../models/Finance Models/MachineTaskModel.js";
import express from "express";

const router = express.Router();

// create a new record
router.post('/', async (request, response) => {
    try {
        if (
            !request.body.start_date ||
            !request.body.name ||
            !request.body.type ||
            !request.body.rate ||
            !request.body.payee ||
            !request.body.description
        ) {
            return response.status(400).send({
                message: 'Send all required fields',
            });
        }

        const NewMachinesRecord = {
            start_date: request.body.start_date,
            name: request.body.name,
            type: request.body.type,
            rate: request.body.rate,
            payee: request.body.payee,
            description: request.body.description
        };

        const MachineRecord = await MachinesTask.create(NewMachinesRecord);
        return response.status(201).send(MachineRecord);

    }catch (error) {
        console.log(error.message);
        response.status(500).send({message: error.message});
    }
});

// Route for Get All from database

router.get('/', async (request, response) => {
    try {
        const MachineRecord = await MachinesTask.find({});

        return response.status(200).json({
            count: MachineRecord.length,
            data: MachineRecord,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for Get One transaction from database by id
router.get('/:id', async (request, response) => {
    try {
        const { id } = request.params;

        const MachineRecord = await MachinesTask.findById(id);

        return response.status(200).json(MachineRecord);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for Update a transaction
router.put('/:id', async (request, response) => {
    try {
        const requiredFields = ['start_date', 'name', 'type', 'rate', 'payee', 'description'];
        let missingFields = requiredFields.filter(field => !request.body[field]);

        if (missingFields.length > 0) {
            return response.status(400).send({
                message: `Missing required fields: ${missingFields.join(', ')}`,
            });
        }

        const { id } = request.params;

        // Extract only allowed fields from request body
        const { start_date, name, type, rate, payee, description } = request.body;

        // Create update object with only allowed fields
        const updateData = { start_date, name, type, rate, payee, description };

        const result = await MachinesTask.findByIdAndUpdate(id, updateData);

        if (!result) {
            return response.status(404).json({ message: 'Transaction record not found' });
        }

        return response.status(200).send({ message: 'Transaction record updated successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for Delete a book
router.delete('/:id', async (request, response) => {
    try {
        const { id } = request.params;

        const result = await MachinesTask.findByIdAndDelete(id);

        if (!result) {
            return response.status(404).json({ message: 'Transaction record not found' });
        }

        return response.status(200).send({ message: 'Transaction record deleted successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;