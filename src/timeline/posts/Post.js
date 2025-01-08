import React from "react";
import {Avatar} from "@mui/material";
import "./Post.css";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TelegramIcon from "@mui/icons-material/Telegram";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
function Post( {user, postImage, likes, caption, address, timestamp }) {
    return(
        <div className="post">
            <div className="post__header">
                <div className="post__headerAuthor">
                    <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
                    {user}  <span> • {timestamp}</span>
                </div>
                <MoreHorizIcon/>
            </div>
            <div className="post__address">
            <FmdGoodOutlinedIcon className="postIcon" color="action" /> 
            <span>{address}</span>
            </div>
            <div className="post__image">
                <img src={postImage} alt=""></img>
            </div>
            <div className="post__footer ">
                <div className="post_footerIcons">
                    <div className="post__iconsMain">
                        <FavoriteBorderIcon className="postIcon"/>
                        <ChatBubbleOutlineIcon className="postIcon"/>
                        <TelegramIcon className="postIcon"/>
                    </div>
                    <div className="post_iconSave">
                        <MapOutlinedIcon className="postIcon" />    
                        <FmdGoodOutlinedIcon className="postIcon" />
                        <BookmarkBorderIcon className="postIcon" />
                    </div>
                </div>
            <span className="post_likes">{likes} likes</span> 
            <br/>
            <div className="post__caption">
                <span>{user} </span> {caption}
            </div>
            <div className="post__comment">
                <span>View all 13,384 comments</span>
                <div className="comment">
                    <input placeholder="Add a comment…"  />
                    <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled"/>
                </div>
            </div>
            
            </div>
        </div>
    )
}
export default Post