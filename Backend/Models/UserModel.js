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
        required: [true, "Password is Required!"],
        minlength: [6, "Password length should be greater than 6 character"],
        select: true,
    },
    phone: {
        type: String,
        required: false
    },
    darkmode: {
        type: Boolean,
        required: true,
        default:false
    },
    usertype: {
        type: String,
        required: true,
        enum:["normal","restaurant"]
    },
    avatar: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    preferences: {
        type: [String],
        default: []
    }
});

const UserModel = new mongoose.model('users',UserSchema);

module.exports = UserModel;