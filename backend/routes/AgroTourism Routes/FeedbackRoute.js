// Import the necessary modules and models
import express from 'express';
import mongoose from 'mongoose';
import Feedback from '../../models/AgroTourism Models/FeedbackModel.js';
import { asyncHandler } from '../../middleware/errorMiddleware.js';
import { createNotFoundError, createValidationError } from '../../utils/errors.js';

// Create an Express router
const router = express.Router();

// Route to save a new feedback
router.post('/', asyncHandler(async (req, res) => {
        // Extract data from the request body
        const { name, email, feedback, rating } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !feedback || !rating) {
            throw createValidationError('All required fields must be provided: name, email, feedback, rating');
        }

        // Create a new feedback document in the database
        const newFeedback = await Feedback.create({ name, email, feedback, rating });

        // Send a success response with the newly created feedback document
        return res.success(newFeedback, 201);
}));

// Route to get all feedbacks from the database
router.get('/', asyncHandler(async (req, res) => {
        // Fetch all feedback documents from the database
        const feedbacks = await Feedback.find({});

        // Send a success response with the fetched feedback documents
        res.success({ count: feedbacks.length, data: feedbacks });
}));

// Route to get a feedback by ID
router.get('/:id', asyncHandler(async (req, res) => {
        // Extract the feedback ID from the request parameters
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        // Find the feedback document by ID in the database
        const feedback = await Feedback.findById(id);

        // If the feedback document is not found, send a 404 response
        if (!feedback) {
            throw createNotFoundError('Feedback');
        }

        // Send a success response with the fetched feedback document
        res.success(feedback);
}));

// Route to update a feedback
router.put('/:id', asyncHandler(async (req, res) => {
        // Extract the feedback ID from the request parameters
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        // Extract only allowed fields from request body
        const { name, email, feedback, rating } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !feedback || !rating) {
            throw createValidationError('All required fields must be provided: name, email, feedback, rating');
        }

        // Create update object with only allowed fields
        const updateData = { name, email, feedback, rating };

        // Find and update the feedback document by ID in the database
        const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateData, { new: true });

        // If the feedback document is not found, send a 404 response
        if (!updatedFeedback) {
            throw createNotFoundError('Feedback');
        }

        // Send a success response with the updated feedback document
        res.success({ message: 'Feedback updated successfully', data: updatedFeedback });
}));

// Route to delete a feedback
router.delete('/:id', asyncHandler(async (req, res) => {
        // Extract the feedback ID from the request parameters
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError('Invalid ID format');
        }

        // Find and delete the feedback document by ID in the database
        const deletedFeedback = await Feedback.findByIdAndDelete(id);

        // If the feedback document is not found, send a 404 response
        if (!deletedFeedback) {
            throw createNotFoundError('Feedback');
        }

        // Send a success response with the deleted feedback document
        res.success({ message: 'Feedback deleted successfully', data: deletedFeedback });
}));

// Export the router for use in other modules
export default router;
