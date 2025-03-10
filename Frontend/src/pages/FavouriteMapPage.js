import "./FavouriteMapPage.css";
import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
import HeaderProfile from "../components/HeaderProfile";
import FavouriteMap from "../components/FavouriteMap";
function FavouriteMapPage() {
    
      const userData = {
        name: 'Hadilao.vn',
        job: 'Nhà hàng lẩu Hadilao',
        followers: 1234,
        following: 567,
        posts: 9,
        socialLinks: [
            { platform: 'Facebook', url: 'https://facebook.com/username' },
            { platform: 'Twitter', url: 'https://twitter.com/username' },
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
        ]
    };
    return(
        <div>
        <HeaderProfile user={userData}/>
        <hr/>
        <FavouriteMap/>
        
    </div>
    )
}
export default FavouriteMapPage