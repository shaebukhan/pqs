const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var currencySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,

    },
    currency: {
        type: String,
        required: true,
    }
});

//Export the model
module.exports = mongoose.model('Currency', currencySchema);