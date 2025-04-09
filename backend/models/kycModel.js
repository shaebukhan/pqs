const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    userID: {
        type: mongoose.ObjectId,
        ref: 'Users',
    },
    userEmail: {
        type: String,
    },
    identityType: {
        type: String,
    },
    firstName: {
        type: String,
    },
    companyName: {
        type: String,
    },
    companyRegNum: {
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

    idCardImage: {
        type: String,
    },
    proofOfResidence: {
        type: String,
    },
    signature: {
        type: String,
    },
    listDirectors: {
        type: String,
    },
    listShareHolders: {
        type: String,
    },

    listBeneficialOwners: {
        type: String,
    },
    listOwnersHoldings: {
        type: String,
    },
    certificate: {
        type: String,
    },
    memorandum: {
        type: String,
    },
    financialAccounts: {
        type: String,
    },
    status: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});


// Export the Reconciliation model
module.exports = mongoose.model('Kyc', kycSchema);
