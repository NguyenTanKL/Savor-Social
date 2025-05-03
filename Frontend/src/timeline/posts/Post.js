import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, Button, Rating, Box, Chip } from "@mui/material";
import "./Post.css";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TelegramIcon from "@mui/icons-material/Telegram";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import Grid from "@mui/material/Grid";
import Modal from "../../components/Modal";
import RoomIcon from "@mui/icons-material/Room";
import usePostInteractions from "../../components/hooks/usePostInteractions"; // Import hook
import axios from "axios";
import ShareModal from "../../components/ShareModal/ShareModal";
import parseContent from "../../components/post/ParsedContent";
function Post({
  user,
  postID,
  postComment,
  images,
  likes,
  content,
  tags,
  taggedUsers,
  rating,
  address,
  timestamp,
  is_voucher,
  is_ad,
  isSelected,
  onSelect,
  ad_id,
  voucher_id
}) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);
  const posts = useSelector((state) => state.posts.posts || []);
  const currentUserId = currentUser?._id;
  const username = currentUser?.username || "Unknown";
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState(null);
  const [current, setCurrent] =useState(0);
  const {
    liked,
    likeCount,
    isSaved,
    commentText,
    setCommentText,
    comments,
    loading,
    handleLike,
    handleSavePost,
    loadComments,
    handleCreateComment,
  } = usePostInteractions(postID, likes, currentUserId);
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
  // Lấy thông tin user của bài post
  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:5000/api/user/get-by-id/${user}`)
        .then((res) => {
          console.log("Dữ liệu user nhận được:", res.data);
          setUserData(res.data);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy dữ liệu user:", err);
          console.log("Lỗi chi tiết:", err.response?.data);
        });
    }
  }, [user]);
  const usernameOfPost = userData?.username || "Unknown";
  const handleOpenShareModal = () => {
    setShareModalOpen(true);
  };
  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };
  const handleOpenPostDetail = () => {
    navigate(`/post/${postID}`);
  };

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
                    <span>{user} </span> {content}
                </div>
                <div className="post__comment">
                    <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                    {open && <Modal
                        open={open}
                        onClose={() => setOpen(false)}
                        user={user}
                        postImage={images[0]}
                        likes={likes}
                        caption={content}
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
                    <span>{user} </span> {content}
                </div>
                <div className="post__comment">
                    <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                    {open && <Modal
                        open={open}
                        onClose={() => setOpen(false)}
                        user={user}
                        postImage={images[0]}
                        likes={likes}
                        caption={content}
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
                    <span>{user} </span> {content}
                </div>
                <div className="post__comment">
                    <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
                    {open && <Modal
                        open={open}
                        onClose={() => setOpen(false)}
                        user={user}
                        postImage={images[0]}
                        likes={likes}
                        caption={content}
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
            {usernameOfPost} <span> • {timestamp}</span>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image">
          <img src={images} alt="" />
        </div>
        <div className="post__footer">
          <div className="post_footerIcons">
            <div className="post__iconsMain">
              {liked ? (
                <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
              ) : (
                <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
              )}
              <ChatBubbleOutlineIcon className="postIcon" onClick={handleOpenPostDetail} />
              <TelegramIcon className="postIcon" onClick={handleOpenShareModal} />
            </div>
            <div className="post_iconSave">
              <MapOutlinedIcon className="postIcon" />
              {isSelected ? (
                <RoomIcon className="postIcon selected" onClick={onSelect} color="error" />
              ) : (
                <FmdGoodOutlinedIcon className="postIcon" onClick={onSelect} />
              )}
              {isSaved ? (
                <BookmarkIcon className="postIcon" onClick={handleSavePost} color="primary" />
              ) : (
                <BookmarkBorderIcon className="postIcon" onClick={handleSavePost} />
              )}
            </div>
          </div>
          <span className="post_likes">{likeCount} likes</span>
          <br />
          <Typography variant="body2" color="text.secondary">
              <span>Rate: {rating} </span>
            </Typography>
          {/* Phần Rating */}
        <Box sx={{ mt: 1, mb: 1 }}>
          {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {userRating ? `You rated: ${userRating}/10` : "Rate this post (1-10)"}
            </Typography>
            <Rating
              name={`rating-${postID}`}
              value={userRating || 0}
              max={10}
              // onChange={handleRatingChange}
              // disabled={ratingLoading}
              precision={1}
              size="small"
              sx={{
                color: "#ff6f61", // Màu cam nhẹ phù hợp với chủ đề đồ ăn
                "& .MuiRating-iconEmpty": {
                  color: "#e0e0e0", // Màu xám nhạt cho ngôi sao rỗng
                },
              }}
            />
          </Box> */}
          {/* {averageRating !== null && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Average: {averageRating.toFixed(1)}/10
            </Typography>
          )} */}
        </Box>
          <div className="post__caption">
            <span>{usernameOfPost} </span>
             {parseContent(content,taggedUsers)}
            <br/>
          </div>
          <div className="post__comment">
            <span onClick={handleOpenPostDetail} style={{ cursor: "pointer" }}>
              View all {postComment?.length} comments
            </span>
            <div className="comment">
              <input
                placeholder="Add a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled" />
              <button
                onClick={() => handleCreateComment(username)}
                disabled={loading || !commentText.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
        <ShareModal open = {shareModalOpen} onClose={handleCloseShareModal} />
      </div>
    );
  }
}

export default Post;