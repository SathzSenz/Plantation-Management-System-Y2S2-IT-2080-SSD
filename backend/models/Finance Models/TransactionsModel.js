import mongoose from 'mongoose';
const FinanceSchema = mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        subtype: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        payer_payee: {
            type: String,
            required: true,
        },
        method: {
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
        timestamps:true,
    }
);

export const TransactionsRecord = mongoose.model('TransactionsRecord', FinanceSchema);















