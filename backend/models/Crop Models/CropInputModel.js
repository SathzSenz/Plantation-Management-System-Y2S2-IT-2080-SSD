import mongoose from "mongoose";

const CropInputSchema = mongoose.Schema(
    {
        date: {
            type: Date,
            default: Date.now,
        },
        type: {
            type: String,
            required: true,
        },
        field: {
            type: String,
            required: true,
        },
        cropType: {
            type: String,
        },
        variety: {
            type: String,
        },
        chemicalName: {
            type:String,
        },
        quantity: {
            type: Number,
            required: true,
        },
        unitCost: {
            type: Number,
            required: true,
        },
        remarks: {
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

export const CropInputs = mongoose.model('CropInputRecords', CropInputSchema);
