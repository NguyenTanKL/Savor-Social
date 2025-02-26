import React from "react";
import "./Sugesstions.css";
import {Avatar} from "@mui/material"
function Sugesstions() {
    return (
        <div className="sugesstions">
            <div className="account__username">
                <div className="account__left">
                    <span className="avatar__profile">
                        <Avatar style={{ width: "50px", height: "50px" }}>R</Avatar>
                    </span>
                    <div className="username__info">
                        <span className="username__profile">_rin211</span>
                        <span className="profilename">Huy thai</span>
                    </div>
                </div>
                <button className="switch__button">
                    Switch
                </button>
            </div>
            <div className="sugesstions__title">
                Sugesstions for you
            </div>
            <div className="sugesstions__usernames">
                <div className="sugesstion__username">
                    <div className="username__left">
                        <span className="avatar">
                            <Avatar>R</Avatar>
                        </span>
                        <div className="username__info">
                            <span className="username">_huythai</span>
                            <span className="relation">New to Instagram</span>
                        </div>
                    </div>
                    <button className="follow__button">
                        Follow
                    </button>
                </div>
                <div className="sugesstion__username">
                    <div className="username__left">
                        <span className="avatar">
                            <Avatar>R</Avatar>
                        </span>
                        <div className="username__info">
                            <span className="username">_huythai</span>
                            <span className="relation">New to Instagram</span>
                        </div>
                    </div>
                    <button className="follow__button">
                        Follow
                    </button>
                </div>
                <div className="sugesstion__username">
                    <div className="username__left">
                        <span className="avatar">
                            <Avatar>R</Avatar>
                        </span>
                        <div className="username__info">
                            <span className="username">_huythai</span>
                            <span className="relation">New to Instagram</span>
                        </div>
                    </div>
                    <button className="follow__button">
                        Follow
                    </button>
                </div>
            </div>
        </div>
    )
}
export default Sugesstions;