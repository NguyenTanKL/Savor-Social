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

            for (let voucher of vouchers) {
                if (new Date(voucher.expire_day).getTime() < Date.now()) {
                    voucher.status = "expired";
                    await voucher.save();
                }
            }

            const formattedVouchers = vouchers.map(voucher => ({
                _id: voucher._id,
                name: voucher.name,
                status: voucher.status,
                release_day: new Date(voucher.release_day).toLocaleDateString("en-GB"), 
                expire_day: new Date(voucher.expire_day).toLocaleDateString("en-GB"),
                code: voucher.code,
                description: voucher.description,
                quantity: voucher.quantity,
            }));
    
            res.json(formattedVouchers);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /summary
    async getAllVouchers(req, res) {
        try {
            const restaurantId = req.params.restaurantId; // Lấy restaurantId từ params

            const vouchers = await Voucher.find({ restaurant_id: restaurantId });
            // const vouchers = await Voucher.find();
            
            const formattedVouchers = vouchers.map(v => ({
              _id: v._id,
              name: v.name,
              quantity: v.quantity,
              release_day: v.release_day,
              expire_day: v.expire_day,
              description: v.description,
              image: v.img,
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
                in_stock: quantity,
                restaurant_id: restaurantId,
            });
    
            // await newVoucher.save();
            await vouchers.save();
            res.status(201).json({ 
                message: "Voucher created successfully",
                voucher: vouchers
            });
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

    // POST /:userId/collect/:voucherId
    async collectVoucher(req, res) {
        try {
            const { voucherId } = req.params;
            const { userId } = req.params;
    
            // Check if the voucher exists
            const voucher = await Voucher.findById(voucherId);
            if (!voucher) {
                return res.status(404).json({ message: "Voucher not found" });
            }
    
            // Check if the voucher is still available
            if (voucher.quantity <= 0) {
                return res.status(400).json({ message: "Voucher is out of stock" });
            }

            // Check if the voucher is expired
            if (voucher.status == "expired") {
                return res.status(400).json({ message: "Voucher has expired" });
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
            voucher.in_stock -= 1;
            voucher.collector.push(userId);
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
            if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });
            res.json(voucher);
        } catch (err) {
            res.status(500).json({ message: "Lỗi server" });
        }
    }
    
    async getCollector(req, res) {
        try {
            const { voucherId } = req.params;
        
            // Find all vouchers with the same ID (or same code if you're using per-user vouchers)
            const vouchers = await Voucher.find({ _id: voucherId }).populate('collector', 'username avatar -password');
        
            if (!vouchers) {
              return res.status(404).json({ message: 'No vouchers found for this ID' });
            }
        
            // If it's a list of vouchers (e.g., per-user), map each collector
            const users = vouchers
              .map(v => v.collector)
              .flat() // Flatten the array of collectors
              .filter(Boolean); // filter out nulls
        
            res.status(200).json(users);
          } catch (error) {
            console.error("Error fetching users by voucher:", error);
            res.status(500).json({ message: "Server error", error: error.message });
          }
    }
   
}

module.exports = new VoucherController