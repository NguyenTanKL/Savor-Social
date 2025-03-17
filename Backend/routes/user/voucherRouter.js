const express = require("express");
const router = express.Router();
const upload = require('../../controllers/helper/UploadVoucher')

const voucherController = require('../../controllers/user/VoucherController');

router.post('/create', upload.single("image"), voucherController.createVoucher)

router.post('/collect/:voucherId', voucherController.collectVoucher)

router.get('/summary', voucherController.getGroupOfVouchers)

router.get('/:name', voucherController.getListOfVouchers)

module.exports = router;