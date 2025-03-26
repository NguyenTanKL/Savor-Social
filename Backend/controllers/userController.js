// controllers/userController.js
const User = require("../Models/UserModel");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ usertype: 'restaurant' });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

const getNormalUsers = async (req, res) => {
  try {
    const normalUsers = await User.find({ usertype: 'normal' });
    res.json(normalUsers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

const updateUser = async (req, res) => {
  try {
    console.log("body:", req.body);
    const { address, preferences } = req.body;
    // Lấy userId từ middleware userAuth (được gán vào req.user)
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    // Cập nhật các trường nếu có
    if (address !== undefined) user.address = address;
    if (preferences !== undefined) user.preferences = preferences;
    
    await user.save();
    res.json({ message: 'Cập nhật người dùng thành công', user });
  } catch (error) {
    console.error('Lỗi khi cập nhật người dùng:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};
const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: followId } = req.params;

    if (!followId) {
      return res.status(400).json({ message: "Thiếu ID của người dùng cần follow" });
    }

    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    if (!user || !followUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (!user.following.includes(followId)) {
      user.following.push(followId);
      user.followingCount = user.following.length; // Cập nhật followingCount
      await user.save();
    }

    if (!followUser.followers.includes(userId)) {
      followUser.followers.push(userId);
      followUser.followerCount = followUser.followers.length; // Cập nhật followerCount
      await followUser.save();
    }

    res.json({ message: "Follow thành công",
      currentUser: {
        _id: user._id,
        following: user.following,
        followingCount: user.followingCount,
      },
      followedUser: {
        _id: followUser._id,
        followers: followUser.followers,
        followerCount: followUser.followerCount,
      },
     });
  } catch (error) {
    console.error("Lỗi khi follow:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};
const getFollowedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("following", "_id");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ following: user.following.map(user => user._id.toString()) });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách follow:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};  
const unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: unfollowId } = req.params;

    if (!unfollowId) {
      return res.status(400).json({ message: "Thiếu ID của người dùng cần unfollow" });
    }

    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowId);

    if (!user || !unfollowUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Xóa user khỏi danh sách following
    user.following = user.following.filter((id) => id.toString() !== unfollowId);
    user.followingCount = user.following.length; // Cập nhật followingCount
    await user.save();

    // Xóa user khỏi danh sách followers
    unfollowUser.followers = unfollowUser.followers.filter(
      (id) => id.toString() !== userId
    );
    unfollowUser.followerCount = unfollowUser.followers.length; // Cập nhật followerCount
    await unfollowUser.save();

    res.json({ message: "Unfollow thành công",
      currentUser: {
        _id: user._id,
        following: user.following,
        followingCount: user.followingCount,
      },
      unfollowedUser: {
        _id: unfollowUser._id,
        followers: unfollowUser.followers,
        followerCount: unfollowUser.followerCount,
      },
     });
  } catch (error) {
    console.error("Lỗi khi unfollow:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};
const getFollowing = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ token
    const user = await User.findById(userId).populate("following", "username avatar");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(user.following);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách following:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};
const searchUser = async (req,res) => {
  try {
    let { keyword } = req.body; 

    if (!keyword) {
      return res.json([]);
    }

    const users = await User.find({
      "$or": [
        {"username": {"$regex": keyword, "$options": "i" }},
        { "tag": { "$regex": keyword, "$options": "i" } }
      ]
    })
    .select("_id username tag avatar") 
    .limit(10)  
    .lean();
    res.json(users);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
const getUserById = async(req,res) => {
  try{
    const user= await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "username avatar ")
    .populate("following", "username avatar")
    console.log("User:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);

  }
  catch (err){
    res.status(500).json(err);
  }
};
module.exports = {
  getAllUsers,
  getRestaurants,
  getNormalUsers,
  updateUser,
  followUser,
  getFollowedUsers,
  unfollowUser,
  getFollowing,
  searchUser,
  getUserById,
};
