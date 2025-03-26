import React, { useState , useEffect} from "react";
import {Avatar, Button} from "@mui/material";
import { useState, useEffect } from "react";
import "./Post.css";
import Typography from "@mui/material/Typography";
import Card from '@mui/material/Card';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite"; 
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TelegramIcon from "@mui/icons-material/Telegram";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import axios from "axios";
import Grid from "@mui/material/Grid";
import Modal from "../../components/Modal";

function Post( {user,postID, postImage, likes, caption, address, timestamp, is_voucher, is_ad}) {
    const [open, setOpen] = React.useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [userData, setUserData] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(likes.count);
    useEffect(() => {
        console.log("User ID:", user);
        if (user) {
            axios.get(`http://localhost:5000/api/userRoutes/${user}`)
                .then(res => {
                    console.log("Dữ liệu user nhận được:", res.data);
                    setUserData(res.data);
                })
                .catch(err => {
                    console.error("Lỗi khi lấy dữ liệu user:", err);
                    console.log("Lỗi chi tiết:", err.response?.data);
                });
        }
    }, [user]);
    useEffect(() => {
        // Kiểm tra nếu user đã like post
        if (likes.users.includes(user)) {
            setLiked(true);
        }
    }, [likes, user]);

    const handleLike = async () => {
        try {
            const newLikedStatus = !liked;
            setLiked(newLikedStatus);
            setLikeCount(prev => newLikedStatus ? prev + 1 : prev - 1);

            // Gửi request cập nhật danh sách like
            await axios.post(`http://localhost:5000/api/${postID}/like`, 
                { userId: user }, 
                { headers: { "Content-Type": "application/json" } }
            );
            
        } catch (err) {
            console.error("Lỗi khi like post:", err);
        }
    };

    // useEffect(() => {
    //     // Kiểm tra xem bài post đã được lưu chưa
    //     axios.get(`http://localhost:5000/api/user/${currentUser}/savedPosts`)
    //         .then(res => {
    //             if (res.data.savedPosts.includes(Post.postId)) {
    //                 setIsSaved(true);
    //             }
    //         })
    //         .catch(err => console.error(err));
    // }, [currentUser, Post.postId]);

    // const handleSavePost = async () => {
    //     try {
    //         const response = await axios.post("http://localhost:5000/api/user/savePost", {
    //             userId: currentUser,
    //             postId: postId,
    //         });
    //         setIsSaved(response.data.saved);
    //     } catch (error) {
    //         console.error("Lỗi khi lưu bài viết", error);
    //     }
    // };
    //  console.log("User data:", user);
    //  console.log("User data img:", user.avatar);
    if (is_voucher && is_ad) {
        return(
            <div className="post">
                <div className="post__header">
                    <div className="post__headerAuthor">
                    <Avatar src={userData?.avatar}>?</Avatar>
                        {user}  <span> • {timestamp}  • Advertisement</span>
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
                <div>
                    <Card elevation={3} style={{ maxWidth: 600, margin: 'auto' }}>
                        <Grid container>
                            {/* Left Section */}
                            <Grid
                            item
                            xs={8}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                padding: '16px',
                            }}
                            >
                            <Typography
                                variant="h4"
                                style={{
                                fontFamily: 'Rochester, Arial, sans-serif',
                                fontWeight: 500,
                                marginBottom: 8,
                                }}
                                className="rochester"
                            >
                                Voucher
                            </Typography>
                            <Typography variant="body1">Giảm 50% với tất cả món gà</Typography>
                            <Typography variant="body2">Ngày hết hạn: <span style={{fontWeight: "bold"}}>31/01/2025</span></Typography>
                            <Typography variant="body2">Số lượng còn: <span style={{fontWeight: "bold"}}>36</span></Typography>
                            </Grid>

                            {/* Right Section */}
                            <Grid
                            item
                            xs={4}
                            style={{
                                backgroundColor: '#2196F3', // Blue background
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            >
                            <Button
                                variant="text"
                                style={{
                                backgroundColor: '#2196F3',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                }}
                            >
                                Nhận
                            </Button>
                            </Grid>
                        </Grid>
                    </Card>
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
                            {/* <div onClick={handleSavePost}>
                            {isSaved ? (
                                <BookmarkIcon className="postIcon" color="primary" />
                            ) : (
                                <BookmarkBorderIcon className="postIcon" />
                            )}
                            </div> */}
                        </div>
                    </div>
                <span className="post_likes">{likes.count} likes</span> 
                <br/>
                <div className="post__caption">
                    <span>{user} </span> {caption}
                </div>
                <div className="post__comment">
                    <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                    {open && <Modal 
                        open={open} 
                        onClose={() => setOpen(false)}
                        user= {user}
                        postImage={postImage} 
                        likes={likes} 
                        caption={caption}
                        address={address}
                        timestamp={timestamp}
                    />}
                    <div className="comment">
                        <input placeholder="Add a comment…"  />
                        <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled"/>
                    </div>
                </div>
                
                </div>
            </div>
        )
    } else if (is_voucher && !is_ad) {
        return(
            <div className="post">
                <div className="post__header">
                    <div className="post__headerAuthor">
                    <Avatar src={userData?.avatar}>?</Avatar>
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
                <div>
                    <Card elevation={3} style={{ maxWidth: 600, margin: 'auto', minHeight: "80px"}}>
                        <Grid container>
                            {/* Left Section */}
                            <Grid
                            item
                            xs={8}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                padding: '16px',
                            }}
                            >
                            <Typography
                                variant="h4"
                                style={{
                                fontFamily: 'Rochester, Arial, sans-serif',
                                fontWeight: 500,
                                marginBottom: 8,
                                }}
                                className="rochester"
                            >
                                Voucher
                            </Typography>
                            <Typography variant="body1">Giảm 50% với tất cả món gà</Typography>
                            <Typography variant="body2">Ngày hết hạn: <span style={{fontWeight: "bold"}}>31/01/2025</span></Typography>
                            <Typography variant="body2">Số lượng còn: <span style={{fontWeight: "bold"}}>36</span></Typography>
                            </Grid>

                            {/* Right Section */}
                            <Grid
                            item
                            xs={4}
                            style={{
                                backgroundColor: '#2196F3', // Blue background
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            >
                            <Button
                                variant="text"
                                style={{
                                backgroundColor: '#2196F3',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                width: "100%",
                                height: "100%"
                                }}
                            >
                                Nhận
                            </Button>
                            </Grid>
                        </Grid>
                    </Card>
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
                <span className="post_likes">{likes.count} likes</span> 
                <br/>
                <div className="post__caption">
                    <span>{user} </span> {caption}
                </div>
                <div className="post__comment">
                    <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                    {open && <Modal 
                        open={open} 
                        onClose={() => setOpen(false)}
                        user= {user}
                        postImage={postImage} 
                        likes={likes} 
                        caption={caption}
                        address={address}
                        timestamp={timestamp}
                    />}
                    <div className="comment">
                        <input placeholder="Add a comment…"  />
                        <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled"/>
                    </div>
                </div>
                
                </div>
            </div>
        )
    } else if (!is_voucher && is_ad) {
        return(
            <div className="post">
                <div className="post__header">
                    <div className="post__headerAuthor">
                    <Avatar src={userData?.avatar}>?</Avatar>
                        {user}  <span> • {timestamp} • Advertisement</span>
                        <br></br>
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
                <span className="post_likes">{likes.count} likes</span> 
                <br/>
                <div className="post__caption">
                    <span>{user} </span> {caption}
                </div>
                <div className="post__comment">
                    <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                    {open && <Modal 
                        open={open} 
                        onClose={() => setOpen(false)}
                        user= {user}
                        postImage={postImage} 
                        likes={likes} 
                        caption={caption}
                        address={address}
                        timestamp={timestamp}
                    />}
                    <div className="comment">
                        <input placeholder="Add a comment…"  />
                        <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled"/>
                    </div>
                </div>
                
                </div>
            </div>
        )
    } else {
        return(
            <div className="post">
                <div className="post__header">
                    <div className="post__headerAuthor">
                    <Avatar src={userData?.avatar}>?</Avatar>
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
                            {liked ? (
                            <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
                        ) : (
                            <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
                        )}
                            <ChatBubbleOutlineIcon className="postIcon"/>
                            <TelegramIcon className="postIcon"/>
                        </div>
                        <div className="post_iconSave">
                            <MapOutlinedIcon className="postIcon" />    
                            <FmdGoodOutlinedIcon className="postIcon" />
                            <BookmarkBorderIcon className="postIcon" />
                        </div>
                    </div>
                <span className="post_likes">{likes.count} likes</span> 
                <br/>
                <div className="post__caption">
                    <span>{user} </span> {caption}
                </div>
                <div className="post__comment">
                    <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                    {open && <Modal 
                        open={open} 
                        onClose={() => setOpen(false)}
                        user= {user}
                        postImage={postImage} 
                        likes={likes} 
                        caption={caption}
                        address={address}
                        timestamp={timestamp}
                    />}
                    <div className="comment">
                        <input placeholder="Add a comment…"  />
                        <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled"/>
                    </div>
                </div>
                
                </div>
            </div>
        )
    }
}
export default Post



