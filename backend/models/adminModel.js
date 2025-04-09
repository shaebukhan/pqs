const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    access: {
      kyc: { type: [String], default: [] },
      transactions: { type: [String], default: [] },
      deposit: { type: [String], default: [] },
      withdrawals: { type: [String], default: [] },
      adminWallets: { type: [String], default: [] },
      bank: { type: [String], default: [] },
      wallets: { type: [String], default: [] },
      baseCurrency: { type: [String], default: [] },
      users: { type: [String], default: [] },
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      default: "sub-admin",
    },

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
