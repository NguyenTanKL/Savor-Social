const express = require("express");
const router = express.Router();
const { uploadVoucher } = require("../../config/cloudinary/cloudinaryConfig");

const voucherController = require('../../controllers/user/VoucherController');

router.post('/create', uploadVoucher.single("image"), voucherController.createVoucher)

router.post('/collect/:voucherId', voucherController.collectVoucher)

router.get('/summary', voucherController.getGroupOfVouchers)

router.get('/:name', voucherController.getListOfVouchers)

module.exports = router;