const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    accountNumber: { type: String, required: true },
    sortCode: { type: String, },
    bankName: { type: String, },
    bankAddress: { type: String, },
    iban: { type: String, },
    swiftCode: { type: String, },


}, { timestamps: true });


module.exports = mongoose.model("BankAccount", BankAccountSchema);
