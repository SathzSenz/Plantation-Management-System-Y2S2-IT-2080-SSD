import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        telNo: {
            type: String,
            required: true,
        },
        nicNo: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        selectedPackage: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        numberOfPeople: {
            type: Number,
            required:true,
        },
        numberOfDays: {
            type: Number,
        },
        visitorType: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },

    {
        timestamps: true,
    }
);
bookingSchema.pre('save', function(next) {
    // Ensure the 'date' field exists and is a valid Date object
    if (this.date instanceof Date) {
        // Convert the date to a string without time
        this.date = this.date.toISOString().split('T')[0];
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
