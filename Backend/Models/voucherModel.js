const mongoose = require ('mongoose');

const VoucherSchema = new mongoose.Schema({
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurants'
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    release_day: {
        type: Date,
        required: true,
        default: Date.now
    },
    expire_day: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    }
});

const voucher = new mongoose.model('vouchers',VoucherSchema);

module.exports = voucher;