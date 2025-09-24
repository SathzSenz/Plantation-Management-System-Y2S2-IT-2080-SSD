import express from "express";
import mongoose from 'mongoose';
import {RegistrationRecord} from "../../models/EmpManagement/RegistrationModel.js";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";
import { protect, authorize } from "../../middleware/auth.js";




const router = express.Router();

//Route for save a new employee
router.post('/',protect, authorize('user'), asyncHandler(async(request, response) => {
        if (
            !request.body.f_name ||
            !request.body.l_name||
            !request.body.dob||
            !request.body.gender||
            !request.body.contact_no||
            !request.body.emp_email||
            !request.body.nic||
            !request.body.e_address||
            !request.body.emp_type||
            !request.body.qualifications||
            !request.body.h_date||
            !request.body.h_rate

        ) {
            throw createValidationError('Send all required fields');
        }

        const NewRegistration = {

            f_name: request.body.f_name,
            l_name: request.body.l_name,
            dob: request.body.dob,
            gender: request.body.gender,
            contact_no: request.body.contact_no,
            emp_email: request.body.emp_email,
            nic: request.body.nic,
            e_address: request.body.e_address,
            emp_type: request.body.emp_type,
            qualifications: request.body.qualifications,
            h_date: request.body.h_date,
            h_rate:request.body.h_rate,

        };

        const RegistrationsRecords = await RegistrationRecord.create(NewRegistration)
        return response.success(RegistrationsRecords, 201);
}));

//Route to get all the register employees from the database
router.get('/',protect, authorize('user'), asyncHandler(async (request, response) => {
        const RegistrationsRecords = await RegistrationRecord.find({});
        return response.success({
            count: RegistrationsRecords.length,
            data: RegistrationsRecords,
        });
}));

//Route for get one register employee from database by id
router.get('/:id',protect, authorize('user'), asyncHandler(async (request, response) => {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        const RegistrationsRecords = await RegistrationRecord.findById(id);
        if (!RegistrationsRecords) throw createNotFoundError('Registration record');
        return response.success(RegistrationsRecords);
}));

//Route for update employee

router.put('/:id',protect, authorize('user'), asyncHandler(async (request, response) => {
        if (

            !request.body.f_name ||
            !request.body.l_name||
            !request.body.dob||
            !request.body.gender||
            !request.body.contact_no||
            !request.body.emp_email||
            !request.body.nic||
            !request.body.e_address||
            !request.body.emp_type||
            !request.body.qualifications||
            !request.body.h_date||
            !request.body.h_rate

        ) {
            throw createValidationError('Send all required fields');
        }

        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        // Extract only allowed fields from request body
        const { f_name, l_name, dob, gender, contact_no, emp_email, nic, e_address, emp_type, qualifications, h_date, h_rate } = request.body;

        // Create update object with only allowed fields
        const updateData = { f_name, l_name, dob, gender, contact_no, emp_email, nic, e_address, emp_type, qualifications, h_date, h_rate };

        const result = await RegistrationRecord.findByIdAndUpdate(id, updateData, { new: true });

        if (!result) {
            throw createNotFoundError('Registration record');
        }
        return response.success({ message: 'Registration record updated successfully', data: result });
}));

//Route to delete a registration record

router.delete('/:id',protect, authorize('user'), asyncHandler(async (request, response) => {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        const result = await RegistrationRecord.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Registration record');
        }
        return response.success({ message: 'Registration record deleted successfully' });
}));

export default router;





