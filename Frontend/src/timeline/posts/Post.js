import React, { useState, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
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
import RoomIcon from "@mui/icons-material/Room"; // Icon đậm

function Post({ user, postID, images = [], likes, caption, address, timestamp, is_voucher, is_ad, isSelected, onSelect, ad_id, voucher_id }) {
    const [open, setOpen] = React.useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [userData, setUserData] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(likes.count);
    const [voucherData, setVoucherData] = useState(null);
    const [current, setCurrent] = React.useState(0);
    const nextImage = () => setCurrent((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
    useEffect(() => {
        // console.log("Dữ liệu voucher từ API:");
        if (is_voucher) {
            axios.get(`http://localhost:5000/api/vouchers/voucher_detail/${voucher_id}`)
                .then(res => {
                    console.log("Dữ liệu voucher từ API:", res.data); // In ra console
                    setVoucherData(res.data); // Lưu vào state
                })
                .catch(err => console.error("Lỗi khi lấy thông tin voucher:", err));
        }
    }, [is_voucher, voucher_id]);

    useEffect(() => {
        console.log("User ID cua bai post:", user);
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


    const userFromStorage = localStorage.getItem("user");
    let user_
    let userId_
    if (userFromStorage) {
        user_ = JSON.parse(userFromStorage); // Chuyển từ JSON string thành object
        userId_ = user_._id; // Lấy id từ object
        console.log("User ID:", userId_);
    } else {
        console.log("Không tìm thấy user trong localStorage");
    }
    useEffect(() => {
        // Kiểm tra nếu user đã like post

        if (likes && likes.users && likes.users.includes(userId_)) {
            setLiked(true);
        }


    }, [likes, user, userId_]);
    const handleLike = async () => {
        try {
            const newLikedStatus = !liked;
            setLiked(newLikedStatus);
            setLikeCount(prev => newLikedStatus ? prev + 1 : prev - 1);

            // Gửi request cập nhật danh sách like
            await axios.post(`http://localhost:5000/api/${postID}/like`,
                { userId: userId_ },
                { headers: { "Content-Type": "application/json" } }
            );
            console.log("kiem tra xem user la gi:", user)
            console.log("kiem tra xem userId_ la gi:", userId_)
            if (userId_ !== user) {
                await axios.post("http://localhost:5000/api/notifications/create", {
                    senderId: userId_,
                    receiverId: user,
                    type: "like",
                    postId: postID,
                    createdAt: new Date()
                });
                console.log("thong bao thanh cong")
            }

        } catch (err) {
            console.error("Lỗi khi like post:", err);
        }
    };

    useEffect(() => {
        // Kiểm tra xem bài post đã được lưu chưa
        axios.get(`http://localhost:5000/api/user/${userId_}/savedPosts`)
            .then(res => {
                if (res.data.savedPosts.includes(postID)) {
                    setIsSaved(true);
                }
            })
            .catch(err => console.error(err));
    }, [userId_, postID]);

    const handleSavePost = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/user/${userId_}/savePost/${postID}`, {
                userId: userId_,
                postId: postID,
            });
            if (isSaved) {
                setIsSaved(false);
            }
            else { setIsSaved(true) }

        } catch (error) {
            console.error("Lỗi khi lưu bài viết", error);
        }
    };
    //  console.log("User data:", user);
    //  console.log("User data img:", user.avatar);
    if (is_voucher && is_ad) {
        return (
            <div className="post">
                <div className="post__header">
                    <div className="post__headerAuthor">
                        <Avatar src={userData?.avatar}>?</Avatar>
                        {user}  <span> • {timestamp}  • Advertisement</span>
                    </div>
                    <MoreHorizIcon />
                </div>
                <div className="post__address">
                    <FmdGoodOutlinedIcon className="postIcon" color="action" />
                    <span>{address}</span>
                </div>
                {/* <div className="post__image">
                    <img src={postImage} alt=""></img>
                </div> */}
                <div className="post__image" style={{ position: "relative" }}>
                    <img
                        src={images[current]}
                        alt={`post-img-${current}`}
                        style={{ width: "100%", borderRadius: "10px" }}
                    />
                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="nav-button left">◀</button>
                            <button onClick={nextImage} className="nav-button right">▶</button>
                        </>
                    )}
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
                                <Typography variant="body1">{voucherData?.description}</Typography>
                                <Typography variant="body2">Ngày hết hạn: <span style={{ fontWeight: "bold" }}>{new Date(voucherData?.expire_day).toLocaleDateString()}</span></Typography>
                                <Typography variant="body2">Số lượng còn: <span style={{ fontWeight: "bold" }}>{voucherData?.quantity}</span></Typography>
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
                            {liked ? (
                                <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
                            ) : (
                                <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
                            )}
                            <ChatBubbleOutlineIcon className="postIcon" />
                            <TelegramIcon className="postIcon" />
                        </div>
                        <div className="post_iconSave">
                            <MapOutlinedIcon className="postIcon" />
                            {isSelected ? (
                                <RoomIcon className="postIcon selected" onClick={onSelect} color="error" />
                            ) : (
                                <FmdGoodOutlinedIcon className="postIcon" onClick={onSelect} />
                            )}
                            {/* <BookmarkBorderIcon className="postIcon" /> */}

                            {isSaved ? (
                                <BookmarkIcon className="postIcon" onClick={handleSavePost} color="primary" />
                            ) : (
                                <BookmarkBorderIcon className="postIcon" onClick={handleSavePost} />
                            )}

                        </div>
                    </div>
                    <span className="post_likes">{likeCount} likes</span>
                    <br />
                    <div className="post__caption">
                        <span>{user} </span> {caption}
                    </div>
                    <div className="post__comment">
                        <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                        {open && <Modal
                            open={open}
                            onClose={() => setOpen(false)}
                            user={user}
                            postImage={images[0]}
                            likes={likes}
                            caption={caption}
                            address={address}
                            timestamp={timestamp}
                        />}
                        <div className="comment">
                            <input placeholder="Add a comment…" />
                            <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled" />
                        </div>
                    </div>

                </div>
            </div>
        )
    } else if (is_voucher && !is_ad) {
        return (
            <div className="post">
                <div className="post__header">
                    <div className="post__headerAuthor">
                        <Avatar src={userData?.avatar}>?</Avatar>
                        {user}  <span> • {timestamp}</span>
                    </div>
                    <MoreHorizIcon />
                </div>
                <div className="post__address">
                    <FmdGoodOutlinedIcon className="postIcon" color="action" />
                    <span>{address}</span>
                </div>
                {/* <div className="post__image">
                    <img src={postImage} alt=""></img>
                </div> */}
                <div className="post__image" style={{ position: "relative" }}>
                    <img
                        src={images[current]}
                        alt={`post-img-${current}`}
                        style={{ width: "100%", borderRadius: "10px" }}
                    />
                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="nav-button left">◀</button>
                            <button onClick={nextImage} className="nav-button right">▶</button>
                        </>
                    )}
                </div>
                <div>
                    <Card elevation={3} style={{ maxWidth: 600, margin: 'auto', minHeight: "80px" }}>
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
                                <Typography variant="body1">{voucherData?.description}</Typography>
                                <Typography variant="body2">Ngày hết hạn: <span style={{ fontWeight: "bold" }}>{new Date(voucherData?.expire_day).toLocaleDateString()}</span></Typography>
                                <Typography variant="body2">Số lượng còn: <span style={{ fontWeight: "bold" }}>{voucherData?.quantity}</span></Typography>
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
                            {liked ? (
                                <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
                            ) : (
                                <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
                            )}
                            <ChatBubbleOutlineIcon className="postIcon" />
                            <TelegramIcon className="postIcon" />
                        </div>
                        <div className="post_iconSave">
                            <MapOutlinedIcon className="postIcon" />
                            {isSelected ? (
                                <RoomIcon className="postIcon selected" onClick={onSelect} color="error" />
                            ) : (
                                <FmdGoodOutlinedIcon className="postIcon" onClick={onSelect} />
                            )}
                            {/* <BookmarkBorderIcon className="postIcon" /> */}

                            {isSaved ? (
                                <BookmarkIcon className="postIcon" onClick={handleSavePost} color="primary" />
                            ) : (
                                <BookmarkBorderIcon className="postIcon" onClick={handleSavePost} />
                            )}

                        </div>
                    </div>
                    <span className="post_likes">{likeCount} likes</span>
                    <br />
                    <div className="post__caption">
                        <span>{user} </span> {caption}
                    </div>
                    <div className="post__comment">
                        <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                        {open && <Modal
                            open={open}
                            onClose={() => setOpen(false)}
                            user={user}
                            postImage={images[0]}
                            likes={likes}
                            caption={caption}
                            address={address}
                            timestamp={timestamp}
                        />}
                        <div className="comment">
                            <input placeholder="Add a comment…" />
                            <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled" />
                        </div>
                    </div>

                </div>
            </div>
        )
    } else if (!is_voucher && is_ad) {
        return (
            <div className="post">
                <div className="post__header">
                    <div className="post__headerAuthor">
                        <Avatar src={userData?.avatar}>?</Avatar>
                        {user}  <span> • {timestamp} • Advertisement</span>
                        <br></br>
                    </div>
                    <MoreHorizIcon />
                </div>
                <div className="post__address">
                    <FmdGoodOutlinedIcon className="postIcon" color="action" />
                    <span>{address}</span>
                </div>
                {/* <div className="post__image">
                    <img src={postImage} alt=""></img>
                </div> */}
                <div className="post__image" style={{ position: "relative" }}>
                    <img
                        src={images[current]}
                        alt={`post-img-${current}`}
                        style={{ width: "100%", borderRadius: "10px" }}
                    />
                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="nav-button left">◀</button>
                            <button onClick={nextImage} className="nav-button right">▶</button>
                        </>
                    )}
                </div>
                <div className="post__footer ">
                    {/* <div className="post_footerIcons">
                        <div className="post__iconsMain">
                            <FavoriteBorderIcon className="postIcon" />
                            <ChatBubbleOutlineIcon className="postIcon" />
                            <TelegramIcon className="postIcon" />
                        </div>
                        <div className="post_iconSave">
                            <MapOutlinedIcon className="postIcon" />
                            <FmdGoodOutlinedIcon className="postIcon" />
                            <BookmarkBorderIcon className="postIcon" />
                        </div>
                    </div> */}
                    <div className="post_footerIcons">
                        <div className="post__iconsMain">
                            {liked ? (
                                <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
                            ) : (
                                <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
                            )}
                            <ChatBubbleOutlineIcon className="postIcon" />
                            <TelegramIcon className="postIcon" />
                        </div>
                        <div className="post_iconSave">
                            <MapOutlinedIcon className="postIcon" />
                            {isSelected ? (
                                <RoomIcon className="postIcon selected" onClick={onSelect} color="error" />
                            ) : (
                                <FmdGoodOutlinedIcon className="postIcon" onClick={onSelect} />
                            )}
                            {/* <BookmarkBorderIcon className="postIcon" /> */}

                            {isSaved ? (
                                <BookmarkIcon className="postIcon" onClick={handleSavePost} color="primary" />
                            ) : (
                                <BookmarkBorderIcon className="postIcon" onClick={handleSavePost} />
                            )}

                        </div>
                    </div>
                    <span className="post_likes">{likeCount} likes</span>
                    <br />
                    <div className="post__caption">
                        <span>{user} </span> {caption}
                    </div>
                    <div className="post__comment">
                        <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                        {open && <Modal
                            open={open}
                            onClose={() => setOpen(false)}
                            user={user}
                            postImage={images[0]}
                            likes={likes}
                            caption={caption}
                            address={address}
                            timestamp={timestamp}
                        />}

                        <div className="comment">
                            <input placeholder="Add a comment…" />
                            <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled" />
                        </div>
                    </div>

                </div>
            </div>
        )
    } else {
        return (
            <div className="post">
                <div className="post__header">
                    <div className="post__headerAuthor">
                        <Avatar src={userData?.avatar}>?</Avatar>
                        {user}  <span> • {timestamp}</span>
                    </div>
                    <MoreHorizIcon />
                </div>
                <div className="post__address">
                    <FmdGoodOutlinedIcon className="postIcon" color="action" />
                    <span>{address}</span>
                </div>
                {/* <div className="post__image">
                    <img src={postImage} alt=""></img>
                </div> */}
                <div className="post__image" style={{ position: "relative" }}>
                    <img
                        src={images[current]}
                        alt={`post-img-${current}`}
                        style={{ width: "100%", borderRadius: "10px" }}
                    />
                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="nav-button left">◀</button>
                            <button onClick={nextImage} className="nav-button right">▶</button>
                        </>
                    )}
                </div>
                <div className="post__footer ">
                    <div className="post_footerIcons">
                        <div className="post__iconsMain">
                            {liked ? (
                                <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
                            ) : (
                                <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
                            )}
                            <ChatBubbleOutlineIcon className="postIcon" />
                            <TelegramIcon className="postIcon" />
                        </div>
                        <div className="post_iconSave">
                            <MapOutlinedIcon className="postIcon" />
                            {isSelected ? (
                                <RoomIcon className="postIcon selected" onClick={onSelect} color="error" />
                            ) : (
                                <FmdGoodOutlinedIcon className="postIcon" onClick={onSelect} />
                            )}
                            {/* <BookmarkBorderIcon className="postIcon" /> */}

                            {isSaved ? (
                                <BookmarkIcon className="postIcon" onClick={handleSavePost} color="primary" />
                            ) : (
                                <BookmarkBorderIcon className="postIcon" onClick={handleSavePost} />
                            )}

                        </div>
                    </div>
                    <span className="post_likes">{likeCount} likes</span>
                    <br />
                    <div className="post__caption">
                        <span>{user} </span> {caption}
                    </div>
                    <div className="post__comment">
                        <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                        {open && <Modal
                            open={open}
                            onClose={() => setOpen(false)}
                            user={user}
                            postImage={images[0]}
                            likes={likes}
                            caption={caption}
                            address={address}
                            timestamp={timestamp}
                        />}
                        <div className="comment">
                            <input placeholder="Add a comment…" />
                            <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled" />
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}
export default Post




// // import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
// // import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
// // import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
// // import Grid from "@mui/material/Grid";
// // import ShareModal from "../../components/ShareModal/ShareModal";
// // import Button from "@mui/material/Button";

// // function Post({ user, postImage, likes, caption, address, timestamp, is_voucher, is_ad }) {
// //   const [open, setOpen] = useState(false);

// //   const renderPostIcons = () => (
// //     <div className="post_footerIcons">
// //       <div className="post__iconsMain">
// //         <FavoriteBorderIcon className="postIcon" />
// //         <ChatBubbleOutlineIcon className="postIcon" />
// //         <Telegram className="postIcon" onClick={() => setOpen(true)} style={{ cursor: "pointer" }} />
// //       </div>
// //       <div className="post_iconSave">
// //         <MapOutlinedIcon className="postIcon" />
// //         <FmdGoodOutlinedIcon className="postIcon" />
// //         <BookmarkBorderIcon className="postIcon" />
// //       </div>
// //     </div>
// //   );

// //   const renderPostFooter = () => (
// //     <div className="post__footer">
// //       {renderPostIcons()}
// //       <span className="post_likes">{likes} likes</span>
// //       <br />
// //       <div className="post__caption">
// //         <span>{user} </span> {caption}
// //       </div>
// //       <div className="post__comment">
// //         <span>View all 13,384 comments</span>
// //         <div className="comment">
// //           <input placeholder="Add a comment…" />
// //           <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled" />
// //         </div>
// //       </div>
// //     </div>
// //   );

// //   const renderVoucherCard = () => (
// //     <div>
// //       <Card elevation={3} style={{ maxWidth: 600, margin: "auto", minHeight: "80px" }}>
// //         <Grid container>
// //           <Grid
// //             item
// //             xs={8}
// //             style={{
// //               display: "flex",
// //               flexDirection: "column",
// //               justifyContent: "center",
// //               padding: "16px",
// //             }}
// //           >
// //             <Typography
// //               variant="h4"
// //               style={{
// //                 fontFamily: "Rochester, Arial, sans-serif",
// //                 fontWeight: 500,
// //                 marginBottom: 8,
// //               }}
// //               className="rochester"
// //             >
// //               Voucher
// //             </Typography>
// //             <Typography variant="body1">Giảm 50% với tất cả món gà</Typography>
// //             <Typography variant="body2">
// //               Ngày hết hạn: <span style={{ fontWeight: "bold" }}>31/01/2025</span>
// //             </Typography>
// //             <Typography variant="body2">
// //               Số lượng còn: <span style={{ fontWeight: "bold" }}>36</span>
// //             </Typography>
// //           </Grid>
// //           <Grid
// //             item
// //             xs={4}
// //             style={{
// //               backgroundColor: "#2196F3",
// //               display: "flex",
// //               justifyContent: "center",
// //               alignItems: "center",
// //             }}
// //           >
// //             <Button
// //               variant="text"
// //               style={{
// //                 backgroundColor: "#2196F3",
// //                 color: "white",
// //                 fontWeight: "bold",
// //                 fontSize: "20px",
// //                 width: "100%",
// //                 height: "100%",
// //               }}
// //             >
// //               Nhận
// //             </Button>
// //           </Grid>
// //         </Grid>
// //       </Card>
// //     </div>
// //   );

// //   if (is_voucher && is_ad) {
// //     return (
// //       <div className="post">
// //         <div className="post__header">
// //           <div className="post__headerAuthor">
// //             <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
// //             {user} <span> • {timestamp} • Advertisement</span>
// //           </div>
// //           <MoreHorizIcon />
// //         </div>
// //         <div className="post__address">
// //           <FmdGoodOutlinedIcon className="postIcon" color="action" />
// //           <span>{address}</span>
// //         </div>
// //         <div className="post__image">
// //           <img src={postImage} alt="" />
// //         </div>
// //         {renderVoucherCard()}
// //         {renderPostFooter()}
// //         <ShareModal open={open} onClose={() => setOpen(false)} />
// //       </div>
// //     );
// //   } else if (is_voucher && !is_ad) {
// //     return (
// //       <div className="post">
// //         <div className="post__header">
// //           <div className="post__headerAuthor">
// //             <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
// //             {user} <span> • {timestamp}</span>
// //           </div>
// //           <MoreHorizIcon />
// //         </div>
// //         <div className="post__address">
// //           <FmdGoodOutlinedIcon className="postIcon" color="action" />
// //           <span>{address}</span>
// //         </div>
// //         <div className="post__image">
// //           <img src={postImage} alt="" />
// //         </div>
// //         {renderVoucherCard()}
// //         {renderPostFooter()}
// //         <ShareModal open={open} onClose={() => setOpen(false)} />
// //       </div>
// //     );
// //   } else if (!is_voucher && is_ad) {
// //     return (
// //       <div className="post">
// //         <div className="post__header">
// //           <div className="post__headerAuthor">
// //             <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
// //             {user} <span> • {timestamp} • Advertisement</span>
// //             <br />
// //           </div>
// //           <MoreHorizIcon />
// //         </div>
// //         <div className="post__address">
// //           <FmdGoodOutlinedIcon className="postIcon" color="action" />
// //           <span>{address}</span>
// //         </div>
// //         <div className="post__image">
// //           <img src={postImage} alt="" />
// //         </div>
// //         {renderPostFooter()}
// //         <ShareModal open={open} onClose={() => setOpen(false)} />
// //       </div>
// //     );
// //   } else {
// //     return (
// //       <div className="post">
// //         <div className="post__header">
// //           <div className="post__headerAuthor">
// //             <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
// //             {user} <span> • {timestamp}</span>
// //           </div>
// //           <MoreHorizIcon />
// //         </div>
// //         <div className="post__address">
// //           <FmdGoodOutlinedIcon className="postIcon" color="action" />
// //           <span>{address}</span>
// //         </div>
// //         <div className="post__image">
// //           <img src={postImage} alt="" />
// //         </div>
// //         {renderPostFooter()}
// //         <ShareModal open={open} onClose={() => setOpen(false)} />
// //       </div>
// //     );
// //   }
// // }

// // export default Post;

