const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    type: {
        type: String,
        required: true
    },

    paymentMethod: {
        type: String,
        required: true
    },
    asset: {
        type: String,
    },
    network: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    closingBalance: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
    },
    status: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Transactions', transactionSchema);
