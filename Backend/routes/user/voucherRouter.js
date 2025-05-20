const express = require("express");
const router = express.Router();
const { uploadVoucher     } = require("../../config/cloudinary/cloudinaryConfig");
const userAuth = require("../../middlewares/authMiddleware");

const voucherController = require('../../controllers/user/VoucherController');

router.post('/create', uploadVoucher.single("image"), voucherController.createVoucher)

router.delete('/delete/:id', voucherController.deleteVoucher)

router.put('/update/:id', uploadVoucher.single("image"), voucherController.updateVoucher)

router.post('/:userId/collect/:voucherId', voucherController.collectVoucher)

router.get('/summary/:restaurantId', voucherController.getAllVouchers)

router.get('/:name', voucherController.getListOfVouchers)

router.get('/voucher_detail/:voucher_id', voucherController.getVouchers_detail)

router.get('/collector/:voucherId', voucherController.getCollector)

module.exports = router;