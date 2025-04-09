const mongoose = require("mongoose");

const WalletAddressSchema = new mongoose.Schema({
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transactons',
        required: true
    },
    fromWallet: { type: String, required: true },
    toWallet: { type: String, },
    hash: { type: String, required: true },
    fee: { type: String },
    notes: { type: String, },

}, { timestamps: true });


module.exports = mongoose.model("TransactionWallets", WalletAddressSchema);
