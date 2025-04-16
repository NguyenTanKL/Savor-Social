const express = require("express");
const router = express.Router();
const { upload } = require("../../config/cloudinary/cloudinaryConfig");
const userAuth = require("../../middlewares/authMiddleware");

const voucherController = require('../../controllers/user/VoucherController');

router.post('/create', uploadVoucher.single("image"), voucherController.createVoucher)

router.delete('/delete/:id', voucherController.deleteVoucher)

router.post('/collect/:voucherId', voucherController.collectVoucher)

router.get('/summary', voucherController.getAllVouchers)

router.get('/:name', voucherController.getListOfVouchers)

module.exports = router;