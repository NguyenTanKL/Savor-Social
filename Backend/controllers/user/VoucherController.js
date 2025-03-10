const Voucher = require('../../Models/voucherModel');
const User = require('../../models/UserModel');

class VoucherController{

    // GET /vouchers
    async getAllVouchers(req, res) {
        try {
            const vouchers = await Voucher.aggregate([
                {
                    $group: {
                        _id: "$name", // Group by voucher name
                        total: { $sum: 1 }, // Count total vouchers of this type
                        collected: { 
                            $sum: { 
                                $cond: { 
                                    if: { $gt: ["$quantity", 0] }, // If quantity is greater than 0
                                    then: 1, // Count it as collected
                                    else: 0 
                                } 
                            } 
                        },
                        used: { 
                            $sum: { 
                                $cond: { 
                                    if: { $eq: ["$status", "used"] }, // If voucher status is 'used'
                                    then: 1, // Count it as used
                                    else: 0 
                                } 
                            } 
                        },
                        expired: { 
                            $sum: { 
                                $cond: { 
                                    if: { $lt: ["$expiry_date", new Date()] }, // If expiry date is in the past
                                    then: 1, // Count it as expired
                                    else: 0 
                                } 
                            } 
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
    
            const newVoucher = new Voucher({
                name,
                quantity,
                release_day,
                expire_day,
                description,
            });
    
            await newVoucher.save();
            res.status(201).json({ message: "Voucher created successfully", voucher: newVoucher });
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
    
            // Reduce voucher quantity
            voucher.quantity -= 1;
            await voucher.save();
    
            return res.status(200).json({ message: "Voucher collected successfully", voucher });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }
   
}

module.exports = new VoucherController