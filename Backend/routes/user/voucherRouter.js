const express = require("express");
const router = express.Router();
const { upload } = require("../../config/cloudinary/cloudinaryConfig");

const voucherController = require('../../controllers/user/VoucherController');

router.post('/create', upload.single("image"), voucherController.createVoucher)

router.delete('/delete/:name', voucherController.deleteVoucher)

router.post('/collect/:voucherId', voucherController.collectVoucher)

router.get('/summary', voucherController.getGroupOfVouchers)

router.get('/:name', voucherController.getListOfVouchers)

module.exports = router;