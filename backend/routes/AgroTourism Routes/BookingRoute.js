import express from 'express';
import Booking from '../../models/AgroTourism Models/BookingModel.js';
import cors from 'cors';
import { asyncHandler } from '../../middleware/errorMiddleware.js';
import { createNotFoundError, createValidationError } from '../../utils/errors.js';
const router = express.Router();

// Route to get bookings by user ID
router.get('/booking', asyncHandler(async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        throw createValidationError('User ID is required');
    }
    const bookings = await Booking.find({ userId });
    return res.success({ data: bookings });
}));

// Route to save a new booking
router.post('/', asyncHandler(async (request, response) => {
        const {
            name,
            telNo,
            nicNo,
            email,
            selectedPackage,
            date,
            numberOfDays,
            numberOfPeople,
            visitorType,
            totalPayment,
        } = request.body;

        // Check if all required fields are provided
        if (!name || !telNo || !nicNo || !email || !selectedPackage || !date || !numberOfPeople || !visitorType)  {
            throw createValidationError('All required fields must be provided: name, telNo, nicNo, email, selectedPackage, date');
        }

        // Additional validation for guidedFarmTour package
        if (selectedPackage === 'guidedFarmTour' && !numberOfDays) {
            throw createValidationError('Number of days is required for the guided farm tour package');
        }

        const newBooking = {
            name,
            telNo,
            nicNo,
            email,
            selectedPackage,
            date,
            numberOfDays,
            numberOfPeople,
            visitorType,
            totalPayment,
        };

        const booking = await Booking.create(newBooking);
        return response.success(booking, 201);
}));

// Route to get all the bookings from the database
router.get('/', asyncHandler(async (request, response) => {
        const bookings = await Booking.find({});
        return response.success({ count: bookings.length, data: bookings });
}));

// Route to get a booking by ID
router.get('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const booking = await Booking.findById(id);

        if (!booking) {
            throw createNotFoundError('Booking');
        }
        return response.success(booking);
}));

// Route to update a booking
router.put('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        // Extract only allowed fields from request body
        const { name, telNo, nicNo, email, selectedPackage, date, numberOfDays, numberOfPeople, visitorType, totalPayment } = request.body;

        // Check if all required fields are provided
        if (!name || !telNo || !nicNo || !email || !selectedPackage || !date || !numberOfPeople || !visitorType)  {
            throw createValidationError('All required fields must be provided: name, telNo, nicNo, email, selectedPackage, date');
        }

        // Additional validation for guidedFarmTour package
        if (selectedPackage === 'guidedFarmTour' && !numberOfDays) {
            throw createValidationError('Number of days is required for the guided farm tour package');
        }

        // Create update object with only allowed fields
        const updateData = { name, telNo, nicNo, email, selectedPackage, date, numberOfDays, numberOfPeople, visitorType, totalPayment };

        const result = await Booking.findByIdAndUpdate(id, updateData, { new: true });

        if (!result) {
            throw createNotFoundError('Booking');
        }
        return response.success({ message: 'Booking updated successfully' });
}));

// Route to delete a booking
router.delete('/:id', asyncHandler(async (request, response) => {
        const { id } = request.params;

        const result = await Booking.findByIdAndDelete(id);

        if (!result) {
            throw createNotFoundError('Booking');
        }
        return response.success({ message: 'Booking deleted successfully' });
}));

export default router;