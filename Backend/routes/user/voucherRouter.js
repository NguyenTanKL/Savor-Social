const express = require("express");
const router = express.Router();

const voucherController = require('../../controllers/user/voucherController');

router.post('/create', voucherController.createVoucher)

router.post('/collect/:voucherId', voucherController.collectVoucher)

router.get('/summary', voucherController.getAllVouchers)

module.exports = router;