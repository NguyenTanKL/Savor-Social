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
    img: {
        type: String,
        required: false
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
    },
    status: {
        type: String,
        default: 'available'
    },
    code: {
        type: String,
        unique: true
    },
    collector: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    by: [{
        type: String
    }]
});

VoucherSchema.pre("save", async function (next) {
    if (!this.code) {
        this.code = [...Array(10)].map(() => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            return chars.charAt(Math.floor(Math.random() * chars.length));
        }).join('');
    }
    next();
});

const voucher = new mongoose.model('vouchers',VoucherSchema);

module.exports = voucher;