// routes/userRoutes.js
const express = require("express")
const { getAllUsers, getRestaurants, getNormalUsers, updateUser,followUser,getFollowedUsers, unfollowUser, getFollowing, searchUser, getUserById, getFollowers,checkFollowStatus, removeFollower , getVouchers, removeVoucherFromUser} = require("../controllers/userController.js")
const User = require("../models/UserModel"); 
const userAuth = require("../middlewares/authMiddleware.js")

const router = express.Router();

router.get("/", getAllUsers);
router.get("/restaurants", getRestaurants);
router.get("/normal-users", getNormalUsers);
router.put("/update-user", userAuth, updateUser);
router.post("/follow/:id", userAuth, followUser);
router.get("/followed",userAuth,getFollowedUsers);
router.delete("/unfollow/:id",userAuth,unfollowUser);
router.get("/following/:userId", userAuth, getFollowing);
router.get("/follower/:userId", userAuth, getFollowers);
router.post("/search", searchUser);
router.get("/get-by-id/:userId", getUserById);
router.get("/check-follow/:id",userAuth,checkFollowStatus);
router.delete("/remove-follower/:followerId",userAuth,removeFollower);
router.get("/vouchers/:userId", getVouchers);
router.delete('/:userId/voucher/:voucherId', removeVoucherFromUser);

// API lấy thông tin user theo ID
router.get("/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu user:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});
module.exports =  router;
