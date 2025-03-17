import React, { useState, useEffect } from "react";
import "./AccountUser.css";
import { Avatar } from "@mui/material";

function AccountUser({ username, nickname, onFollow, isFollowed }) {
    const [isFollowing, setIsFollowing] = useState(isFollowed);

    useEffect(() => {
        setIsFollowing(isFollowed); // Đồng bộ state khi prop thay đổi
    }, [isFollowed]);

    const handleFollowClick = async () => {
        const success = await onFollow(); // Gọi API Follow/Unfollow
        if (success) {
            setIsFollowing((prev) => !prev); // ✅ Toggle UI ngay lập tức
        }
    };

    return (
        <div className="sugesstion__username">
            <div className="username__left">
                <span className="avatar">
                    <Avatar>{username?.charAt(0).toUpperCase()}</Avatar>
                </span>
                <div className="username__info">
                    <span className="username">{username}</span>
                    <span className="nickname">{nickname}</span>
                </div>
            </div>

            <button
                className={`button__follow ${isFollowing ? "following" : ""}`}
                onClick={handleFollowClick}
            >
                {isFollowing ? "Unfollow" : "Follow"}
            </button>
        </div>
    );
}

export default AccountUser;
