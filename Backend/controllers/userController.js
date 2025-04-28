// controllers/userController.js
const User = require("../models/UserModel");
const Post = require("../models/PostModel");
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
    const updates = req.body;
    // Lấy userId từ middleware userAuth (được gán vào req.user)
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    // Cập nhật các trường nếu có
    // if (address !== undefined) user.address = address;
    // if (preferences !== undefined) user.preferences = preferences;
    // Dynamically update any valid fields
    Object.keys(updates).forEach(field => {
      user[field] = updates[field];
    });
    
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

    if (userId === followId) {
      return res.status(400).json({ message: "Không thể follow chính mình" });
    }

    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    if (!user || !followUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (!user.following.includes(followId)) {
      user.following.push(followId);
      user.followingCount = user.following.length;
      await user.save();
    }

    if (!followUser.followers.includes(userId)) {
      followUser.followers.push(userId);
      followUser.followerCount = followUser.followers.length;
      await followUser.save();
    }

    res.json({
      message: "Follow thành công",
      isFollowing: true, // Trả về trạng thái follow
      user: {
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

    user.following = user.following.filter((id) => id.toString() !== unfollowId);
    user.followingCount = user.following.length;
    await user.save();

    unfollowUser.followers = unfollowUser.followers.filter(
      (id) => id.toString() !== userId
    );
    unfollowUser.followerCount = unfollowUser.followers.length;
    await unfollowUser.save();

    res.json({
      message: "Unfollow thành công",
      isFollowing: false, // Trả về trạng thái follow
      user: {
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
    const { userId } = req.params; // Lấy userId từ URL params

    console.log("Lấy danh sách following của user:", userId);

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
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ URL params

    console.log("Lấy danh sách follower của user:", userId);

    const user = await User.findById(userId).populate("followers", "username avatar");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    console.log("follower:", user.followers);
    res.json(user.followers);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách follower:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

const searchUser = async (req,res) => {
  try {
    const { query, tag } = req.body;
    const response = {};

    // Nếu có tag, trả về danh sách bài viết có tag đó
    if (tag) {
      const posts = await Post.find({
        tags: tag.toLowerCase(),
      })
        .populate("userId", "username")
        .limit(20);
      return res.json({ posts });
    }

    // Nếu không có tag, trả về danh sách user và tag liên quan
    if (!query) {
      return res.json({ users: [], tags: [], posts: [] });
    }

    // Tìm kiếm tất cả user (bao gồm cả normal và restaurant)
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    })
      .select("username accountType")
      .limit(5);

    // Tìm kiếm tag liên quan và số lượng bài viết
    const tagQuery = query.startsWith("#") ? query.slice(1) : query;
    const postsWithTags = await Post.find({
      tags: { $in: [new RegExp(tagQuery, "i")] },
    });

    // Tạo danh sách tag kèm số lượng bài viết
    const tagCounts = {};
    postsWithTags.forEach((post) => {
      post.tags.forEach((t) => {
        const normalizedTag = t.toLowerCase();
        if (normalizedTag.includes(tagQuery.toLowerCase())) {
          tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
        }
      });
    });

    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag: `#${tag}`, postCount: count }))
      .sort((a, b) => b.postCount - a.postCount) // Sắp xếp theo số lượng bài viết giảm dần
      .slice(0, 5); // Giới hạn 5 tag

    // Tìm kiếm bài post (theo content hoặc tags)
    const posts = await Post.find({
      $or: [
        { content: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    })
      .populate("userId", "username")
      .limit(5);

    res.json({
      users,
      tags,
      posts,
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
const getUserById = async(req,res) => {
  try{
    const user= await User.findById(req.params.userId)
    .select("-password")
    .populate("followers", "username avatar ")
    .populate("following", "username avatar")
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("userbyId:",user);
    res.status(200).json(user);

  }
  catch (err){
    res.status(500).json(err);
  }
};
const checkFollowStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: targetUserId } = req.params;
    if (!targetUserId) {
      return res.status(400).json({ message: "Thiếu ID của người dùng cần kiểm tra" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const isFollowing = user.following.includes(targetUserId);

    res.json({ isFollowing });
  } catch (error) {
    console.error("Lỗi khi kiểm tra follow:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};
const removeFollower = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ token
    const followerId = req.params.followerId;

    // Tìm user hiện tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Xóa followerId khỏi danh sách followers
    user.followers = user.followers.filter((id) => id.toString() !== followerId);
    
    // Giảm followerCount
    user.followerCount = user.followers.length; // Cập nhật followerCount dựa trên độ dài mảng followers

    // Lưu thay đổi
    await user.save();

    // Tìm follower và xóa userId khỏi danh sách following của họ
    const follower = await User.findById(followerId);
    if (!follower) {
      return res.status(404).json({ message: "Follower not found" });
    }
    follower.following = follower.following.filter((id) => id.toString() !== userId);
    
    // Giảm followingCount của follower
    follower.followingCount = follower.following.length; // Cập nhật followingCount
    await follower.save();

    // Trả về phản hồi với thông tin cập nhật
    res.status(200).json({ 
      message: "Follower removed", 
      followers: user.followers, 
      followerCount: user.followerCount 
    });
  } catch (error) {
    res.status(500).json({ message: "Error removing follower", error });
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
  getFollowers,
  checkFollowStatus,
  removeFollower,
};
