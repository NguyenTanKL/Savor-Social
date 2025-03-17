import React, { useState , useEffect} from "react";
import {Avatar} from "@mui/material";
import "./Post.css";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TelegramIcon from "@mui/icons-material/Telegram";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import axios from "axios";
function Post( {user,postId, postImage, likes, caption, address, timestamp }) {
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Kiểm tra xem bài post đã được lưu chưa
        axios.get(`http://localhost:5000/api/user/${currentUser}/savedPosts`)
            .then(res => {
                if (res.data.savedPosts.includes(postId)) {
                    setIsSaved(true);
                }
            })
            .catch(err => console.error(err));
    }, [currentUser, postId]);

    const handleSavePost = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/user/savePost", {
                userId: currentUser,
                postId: postId,
            });
            setIsSaved(response.data.saved);
        } catch (error) {
            console.error("Lỗi khi lưu bài viết", error);
        }
    };
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
                        <div onClick={handleSavePost}>
                            {isSaved ? (
                                <BookmarkIcon className="postIcon" color="primary" />
                            ) : (
                                <BookmarkBorderIcon className="postIcon" />
                            )}
                        </div>
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