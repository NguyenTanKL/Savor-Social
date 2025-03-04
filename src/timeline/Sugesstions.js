import React from "react";
import "./Sugesstions.css";
import AccountUser from "../components/AccountUser";
import { Avatar } from "@mui/material";

function Sugesstions() {
    // Dữ liệu danh sách gợi ý
    const suggestions = [
        { username: "john_doe",nickname: "New User" },
        { username: "jane_smith", nickname: "Friend" },
        { username: "peter_pan", nickname: "Followed by others" },
    ];

    // Hàm xử lý khi nhấn nút Switch
    const handleSwitch = () => {
        console.log("Switch to another account");
    };

    return (
        <div className="sugesstions">
            <div className="account__username">
                <div className="account__left">
                    <span className="avatar__profile">
                        <Avatar style={{ width: "60px", height: "60px" }}>R</Avatar>
                    </span>
                    <div className="username__info">
                        <span className="username__profile">_rin211</span>
                        <span className="profilename">Huy thai</span>
                    </div>
                </div>
                <button className="switch__button" onClick={handleSwitch}>
                    Switch
                </button>
            </div>
            <div className="sugesstions__title">
                Sugesstions for you
            </div>
            <div className="sugesstions__usernames">
                {suggestions.map((user, index) => (
                    <AccountUser
                        key={index}
                        username={user.username}
                        nickname={user.nickname}
                    />
                ))}
            </div>
        </div>
    );
}

export default Sugesstions;
