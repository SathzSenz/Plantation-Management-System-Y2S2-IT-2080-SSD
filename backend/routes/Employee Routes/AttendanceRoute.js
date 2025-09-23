import express from "express";
import {AttendanceRecord} from "../../models/EmpManagement/AttendanceModel.js";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";



const router = express.Router();

//Route for save a new attendance
router.post('/', asyncHandler(async(request, response) => {
        if (
            !request.body.e_name ||
            !request.body.e_date||
            !request.body.att_status

        ) {
            throw createValidationError('Send all required fields');
        }

        const NewAttendance = {

            e_name:request.body.e_name,
            e_date:request.body.e_date,
            att_status:request.body.att_status,

        };

        const AttendanceRecords = await AttendanceRecord.create(NewAttendance)
        return response.success(AttendanceRecords, 201);
}));

//Route to get all the attendance from the database
router.get('/', asyncHandler(async (request, response) => {
        const AttendanceRecords = await AttendanceRecord.find({});
        return response.success({
            count: AttendanceRecords.length,
            data: AttendanceRecords,
        });
}));

//Route for get one attendance from database by id
router.get('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;
        const AttendanceRecords = await AttendanceRecord.findById(id);
        if (!AttendanceRecords) throw createNotFoundError('Attendance record');
        return response.success(AttendanceRecords);
}));

//Route for update attendance

router.put('/:id', asyncHandler(async (request, response) => {
        if (

            !request.body.e_name ||
            !request.body.e_date||
            !request.body.att_status

        ) {
            throw createValidationError('Send all required fields');
        }

        const { id } = request.params;

        // Extract only allowed fields from request body
        const { e_name, e_date, att_status } = request.body;

        // Create update object with only allowed fields
        const updateData = { e_name, e_date, att_status };

        const result = await AttendanceRecord.findByIdAndUpdate(id, updateData, { new: true });

        if (!result) {
            throw createNotFoundError('Attendance record');
        }
        return response.success({ message: 'Attendance record updated successfully', data: result });
}));

//Route to delete an attendance record

router.delete('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const result = await AttendanceRecord.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Attendance record');
        }
        return response.success({ message: 'Attendance record deleted successfully' });
}));

export default router;
