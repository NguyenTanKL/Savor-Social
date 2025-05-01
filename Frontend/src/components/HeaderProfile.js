import "./HeaderProfile.css";
import React, { useState, useEffect } from "react";
import {
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import UnfollowDialog from "./unfollowModal/unfollowModal";
import RemoveFollowerDialog from "./removeModal/RemoveFollowerDialog"; // Import modal mới
import { InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import { toggleFollow, removeFollower } from "../api/userApi";
import { updateUser } from "../redux/Reducer/userSlice";

function HeaderProfile({ user, userId,  onUserUpdate }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userStorage = useSelector((state) => state.user.user) || {};
  const [followingList, setFollowingList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const [openFollowing, setOpenFollowing] = useState(false);
  const [openFollower, setOpenFollower] = useState(false);
  const [openUnfollowDialog, setOpenUnfollowDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false); // State cho modal xóa follower
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  const SearchBar = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: "20px",
    padding: "5px 10px",
    marginBottom: "10px",
  }));

  const SearchInput = styled(InputBase)(({ theme }) => ({
    marginLeft: "10px",
    flex: 1,
  }));

  const filteredFollowing = followingList.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFollower = followerList.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
console.log("filteredFollower:",filteredFollower.length);
  const handleEditProfile = () => {
    navigate("/editProfile");
  };

  const handleFollowToggle = async () => {
    if (isFollowing) {
      setSelectedUser(user);
      setOpenUnfollowDialog(true);
    } else {
      const newStatus = await toggleFollow(user._id, isFollowing);
      setIsFollowing(!isFollowing);
      dispatch(updateUser(newStatus.user));
      if (onUserUpdate) {
        onUserUpdate();
      }
    }
  };

  // Hàm xử lý follow/unfollow cho user trong danh sách
  const handleFollowUserInList = async (targetUser) => {
    const isCurrentlyFollowing = targetUser.isFollowing; // Trạng thái follow hiện tại
    const newStatus = await toggleFollow(targetUser._id, isCurrentlyFollowing);
    dispatch(updateUser(newStatus.user))
    // Cập nhật danh sách follower/following
    if (openFollowing) {
      setFollowingList((prevList) =>
        prevList.map((u) =>
          u._id === targetUser._id ? { ...u, isFollowing: newStatus.isFollowing } : u
        )
      );
    } else if (openFollower) {
      setFollowerList((prevList) =>
        prevList.map((u) =>
          u._id === targetUser._id ? { ...u, isFollowing: newStatus.isFollowing } : u
        )
      );
    }
    if (onUserUpdate) {
      onUserUpdate();
    }
  };

  const handleShowFollowing = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token!");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/user/following/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Thêm trạng thái isFollowing cho từng user trong danh sách
      const followingWithStatus = await Promise.all(
        response.data.map(async (followedUser) => {
          const isFollowing = await checkFollow(followedUser._id);
          return { ...followedUser, isFollowing };
        })
      );

      setFollowingList(followingWithStatus);
      setOpenFollowing(true);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách following:", error);
    }
  };

  const handleShowFollower = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token!");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/user/follower/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Thêm trạng thái isFollowing cho từng user trong danh sách
      const followersWithStatus = await Promise.all(
        response.data.map(async (followerUser) => {
          const isFollowing = await checkFollow(followerUser._id);
          return { ...followerUser, isFollowing };
        })
      );

      setFollowerList(followersWithStatus);
      setOpenFollower(true);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách follower:", error);
    }
  };

  const checkFollow = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://localhost:5000/api/user/check-follow/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.isFollowing;
    } catch (error) {
      console.error("Lỗi khi kiểm tra follow:", error);
      return false;
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleUnfollowSuccess = (unfollowedUserId) => {
    setIsFollowing(false);
    setFollowingList((prevList) => prevList.filter((u) => u._id !== unfollowedUserId));
    if (onUserUpdate) {
      onUserUpdate();
    }
  };

  const handleRemoveFollowerSuccess = async (followerId) => {
    try {
      const result = await removeFollower(followerId);
      setFollowerList((prevList) => prevList.filter((u) => u._id !== followerId));
      dispatch(
        updateUser({
          ...userStorage,
          followers: result.followers,
          followerCount: result.followerCount,
        })
      );
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error) {
      console.error("Lỗi khi xóa follower:", error);
    }
  };

  const handleOpenUnfollowDialog = (user) => {
    setSelectedUser(user);
    setOpenUnfollowDialog(true);
  };

  const handleOpenRemoveDialog = (follower) => {
    setSelectedUser(follower);
    setOpenRemoveDialog(true);
  };

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (userId !== user._id) {
        const status = await checkFollow(userId);
        setIsFollowing(status);
      }
    };

    fetchFollowStatus();
  }, [userId, user._id]);

  // Xác định xem đây có phải là profile của user đang đăng nhập không
  const isOwnProfile = userId === userStorage._id;

  return (
    <div className="header__profile">
      <div className="header__left">
        <Avatar
          alt="Avatar"
          src={user.avatar}
          sx={{ width: 150, height: 152 }}
        />
      </div>
      <div className="header__right">
        <div className="header__1">
          <span>{user.username}</span>
          {isOwnProfile ? (
            <button onClick={handleEditProfile}>Edit Profile</button>
          ) : (
            <button
              onClick={handleFollowToggle}
              style={{
                backgroundColor: isFollowing ? "#e0e0e0" : "#0095f6",
                color: isFollowing ? "black" : "white",
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
        <div className="header__2">
          <div className="header2__content">
            <span>9 </span> posts
          </div>
          <div className="header2__content" onClick={handleShowFollower} style={{ cursor: "pointer" }}>
            <span>{user.followerCount} </span> followers
          </div>
          <div className="header2__content" onClick={handleShowFollowing} style={{ cursor: "pointer" }}>
            <span>{user.followingCount}</span> following
          </div>
        </div>
        <div className="header__3">
          <div className="header2__content">
            <span>{user.name}</span>
          </div>
          <div className="header3__content" style={{ cursor: "pointer" }}>
            <span>{user.address}</span>
          </div>
          <div className="header3__content" style={{ cursor: "pointer" }}>
            <span>{user.website}</span>
          </div>
        </div>
      </div>

      {/* Modal hiển thị danh sách following */}
      <Dialog open={openFollowing} onClose={() => setOpenFollowing(false)}>
        <DialogTitle>Following List</DialogTitle>
        <DialogContent>
          <SearchBar>
            <SearchIcon />
            <SearchInput
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
          </SearchBar>

          <List sx={{ width: "300px", padding: "10px" }}>
            {filteredFollowing.length > 0 ? (
              filteredFollowing.map((followedUser) => (
                <ListItem
                  key={followedUser._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar src={followedUser.avatar} sx={{ width: 40, height: 40, marginRight: 1 }} />
                    <ListItemText primary={followedUser.username} />
                  </div>
                  {isOwnProfile ? (
                    <Button
                      onClick={() => handleOpenUnfollowDialog(followedUser)}
                      sx={{
                        backgroundColor: "rgb(239, 239, 239)",
                        color: "black",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                        textTransform: "none",
                        borderRadius: "20px",
                        padding: "5px 15px",
                        "&:hover": { backgroundColor: "rgb(219, 219, 219)" },
                      }}
                    >
                      Following
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleFollowUserInList(followedUser)}
                      sx={{
                        backgroundColor: followedUser.isFollowing ? "#e0e0e0" : "#0095f6",
                        color: followedUser.isFollowing ? "black" : "white",
                        fontSize: "14px",
                        textTransform: "none",
                        borderRadius: "20px",
                        padding: "5px 15px",
                        "&:hover": {
                          backgroundColor: followedUser.isFollowing ? "rgb(219, 219, 219)" : "#007bff",
                        },
                      }}
                    >
                      {followedUser.isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </ListItem>
              ))
            ) : (
              <p style={{ textAlign: "center", padding: "10px" }}>Không tìm thấy kết quả.</p>
            )}
          </List>
        </DialogContent>
      </Dialog>

      {/* Modal hiển thị danh sách follower */}
      <Dialog open={openFollower} onClose={() => setOpenFollower(false)}>
        <DialogTitle>Follower List</DialogTitle>
        <DialogContent>
          <SearchBar>
            <SearchIcon />
            <SearchInput
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
          </SearchBar>

          <List sx={{ width: "300px", padding: "10px" }}>
            {filteredFollower.length > 0 ? (
              filteredFollower.map((followerUser) => (
                <ListItem
                  key={followerUser._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar src={followerUser.avatar} sx={{ width: 40, height: 40, marginRight: 1 }} />
                    <ListItemText primary={followerUser.username} />
                  </div>
                  {isOwnProfile ? (
                    <Button
                      onClick={() => handleOpenRemoveDialog(followerUser)}
                      sx={{
                        backgroundColor: "rgb(239, 239, 239)",
                        color: "black",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                        textTransform: "none",
                        borderRadius: "20px",
                        padding: "5px 15px",
                        "&:hover": { backgroundColor: "rgb(219, 219, 219)" },
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleFollowUserInList(followerUser)}
                      sx={{
                        backgroundColor: followerUser.isFollowing ? "#e0e0e0" : "#0095f6",
                        color: followerUser.isFollowing ? "black" : "white",
                        fontSize: "14px",
                        textTransform: "none",
                        borderRadius: "20px",
                        padding: "5px 15px",
                        "&:hover": {
                          backgroundColor: followerUser.isFollowing ? "rgb(219, 219, 219)" : "#007bff",
                        },
                      }}
                    >
                      {followerUser.isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </ListItem>
              ))
            ) : (
              <p style={{ textAlign: "center", padding: "10px" }}>Không tìm thấy kết quả.</p>
            )}
          </List>
        </DialogContent>
      </Dialog>

      {/* Unfollow Dialog */}
      <UnfollowDialog
        open={openUnfollowDialog}
        handleClose={() => setOpenUnfollowDialog(false)}
        user={selectedUser}
        onUnfollowSuccess={handleUnfollowSuccess}
      />

      {/* Remove Follower Dialog */}
      <RemoveFollowerDialog
        open={openRemoveDialog}
        handleClose={() => setOpenRemoveDialog(false)}
        follower={selectedUser}
        onRemoveSuccess={handleRemoveFollowerSuccess}
      />
    </div>
  );
}

export default HeaderProfile;