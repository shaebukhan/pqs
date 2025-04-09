const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    asset: { type: String, required: true },
    wallet: { type: String, required: true },

}, { timestamps: true });


module.exports = mongoose.model("Wallet", WalletSchema);
