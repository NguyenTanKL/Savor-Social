import "./HeaderProfile.css";
import React from "react";
import {Avatar, Link} from "@mui/material"
function HeaderProfile({user}){
    return(
        <div className="header__profile">
            <div className="header__left">
                <Avatar 
                    alt="Avatar"
                    src="https://th.bing.com/th/id/OIP.9ccjBmE32LmJ02sy28_xwAHaK-?rs=1&pid=ImgDetMain"
                    sx={{width: 150, height:152}}  
                />
            </div>
            <div className="header__right">
                <div className="header__1">
                    <span>{user.name}</span>
                    <button>
                        <span>Edit Profile</span>
                    </button>
                </div>
                <div className="header__2"> 
                    <div className="header2__content">
                        <span>9 </span> posts
                    </div>
                    <div className="header2__content">
                       <span>13.6K</span> followers
                    </div>
                    <div className="header2__content">
                        <span>1256 </span>following
                    </div>
                </div>
                <div className="header__3">
                    <span>Huy Thai</span>
                    <span className="header3__job">Food reviewer</span>
                    <span>If you want to watch my clips 🎦 in your language 🌎 </span>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">https://www.instagram.com/</a>
                </div>
            </div>
        </div>
    )
}
export default HeaderProfile