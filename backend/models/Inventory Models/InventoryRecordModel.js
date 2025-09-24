import mongoose from 'mongoose';

const InventoryRecordSchema = mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
        },
        record_ID: {
            type: String,
            required: true,
        },
        record_name: {
            type: String,
            required: true,
        },
        storage: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: false,
        },
        unit: {
            type: String,
            required: false,
        },
        quantity: {
            type: Number,
            required: true,
        },
        unit_price: {
            type: Number,
            required: true,
        },
        payer: {
            type: String,
            required: true,
        },
        expire_date: {
            type: Date,
            required: false,
        },
        description: {
            type: String,
            required: true,
        },
        ava_status: {
            type: String,
            required: false,
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

export const InventoryInput = mongoose.model('InventoryInput', InventoryRecordSchema);
