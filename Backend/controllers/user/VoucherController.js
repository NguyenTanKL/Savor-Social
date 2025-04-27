const Voucher = require('../../models/voucherModel');
const User = require('../../models/UserModel');
const { bucket } = require("../../config/cloudinary/cloudinaryConfig");
const multer = require("multer");
const cloudinary = require("../../config/cloudinary/cloudinaryConfig").cloudinary;


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
    async getAllVouchers(req, res) {
        try {
            // const restaurantId = req.user.id;

            // const vouchers = await Voucher.find({ restaurant_id: restaurantId });
            const vouchers = await Voucher.find();
            
            const formattedVouchers = vouchers.map(v => ({
              _id: v._id,
              name: v.name,
              quantity: v.quantity,
              release_day: v.release_day,
              expire_day: v.expire_day,
              description: v.description,
              image: v.image,
              code: v.code,
              status: v.status,
              formattedDateStart: v.release_day ? new Date(v.release_day).toLocaleDateString() : null,
              formattedDateEnd: v.expire_day ? new Date(v.expire_day).toLocaleDateString() : null,
            }));
        
            res.status(200).json(formattedVouchers);
          } catch (error) {
            console.error("Fetch vouchers error:", error);
            res.status(500).json({ message: "Server error", error: error.message });
          }
    }

    // POST /create
    async createVoucher(req, res){
        try {
            const { name, quantity, release_day, expire_day, description, restaurantId } = req.body;
    
            // Validate required fields
            if (!name || !quantity || !release_day || !expire_day || !description) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const imageUrl = req.file ? req.file.path : null;
            
            const vouchers = new Voucher({
                name,
                description,
                release_day,
                expire_day,
                img: imageUrl,
                status: "available",
                quantity: quantity,
                restaurant_id: restaurantId
            });
    
            // await newVoucher.save();
            await vouchers.save();
            res.status(201).json({ message: "Voucher created successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // POST /delete/:id
    async deleteVoucher(req, res) {
        try {
            const { id } = req.params;
    
            // Find vouchers by name
            const voucher = await Voucher.findById(id);
            if (!voucher) {
                return res.status(404).json({ message: "Voucher not found" });
            }
    
            // Delete images from Cloudinary
            if (voucher.img) {
                const publicId = voucher.img.split('/').pop().split('.')[0]; // Extract public_id
                await cloudinary.uploader.destroy(`vouchers/${publicId}`);
            }
    
            // Delete vouchers from the database
            await Voucher.findByIdAndDelete(id);
    
            res.status(200).json({ message: "Vouchers deleted successfully" });
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
            voucher.collector.push(userId);
            voucher.by = user.username;
            await voucher.save();
    
            return res.status(200).json({ message: "Voucher collected successfully", voucher });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async getVouchers_detail(req,res)
    {
        try {
            const voucher = await Voucher.findById(req.params.voucher_id);
            console.log("day la api router nhan duoc", req.params);
            if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });
            res.json(voucher);
        } catch (err) {
            res.status(500).json({ message: "Lỗi server" });
        }

    }
   
}

module.exports = new VoucherController