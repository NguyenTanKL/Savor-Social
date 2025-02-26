const mongoose = require ('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    darkmode: {
        type: Boolean,
        required: true
    },
    usertype: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false
    },
});

const UserModel = new mongoose.model('users',UserSchema);

module.exports = UserModel;