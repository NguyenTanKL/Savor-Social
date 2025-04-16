import React, { useState } from "react";
import "./Sidenav.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/Reducer/userSlice";
import { useSelector } from "react-redux";
import CreatePost from "../pages/createPost/CreatePage";
import {
  HomeOutlined,
  Search,
  FmdGoodOutlined,
  BookmarkBorderOutlined,
  LoyaltyOutlined,
  ChatBubbleOutlineOutlined,
  NotificationsNoneOutlined,
  AddBoxOutlined,
  MenuOutlined,
  Logout,
} from "@mui/icons-material";
import { Avatar, Box, Button, Popover, MenuItem, Typography } from "@mui/material";
import axios from "axios";

function Sidenav({ onSearchClick, onCloseSearch }) {
  const userId = useSelector((state) => state.user.user);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open,setOpen] = useState(false);
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      // Xóa toàn bộ localStorage
      localStorage.clear(); // Thay vì chỉ xóa token
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      alert("Lỗi khi đăng xuất!");
    }
    handleCloseMenu();
  };
  const handleOpenCreatePost = () => {
    setOpen(true);
  };

  // Hàm đóng dialog CreatePost
  const handleCloseCreatePost = () => {
    setOpen(false);
  };
  return (
    <div className="sidenav">
      <div className="sidenav__logo">
        <span>Savor Social</span>
      </div>
      <div className="sidenav__buttons">
        <NavLink to="/home" className="sidenav__button" onClick={onCloseSearch}>
          <HomeOutlined />
          <span>Home</span>
        </NavLink>
        <div className="sidenav__button" onClick={onSearchClick}>
          <Search />
          <span>Search</span>
        </div>
        <NavLink to="/favouriteMap" className="sidenav__button" onClick={onCloseSearch}>
          <FmdGoodOutlined />
          <span>Favourite Map</span>
        </NavLink>
        <NavLink to="/savedPosts" className="sidenav__button" onClick={onCloseSearch}>
          <BookmarkBorderOutlined />
          <span>Saved Posts</span>
        </NavLink>
        <NavLink to="/vouchers" className="sidenav__button" onClick={onCloseSearch}>
          <LoyaltyOutlined />
          <span>Vouchers</span>
        </NavLink>
        <NavLink to="/messages" className="sidenav__button" onClick={onCloseSearch}>
          <ChatBubbleOutlineOutlined />
          <span>Messages</span>
        </NavLink>
        <NavLink to="/notifications" className="sidenav__button" onClick={onCloseSearch}>
          <NotificationsNoneOutlined />
          <span>Notifications</span>
        </NavLink>
        <div className="sidenav__button" onClick={handleOpenCreatePost}>
          <AddBoxOutlined />
          <span>Create</span>
        </div>
        <NavLink to= {`/profile/${userId._id}`} className="sidenav__button" onClick={onCloseSearch}>
          <Avatar />
          <span>Profile</span>
        </NavLink>
      </div>
      <div className="sidenav__more">
        <Button className="sidenav__button" onClick={handleOpenMenu}>
          <MenuOutlined />
          <span>More</span>
        </Button>
      </div>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Box sx={{ p: 1, minWidth: 150 }}>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Log out
          </MenuItem>
        </Box>
      </Popover>
      <CreatePost open={open} onClose={handleCloseCreatePost} />
    </div>
  );
}

export default Sidenav;
