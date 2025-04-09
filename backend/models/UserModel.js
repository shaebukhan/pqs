const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
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
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 0,
    },
    kycstatus: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    balances: {
      fiat: [
        {
          currency: {
            type: String, // Example: 'USD', 'EUR'
            required: true,
          },
          availableBalance: {
            type: Number,
            default: 0,
          },
        },
      ],
      crypto: [
        {
          asset: {
            type: String,
            required: true,
          },
          networks: [
            {
              networkName: {
                type: String,
                required: true,
              },
              availableBalance: {
                type: Number,
                default: 0,
              },
            },
          ],
        },
      ],
    },
    profile: {
      details: [
        {
          identityType: {
            type: String,
          },
          firstName: {
            type: String,
          },
          lastName: {
            type: String,
          },
          phone: {
            type: String,
          },
          dob: {
            type: Date,
          },
          gender: {
            type: String,
          },
          postal: {
            type: String,
          },
          address: {
            type: String,
          },
          street: {
            type: String,
          },
          city: {
            type: String,
          },
          state: {
            type: String,
          },
          country: {
            type: String,
          },
          designation: {
            type: String,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
