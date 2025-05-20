// controllers/userController.js
const User = require("../models/UserModel");
const Notification = require("../models/NotificationModel");

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

// const updateUser = async (req, res) => {
//   try {
//     const updates = req.body;
//     // Lấy userId từ middleware userAuth (được gán vào req.user)
//     const userId = req.user.id;
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'Không tìm thấy người dùng' });
//     }
//     // Cập nhật các trường nếu có
//     const imageUrl = req.file ? req.file.path : null;
//     // if (address !== undefined) user.address = address;
//     // if (preferences !== undefined) user.preferences = preferences;
//     // Dynamically update any valid fields
//     Object.keys(updates).forEach(field => {
//       if (field !== 'image') {
//         user[field] = updates[field];
//       }
//     });

//     user.avatar = imageUrl;
    
//     await user.save();
//     res.json({ message: 'Cập nhật người dùng thành công', user });
//   } catch (error) {
//     console.error('Lỗi khi cập nhật người dùng:', error);
//     res.status(500).json({ message: 'Lỗi server nội bộ' });
//   }
// };
const updateUser = async (req, res) => {
  try {
    const updates = req.body; // Với FormData, req.body có thể là object chứa các trường
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    let imageUrl = user.avatar;
    if (req.file) {
      if (!["image/jpeg", "image/png", "image/gif"].includes(req.file.mimetype)) {
        throw new Error("Avatar phải là file JPEG, PNG hoặc GIF");
      }
      imageUrl = req.file.path;
    }

    const updateFields = {};

    console.log("Dữ liệu nhận được từ client:", req.body); // Log để debug

    // Xử lý FormData
    const fields = Object.keys(req.body).reduce((acc, key) => {
      if (key.startsWith('preferences[') && key.endsWith(']')) {
        acc.preferences = acc.preferences || [];
        acc.preferences.push(req.body[key]);
      } else if (key.startsWith('foodTypes[') && key.endsWith(']')) {
        acc.foodTypes = acc.foodTypes || [];
        acc.foodTypes.push(req.body[key]);
      } else {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    for (const field of Object.keys(fields)) {
      if (field === "preferences" || field === "foodTypes") {
        let parsedValues;
        const value = fields[field];
        if (Array.isArray(value)) {
          parsedValues = value.map((item) => item?.toString().trim()).filter((item) => item);
        } else if (typeof value === "string") {
          parsedValues = value.split(",").map((item) => item.trim()).filter((item) => item);
        } else {
          throw new Error(`${field} phải là mảng hoặc chuỗi phân tách bằng dấu phẩy`);
        }
        if (parsedValues.length === 0) {
          throw new Error(`${field} không được rỗng`);
        }
        updateFields[field] = parsedValues;
      } else if (field === "address") {
        if (typeof fields[field] !== "string" || fields[field].trim().length === 0) {
          throw new Error("Address phải là chuỗi không rỗng");
        }
        updateFields[field] = fields[field].trim();
      } else if (field === "username") {
        if (typeof fields[field] !== "string" || fields[field].trim().length < 3) {
          throw new Error("Username phải là chuỗi ít nhất 3 ký tự");
        }
        updateFields[field] = fields[field].trim();
      } else if (field === "bio") {
        if (typeof fields[field] !== "string") {
          throw new Error("Bio phải là chuỗi");
        }
        updateFields[field] = fields[field].trim();
      } else if (field !== "image") {
        updateFields[field] = fields[field];
      }
    }

    updateFields.avatar = imageUrl;

    console.log(`Dữ liệu sẽ cập nhật: ${userId}`, updateFields);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ message: "Cập nhật người dùng thành công", user: updatedUser });
  } catch (error) {
    console.error(`Lỗi khi cập nhật người dùng ${req.user?.id}:`, error.message, { body: req.body, file: req.file });
    res.status(500).json({ message: "Lỗi server nội bộ", error: error.message });
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
    let updated = false;
    if (!user.following.includes(followId)) {
      user.following.push(followId);
      user.followingCount = user.following.length;
      await user.save();
      updated = true;
    }

    if (!followUser.followers.includes(userId)) {
      followUser.followers.push(userId);
      followUser.followerCount = followUser.followers.length;
      await followUser.save();
      updated = true;
    }
    // Gửi thông báo nếu đã cập nhật (tức là follow mới)
    if (updated) {
      const existingNotification = await Notification.findOne({
        senderId: userId,
        receiverId: followId,
        type: "follow",
        isRead: false,
      });

      if (!existingNotification) {
        const notification = new Notification({
          senderId: userId,
          receiverId: followId,
          type: "follow",
          message: `đã follow bạn`,
        });
        await notification.save();
        console.log(`Tạo thông báo follow: ${userId} -> ${followId}`);
      }
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
    const user = await User.findById(userId).populate("followers", "username avatar");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user.followers);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách follower:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

const searchUser = async (req, res) => {
  try {
    const { query, tag } = req.body;
    const response = {};

    // Chuẩn hóa query: loại bỏ khoảng trắng thừa, chuyển về chữ thường
    const normalizedQuery = query
      ? query
          .trim() // Loại bỏ khoảng trắng đầu/cuối
          .replace(/\s+/g, " ") // Thay nhiều khoảng trắng bằng 1 khoảng trắng
          .toLowerCase()
      : "";
    const normalizedTag = tag
      ? tag
          .trim()
          .replace(/\s+/g, " ")
          .toLowerCase()
      : "";

    // Nếu có tag, trả về danh sách bài viết có tag đó
    if (normalizedTag) {
      const posts = await Post.find({
        tags: normalizedTag, // Tag đã chuẩn hóa
      })
        .populate("userId", "username avatar usertype")
        .limit(20);
      return res.json({ posts });
    }

    // Nếu không có query, trả về kết quả rỗng
    if (!normalizedQuery) {
      return res.json({ users: [], tags: [], posts: [] });
    }

    // Tìm kiếm tất cả user (bao gồm cả normal và restaurant)
    const users = await User.find({
      username: { $regex: normalizedQuery.replace(/\s/g, ""), $options: "i" }, // Bỏ khoảng trắng trong username
    })
      .select("username avatar usertype")
      .limit(5);

    // Tìm kiếm tag liên quan và số lượng bài viết
    const tagQuery = normalizedQuery.startsWith("#")
      ? normalizedQuery.slice(1)
      : normalizedQuery;
    const postsWithTags = await Post.find({
      tags: { $in: [new RegExp(tagQuery.replace(/\s/g, ""), "i")] }, // Bỏ khoảng trắng trong tag
    });

    // Tạo danh sách tag kèm số lượng bài viết
    const tagCounts = {};
    postsWithTags.forEach((post) => {
      post.tags.forEach((t) => {
        const normalizedTag = t.toLowerCase();
        if (normalizedTag.includes(tagQuery.replace(/\s/g, ""))) {
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
        { content: { $regex: normalizedQuery.replace(/\s/g, ""), $options: "i" } }, // Bỏ khoảng trắng trong content
        { tags: { $in: [new RegExp(normalizedQuery.replace(/\s/g, ""), "i")] } }, // Bỏ khoảng trắng trong tag
      ],
    })
      // .populate("userId", "username avatar usertype")
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
// const searchUser = async (req, res) => {
//   try {
//     const { query, tag } = req.body;
//     const response = {};

//     const normalizedQuery = query
//       ? query
//           .trim()
//           .replace(/\s+/g, " ")
//           .toLowerCase()
//       : "";
//     const normalizedTag = tag
//       ? tag
//           .trim()
//           .replace(/\s+/g, " ")
//           .toLowerCase()
//       : "";

//     if (normalizedTag) {
//       // Sử dụng aggregation để loại bỏ trùng lặp và lấy tất cả bài post
//       const posts = await Post.aggregate([
//         { $match: { tags: normalizedTag } }, // Tìm bài post có tag
//         { $group: { _id: "$_id", doc: { $first: "$$ROOT" } } }, // Loại bỏ trùng lặp dựa trên _id
//         { $replaceRoot: { newRoot: "$doc" } }, // Khôi phục cấu trúc document
//         {
//           $lookup: {
//             from: "users", // Tên collection của User
//             localField: "userId",
//             foreignField: "_id",
//             as: "userId",
//           },
//         },
//         { $unwind: "$userId" }, // Giải nén mảng userId
//         {
//           $project: {
//             _id: 1,
//             content: 1,
//             tags: 1,
//             "userId._id": 1,
//             "userId.username": 1,
//             "userId.avatar": 1,
//             "userId.usertype": 1,
//           },
//         },
//       ]);
//       return res.json({ posts });
//     }

//     if (!normalizedQuery) {
//       return res.json({ users: [], tags: [], posts: [] });
//     }

//     const users = await User.find({
//       username: { $regex: normalizedQuery.replace(/\s/g, ""), $options: "i" },
//     })
//       .select("username avatar usertype")
//       .limit(5);

//     const tagQuery = normalizedQuery.startsWith("#")
//       ? normalizedQuery.slice(1)
//       : normalizedQuery;
//     const postsWithTags = await Post.find({
//       tags: { $in: [new RegExp(tagQuery.replace(/\s/g, ""), "i")] },
//     });

//     const tagCounts = {};
//     postsWithTags.forEach((post) => {
//       post.tags.forEach((t) => {
//         const normalizedTag = t.toLowerCase();
//         if (normalizedTag.includes(tagQuery.replace(/\s/g, ""))) {
//           tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
//         }
//       });
//     });

//     const tags = Object.entries(tagCounts)
//       .map(([tag, count]) => ({ tag: `#${tag}`, postCount: count }))
//       .sort((a, b) => b.postCount - a.postCount)
//       .slice(0, 5);

//     const posts = await Post.find({
//       $or: [
//         { content: { $regex: normalizedQuery.replace(/\s/g, ""), $options: "i" } },
//         { tags: { $in: [new RegExp(normalizedQuery.replace(/\s/g, ""), "i")] } },
//       ],
//     })
//       .populate("userId", "username avatar usertype")
//       .limit(5);

//     res.json({
//       users,
//       tags,
//       posts,
//     });
//   } catch (error) {
//     console.error("Error searching:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };
const getUserById = async(req,res) => {
  try{
    const user= await User.findById(req.params.userId)
    .select("-password")
    .populate("followers", "username avatar ")
    .populate("following", "username avatar")
    .populate('savedPosts', 'userId content images tags taggedUsers createdAt likes');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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
}
const getVouchers = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.find({ _id: userId }).populate('my_vouchers', 'name release_day expire_day img description code');

    if (!user) {
      return res.status(404).json({ message: 'No vouchers found for this ID' });
    }

    const vouchersRaw = user
      .map(v => v.my_vouchers)
      .flat()
      .filter(Boolean); // filter out nulls
    
      const vouchers = vouchersRaw.map(voucher => ({
        _id: voucher._id,
        name: voucher.name,
        release_day: voucher.release_day
                      ? new Date(voucher.release_day).toLocaleDateString("en-GB")
                      : null,
        expire_day: voucher.expire_day
                      ? new Date(voucher.expire_day).toLocaleDateString("en-GB")
                      : null,
        img: voucher.img,
        description: voucher.description,
        code: voucher.code
      }));


      res.status(200).json(vouchers);
  } catch (error) {
    console.error("Error fetching vouchers by user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const removeVoucherFromUser = async (req, res) => {
  try {
    const { userId, voucherId } = req.params;

    // Update user: pull voucherId from my_vouchers
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { my_vouchers: voucherId } },
      { new: true }
    ).populate('my_vouchers');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Voucher removed from user successfully',
      my_vouchers: user.my_vouchers,
    });
  } catch (error) {
    console.error('Error removing voucher from user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id; // Giả sử bạn có middleware để lấy userId từ token
    const user = await User.findById(userId)
      .select("following followers")
      .populate("following", "username _id usertype avatar")
      .populate("followers", "username _id usertype avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = [...new Set([...(user.following || []), ...(user.followers || [])])];
    res.status(200).json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ message: "Preferences must be an array" });
    }

    // Chuẩn hóa preferences
    const normalizedPreferences = preferences.map(tag => tag.toLowerCase().trim());

    await User.findByIdAndUpdate(userId, { preferences: normalizedPreferences }, { new: true });
    res.status(200).json({ message: "Preferences updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update preferences", error: error.message });
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
  getVouchers,
  removeVoucherFromUser,
  getFriends,
  updatePreferences,
};
