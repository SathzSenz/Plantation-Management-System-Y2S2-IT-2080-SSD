import express from "express";
import {TaskRecord} from "../../models/EmpManagement/TaskModel.js";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";



const router = express.Router();

//Route for save a new task
router.post('/', asyncHandler(async(request, response) => {
        if (
            !request.body.emp_id ||
            !request.body.task||
            !request.body.assign_date||
            !request.body.due_date||
            !request.body.task_des||
            !request.body.task_status

        ) {
            throw createValidationError('Send all required fields');
        }

        const NewTask = {

            emp_id:request.body.emp_id,
            task:request.body.task,
            assign_date:request.body.assign_date,
            due_date:request.body.due_date,
            task_des:request.body.task_des,
            task_status:request.body.task_status,

        };

        const TaskRecords = await TaskRecord.create(NewTask)
        return response.success(TaskRecords, 201);
}));

//Route to get all the tasks from the database
router.get('/', asyncHandler(async (request, response) => {
        const TaskRecords = await TaskRecord.find({});
        return response.success({
            count: TaskRecords.length,
            data: TaskRecords,
        });
}));

//Route for get one task from database by id
router.get('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const TaskRecords = await TaskRecord.findById(id);
        if (!TaskRecords) throw createNotFoundError('Task record');
        return response.success(TaskRecords);
}));

//Route for update employee

router.put('/:id', asyncHandler(async (request, response) => {
        if (

            !request.body.emp_id ||
            !request.body.task||
            !request.body.assign_date||
            !request.body.due_date||
            !request.body.task_des||
            !request.body.task_status

        ) {
            throw createValidationError('Send all required fields');
        }

        const { id } = request.params;

        const result = await TaskRecord.findByIdAndUpdate(id, request.body, { new: true });

        if (!result) {
            throw createNotFoundError('Task record');
        }
        return response.success({ message: 'Task record updated successfully', data: result });
}));

//Route to delete a task record

router.delete('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const result = await TaskRecord.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Task record');
        }
        return response.success({ message: 'Task record deleted successfully' });
}));

export default router;
