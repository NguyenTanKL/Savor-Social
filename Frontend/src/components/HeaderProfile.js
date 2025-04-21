import "./HeaderProfile.css";
import React, { useState, useEffect } from "react";
import { Avatar, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import UnfollowDialog from "./unfollowModal/unfollowModal";
import { InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import { toggleFollow } from "../api/userApi";
import { updateUser } from "../redux/Reducer/userSlice";
import { useDispatch} from "react-redux";
function HeaderProfile({ user, userId }) {
  const navigate = useNavigate();
  const userStorage = useSelector((state) => state.user.user) || {};
  const [followingList, setFollowingList] = useState([]); 
  const [followerList, setFollowerList]= useState([]);
  const [openFollowing, setOpenFollowing] = useState(false);
  const [openFollower, setOpenFollower] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);
  const dispatch = useDispatch();
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
  const handleEditProfile = () => {
    navigate("/editProfile");
  };
  const handleFollowToggle = async () => {

    if (isFollowing) {
    setSelectedUser(user);
    setOpenDialog(true);  // Mở UnfollowDialog
  } else {
    // Nếu chưa follow, thì gọi API follow
    const newStatus = await toggleFollow(user._id, isFollowing);
    console.log("new status:", newStatus);
    setIsFollowing(newStatus.isFollowing);
    dispatch(updateUser(newStatus.user));
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

      setFollowingList(response.data);
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
      console.log("Dữ liệu follower nhận được:", response.data); // 🐞 Debug dữ liệu API

      setFollowerList(response.data);
      setOpenFollower(true);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách following:", error);
    }
  };
  const checkFollow = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://localhost:5000/api/user/check-follow/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Trạng thái follow:", response.data.isFollowing);
      return response.data.isFollowing;
    } catch (error) {
      console.error("Lỗi khi kiểm tra follow:", error);
      return false; // Giả định chưa follow nếu có lỗi
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  // ✅ Cập nhật UI sau khi unfollow
  const handleUnfollowSuccess = (unfollowedUserId) => {
    setIsFollowing(false);
    setFollowingList((prevList) => prevList.filter((u) => u._id !== unfollowedUserId));
  };

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (userId !== user._id) { // Chỉ kiểm tra nếu không phải user đang đăng nhập
        const status = await checkFollow(userId);
        console.log("status:", status);
        setIsFollowing(status);
      }
    };
  
    fetchFollowStatus();
  }, [userId, user._id]);
  return (
    <div className="header__profile">
      <div className="header__left">
        <Avatar
          alt="Avatar"
          src="https://th.bing.com/th/id/OIP.9ccjBmE32LmJ02sy28_xwAHaK-?rs=1&pid=ImgDetMain"
          sx={{ width: 150, height: 152 }}
        />
      </div>
      <div className="header__right">
        <div className="header__1">
          <span>{user.username}</span>

                      {userId === userStorage._id ? (
              <button onClick={handleEditProfile}>Edit Profile</button>
            ) : (
              <button onClick={handleFollowToggle} 
                style={{
                  backgroundColor: isFollowing ? "#e0e0e0" : "#0095f6",
                  color: isFollowing ? "black" : "white",
                }}>
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
    {/* 🔍 Thanh tìm kiếm */}
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
            <Button
              onClick={() => handleOpenDialog(followedUser)}
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
          </ListItem>
        ))
      ) : (
        <p style={{ textAlign: "center", padding: "10px" }}>Không tìm thấy kết quả.</p>
      )}
    </List>
  </DialogContent>
</Dialog>
<Dialog open={openFollower} onClose={() => setOpenFollower(false)}>
  <DialogTitle>Follower</DialogTitle>
  <DialogContent>
    {/* 🔍 Thanh tìm kiếm */}
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
            <Button
              onClick={() => handleOpenDialog(followerUser)}
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
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        user={selectedUser}
        onUnfollowSuccess={handleUnfollowSuccess} // ✅ Truyền hàm cập nhật danh sách following
      />
    </div>
  );
}

export default HeaderProfile;
