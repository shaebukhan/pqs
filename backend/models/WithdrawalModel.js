const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var withdrawalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    account: {
        type: String,
        required: true,
    },
    asset: {
        type: String,

    },
    network: {
        type: String,

    },
    class: {
        type: String,

    },
    amount: {
        type: Number,
        required: true,
    },
    walletAddress: {
        type: String,

    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Add a pre-save hook to update `updatedAt` timestamp
withdrawalSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

//Export the model
module.exports = mongoose.model('Withdrawal', withdrawalSchema);
