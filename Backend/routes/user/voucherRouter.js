const express = require("express");
const router = express.Router();

const voucherController = require('../../controllers/user/VoucherController');

router.post('/create', voucherController.createVoucher)

router.post('/collect/:voucherId', voucherController.collectVoucher)

router.get('/summary', voucherController.getGroupOfVouchers)

router.get('/:name', voucherController.getListOfVouchers)

module.exports = router;