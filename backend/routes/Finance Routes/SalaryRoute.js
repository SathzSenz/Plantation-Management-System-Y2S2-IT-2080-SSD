import {SalariesRecord} from "../../models/Finance Models/SalaryModel.js";
import express from "express";

const router = express.Router();

// create a new record
router.post('/', async (request, response) => {
    try {
        const requiredFields = [
            'payment_date',
            'emp_name',
            'salary_start_date',
            'salary_end_date',
            'nic',
            'type',
            'basic_days',
            'basic_rate',
            'bonus_salary',
            'ot_hours',
            'ot_rate',
            'epf_etf',
            'description'
        ];

        const missingFields = requiredFields.filter(field => !request.body[field]);

        if (missingFields.length > 0) {
            return response.status(400).send({
                message: `Missing required fields: ${missingFields.join(', ')}`,
            });
        }

        const NewSalaryRecord = {
            payment_date: request.body.payment_date,
            emp_name: request.body.emp_name,
            salary_start_date: request.body.salary_start_date,
            salary_end_date: request.body.salary_end_date,
            nic: request.body.nic,
            type: request.body.type,
            basic_days: request.body.basic_days,
            basic_rate: request.body.basic_rate,
            bonus_salary: request.body.bonus_salary,
            ot_hours: request.body.ot_hours,
            ot_rate: request.body.ot_rate,
            epf_etf: request.body.epf_etf,
            description: request.body.description,
        };

        const SalaryRecord = await SalariesRecord.create(NewSalaryRecord);
        return response.status(201).send(SalaryRecord);

    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});


// Route for Get All from database

router.get('/', async (request, response) => {
    try {
        const SalaryRecord = await SalariesRecord.find({});

        return response.status(200).json({
            count: SalaryRecord.length,
            data: SalaryRecord,
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

        const SalaryRecord = await SalariesRecord.findById(id);

        return response.status(200).json(SalaryRecord);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for Update a transaction
router.put('/:id', async (request, response) => {
    try {
        if (
            !request.body.payment_date ||
            !request.body.emp_name ||
            !request.body.salary_start_date ||
            !request.body.salary_end_date ||
            !request.body.nic ||
            !request.body.type ||
            !request.body.basic_days ||
            !request.body.basic_rate ||
            !request.body.bonus_salary ||
            !request.body.ot_hours ||
            !request.body.ot_rate ||
            !request.body.epf_etf ||
            !request.body.description
        ) {
            return response.status(400).send({
                message: 'Send all required fields: title, author, publishYear',
            });
        }

        const { id } = request.params;

        // Extract only allowed fields from request body
        const { payment_date, emp_name, salary_start_date, salary_end_date, nic, type, basic_days, basic_rate, bonus_salary, ot_hours, ot_rate, epf_etf, description } = request.body;

        // Create update object with only allowed fields
        const updateData = { payment_date, emp_name, salary_start_date, salary_end_date, nic, type, basic_days, basic_rate, bonus_salary, ot_hours, ot_rate, epf_etf, description };

        const result = await SalariesRecord.findByIdAndUpdate(id, updateData);

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

        const result = await SalariesRecord.findByIdAndDelete(id);

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