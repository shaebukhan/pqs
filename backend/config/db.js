const mongoose = require('mongoose');


const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://shaebukhan34:F4Fc790cHA7aVlJA@cluster0.n5q2a.mongodb.net/pqs?retryWrites=true&w=majority")
            .then(() => console.log('Database Connected SuccessFully!'));
    } catch (error) {
        console.log(`Error in mongoDB ${error}`);
    }
};

module.exports = connectDB;


