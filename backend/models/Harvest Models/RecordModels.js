import mongoose from 'mongoose';

const HarvestRecordSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    cropType: {
        type: String,
        required: true
    },
    ageOfYield: {
        type: Number,
        required: true
    },
    wayPicked: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    treesPicked: {
        type: Number,
        required: true
    },
    remarks: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

export const HarvestingRecord = mongoose.model('HarvestingRecord', HarvestRecordSchema );
