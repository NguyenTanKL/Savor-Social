const Voucher = require('../../Models/voucherModel');
const User = require('../../models/UserModel');
const { bucket } = require("../../config/cloudinary/cloudinaryConfig");
const multer = require("multer");


class VoucherController{

    // GET /:name
    async getListOfVouchers(req, res) {
        try {
            const vouchers = await Voucher.find({ name: req.params.name });

            const formattedVouchers = vouchers.map(voucher => ({
                _id: voucher._id,
                name: voucher.name,
                status: voucher.status,
                release_day: new Date(voucher.release_day).toLocaleDateString("en-GB"), 
                expire_day: new Date(voucher.expire_day).toLocaleDateString("en-GB"),
                code: voucher.code,
                description: voucher.description,
                by: voucher.by
            }));
    
            res.json(formattedVouchers);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /summary
    async getGroupOfVouchers(req, res) {
        try {
            const vouchers = await Voucher.aggregate([
                {
                    $group: {
                        _id: "$name", // Group by voucher name
                        total: { $sum: 1 }, // Count total vouchers of this type
                        image: { $first: "$img" }, // Get the first image
                        collected: { 
                            $sum: { 
                                $cond: [ { $eq: ["$quantity", 0] }, 1, 0 ] // Count as collected if quantity = 0
                            } 
                        },
                        used: { 
                            $sum: { 
                                $cond: [ { $eq: ["$status", "used"] }, 1, 0 ] // Count as used if status is "used"
                            } 
                        },
                        expired: { 
                            $sum: { 
                                $cond: [ { $lt: ["$expire_day", new Date()] }, 1, 0 ] // Count as expired if past date
                            } 
                        },
                        dateStart: { $min: "$release_day" }, // Use $min to ensure correct date format
                        dateEnd: { $max: "$expire_day" } // Use $max for expiry dates
                    }
                },
                {
                    $sort: { dateEnd: -1 } // Sort by expiry date
                },
                {
                    $project: {
                        _id: 1,
                        total: 1,
                        collected: 1,
                        image: 1,
                        used: 1,
                        expired: 1,
                        formattedDateStart: {
                            $dateToString: { format: "%d/%m/%Y", date: "$dateStart" }
                        },
                        formattedDateEnd: {
                            $dateToString: { format: "%d/%m/%Y", date: "$dateEnd" }
                        }
                    }
                }
            ]);
    
            res.status(200).json(vouchers);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // POST /create
    async createVoucher(req, res){
        try {
            const { name, quantity, release_day, expire_day, description } = req.body;
    
            // Validate required fields
            if (!name || !quantity || !release_day || !expire_day || !description) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const imageUrl = req.file ? req.file.path : null;
            
            const vouchers = Array.from({ length: quantity }, (_, index) => ({
                name,
                description,
                release_day,
                expire_day,
                img: imageUrl,
                status: "available",
                quantity: 1,
                code: `${name.replace(/\s+/g, "").toUpperCase()}-${index + 1}`, // Unique code
            }));
    
            // await newVoucher.save();
            await Voucher.insertMany(vouchers);
            res.status(201).json({ message: "Voucher created successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // POST /collect/:voucherId
    async collectVoucher(req, res) {
        try {
            const { voucherId } = req.params;
            const { userId } = req.body;
    
            // Check if the voucher exists
            const voucher = await Voucher.findById(voucherId);
            if (!voucher) {
                return res.status(404).json({ message: "Voucher not found" });
            }
    
            // Check if the voucher is still available
            if (voucher.quantity <= 0) {
                return res.status(400).json({ message: "Voucher is out of stock" });
            }
    
            // Check if the user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            // Check if the user already collected this voucher
            if (user.my_vouchers.includes(voucherId)) {
                return res.status(400).json({ message: "Voucher already collected" });
            }
    
            // Save the voucher to the user's collection
            user.my_vouchers.push(voucherId);
            await user.save();
    
            // Reduce voucher quantity, add information about the collector
            voucher.quantity -= 1;
            voucher.status = "collected";
            voucher.collector = userId;
            voucher.by = user.username;
            await voucher.save();
    
            return res.status(200).json({ message: "Voucher collected successfully", voucher });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }
   
}

module.exports = new VoucherController