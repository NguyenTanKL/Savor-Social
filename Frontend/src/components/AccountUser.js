import React, { useState, useEffect } from "react";
import "./AccountUser.css";
import { Avatar } from "@mui/material";
import { Link } from 'react-router-dom';
import { FRONTENDURL } from "../utils/const";
function AccountUser({ username, avatar, userId, onFollow, isFollowed }) {
    const [isFollowing, setIsFollowing] = useState(isFollowed);

    useEffect(() => {
        setIsFollowing(isFollowed); // Đồng bộ state khi prop thay đổi
    }, [isFollowed]);

    const handleFollowClick = async (e) => {
        e.preventDefault();
        const success = await onFollow(); // Gọi API Follow/Unfollow
        if (success) {
            setIsFollowing((prev) => !prev); // ✅ Toggle UI ngay lập tức
        }
    };

    return (
        <Link className="sugesstion__username" to={`${FRONTENDURL}/profile/${userId}`}>
            <div className="username__left">
                <span className="avatar">
                    <Avatar alt={username} src = {avatar}/>
                </span>
                <div className="username__info">
                    <span className="username">{username}</span>
                </div>
            </div>

            <button
                className={`button__follow ${isFollowing ? "following" : ""}`}
                onClick={handleFollowClick}
            >
                {isFollowing ? "Unfollow" : "Follow"}
            </button>
        </Link>
    );
}

export default AccountUser;
