
const mongoose = require('mongoose');
require("dotenv").config();

async function connect() {
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connect successfully!')
    } catch (error) {
        console.log('Connect failed!', error.message)
    }
}

module.exports = {connect};

