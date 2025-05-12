import React, { useState } from "react";
import { BACKENDURL } from "../utils/const";
import "./Sidenav.css";
import { NavLink, useAsyncError, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/Reducer/userSlice";
import CreatePost from "../pages/createPost/CreatePage";
import NotificationDrawer from "../pages/NotificationDrawer";
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
  const user = useSelector((state) => state.user.user);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKENDURL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.clear();
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

  const handleCloseCreatePost = () => {
    setOpen(false);
  };
  const handleOpenNotification = () => {
    setOpenNotification(true);
  }
  const handleCloseNotification = () => {
    setOpenNotification(false);
  }
  // Debug onSearchClick và onCloseSearch
  const handleSearchClick = () => {
    console.log("Search button clicked, calling onSearchClick");
    onSearchClick();
  };

  const handleNavLinkClick = () => {
    console.log("NavLink clicked, calling onCloseSearch");
    onCloseSearch();
  };

  return (
    <div className="sidenav">
      <div className="sidenav__logo">
        <span>Savor Social</span>
      </div>
      <div className="sidenav__buttons">
        <NavLink to="/home" className="sidenav__button" onClick={handleNavLinkClick}>
          <HomeOutlined />
          <span>Home</span>
        </NavLink>
        <div className="sidenav__button" onClick={handleSearchClick}>
          <Search />
          <span>Search</span>
        </div>
        <NavLink to="/favouriteMap" className="sidenav__button" onClick={handleNavLinkClick}>
          <FmdGoodOutlined />
          <span>Favourite Map</span>
        </NavLink>
        <NavLink to="/savedPosts" className="sidenav__button" onClick={handleNavLinkClick}>
          <BookmarkBorderOutlined />
          <span>Saved Posts</span>
        </NavLink>
        <NavLink to="/vouchers" className="sidenav__button" onClick={handleNavLinkClick}>
          <LoyaltyOutlined />
          <span>Vouchers</span>
        </NavLink>
        <NavLink to="/messages" className="sidenav__button" onClick={handleNavLinkClick}>
          <ChatBubbleOutlineOutlined />
          <span>Messages</span>
        </NavLink>
        <div className="sidenav__button" onClick={handleOpenNotification}>
          <NotificationsNoneOutlined />
          <span>Notifications</span>
        </div>
        <div className="sidenav__button" onClick={handleOpenCreatePost}>
          <AddBoxOutlined />
          <span>Create</span>
        </div>
        <NavLink to={`/profile/${user._id}`} className="sidenav__button" onClick={handleNavLinkClick}>
          <Avatar alt="avatar" src = {user.avatar} />
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
      <NotificationDrawer open={openNotification} onClose={handleCloseNotification} />
    </div>
  );
}

export default Sidenav;