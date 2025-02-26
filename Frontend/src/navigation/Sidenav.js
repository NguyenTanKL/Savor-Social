import React from "react";
import "./Sidenav.css";
import { NavLink } from "react-router-dom";
import { NavNavLink } from "react-router-dom";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import LoyaltyOutlinedIcon from '@mui/icons-material/LoyaltyOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { Avatar } from "@mui/material";

function Sidenav() {
    return (
        <div className="sidenav">
            <div className="sidenav__logo">
                <span>Savor Social</span>
            </div>
            <div className="sidenav__buttons">
                <NavLink to="/HomePage" className="sidenav__button">
                    <HomeOutlinedIcon />
                    <span>Home</span>
                </NavLink>
                
                <NavLink to="/SearchPage" className="sidenav__button">
                    <SearchIcon />
                    <span>Search</span>
                </NavLink>
                <NavLink to="/FavouriteMapPage" className="sidenav__button">
                    <FmdGoodOutlinedIcon />
                    <span>Favourite Map</span>
                </NavLink>
                <NavLink to="/SavedPostsPage" className="sidenav__button">
                    <BookmarkBorderOutlinedIcon />
                    <span>Saved Posts</span>
                </NavLink>
                <NavLink to="/VouchersPage" className="sidenav__button">
                    <LoyaltyOutlinedIcon />
                    <span>Vouchers</span>
                </NavLink>
                <NavLink to="/MessagesPage" className="sidenav__button">
                    <ChatBubbleOutlineOutlinedIcon />
                    <span>Messages</span>
                </NavLink>
                <NavLink to="/NotificationsPage" className="sidenav__button">
                    <NotificationsNoneOutlinedIcon />
                    <span>Notifications</span>
                </NavLink>
                <NavLink to="/CreatePage" className="sidenav__button">
                    <AddBoxOutlinedIcon />
                    <span>Create</span>
                </NavLink>
                <NavLink to="/ProfilePage" className="sidenav__button">
                    <Avatar />
                    <span>Profile</span>
                </NavLink>
            </div>
            <div className="sidenav__more">
                <NavLink to="/MoreDropdownMenu" className="sidenav__button">
                    <MenuOutlinedIcon />
                    <span>More</span>
                </NavLink>
            </div>
        </div>
    );
}

export default Sidenav;
