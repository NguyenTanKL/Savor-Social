import React from "react";
import "./Modal.css";
import { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Grid2 from "@mui/material/Grid2";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Menu from '@mui/material/Menu';
import IconButton from "@mui/material/IconButton";
import MenuItem from '@mui/material/MenuItem';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TelegramIcon from "@mui/icons-material/Telegram";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import Rating from "@mui/material/Rating"
import SendIcon from "@mui/icons-material/Send";

function ModalPost( {open, onClose, user, postImage, likes, caption, address, timestamp} ){

    const [newComment, setNewComment] = useState(""); // Input for new comment
    const [comments, setComments] = useState([
        { id: 1, user: "john_doe", text: "Wow! This place looks amazing!" },
        { id: 2, user: "emma_watson", text: "I love the vibes here!" },
        { id: 3, user: "tony_stark", text: "I need to visit this place soon!" }
    ]);

    const handleAddComment = () => {
        if (newComment.trim() === "") return; // Prevent empty comments
        const newCommentObj = { id: comments.length + 1, user: "your_username", text: newComment };
        setComments([...comments, newCommentObj]); // Add new comment to list
        setNewComment(""); // Clear input
    };

    const customBackdrop = {
        backdrop: {
            style: { backgroundColor: 'rgba(0, 0, 0, 0.1)' }
        },
    };
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
      const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    return(
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                closeAfterTransition
                onClose={onClose}
                slots={{ backdrop: Backdrop }}
                slotProps={
                    customBackdrop
                }
            >
                <Fade in={open}>
                <Box sx={style}>
                <Grid2 container spacing={1}>
                    <Grid2 size={7}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="500"
                            width="500"
                            image={postImage}
                            onClick={onClose}
                        />
                        </Card>
                    </Grid2>
                    <Grid2 size={5}>
                        <div className="post__header">
                            <div className="post__headerAuthor">
                                <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
                                {user} <span> • {timestamp}</span>
                            </div>
                            <MoreHorizIcon onClick={handleMenuClick}/>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleMenuClose}>Report</MenuItem>
                                <MenuItem onClick={handleMenuClose}>Option 2</MenuItem>
                                <MenuItem onClick={handleMenuClose}>Option 3</MenuItem>
                            </Menu>
                        </div>
                        <div className="post__address">
                            <FmdGoodOutlinedIcon className="postIcon" color="action" /> 
                            <span>{address}</span>
                        </div>
                        <div className="post__footer ">
                            <div className="post__caption">
                                <span>{user} </span> {caption}
                            </div>
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
                            <Rating
                                precision={0.5}
                            />
                            {/* <div className="comment">
                                <input placeholder="Add a comment…"  />
                                <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled"/>
                            </div> */}
                            <div className="post__comments">
                                <h4>Comments:</h4>
                                <div className="comments-list">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="comment-item">
                                            <strong>{comment.user}</strong>: {comment.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="comment">
                                <input
                                    placeholder="Add a comment…"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                                />
                                <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled" />
                                <IconButton color="primary">
                                    <SendIcon onClick={handleAddComment}/>
                                </IconButton>
                            </div>
                        </div>
                    </Grid2>
                </Grid2>
                </Box>
                </Fade>
            </Modal>
        </div> 
    )
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    bgcolor: 'background.paper',
    p: 1
};

export default ModalPost