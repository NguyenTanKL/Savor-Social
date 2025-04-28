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
  postImage,
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
}) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);
  const posts = useSelector((state) => state.posts.posts || []);
  const currentUserId = currentUser?._id;
  const username = currentUser?.username || "Unknown";
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  // const [userRating, setUserRating] = useState(null); // Điểm rating của người dùng hiện tại
  // const [averageRating, setAverageRating] = useState(null); // Điểm trung bình rating của bài post
  // const [ratingLoading, setRatingLoading] = useState(false);
  // Sử dụng hook usePostInteractions
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

  // Lấy thông tin user của bài post
  useEffect(() => {

    console.log("bài post:", posts);
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
  // useEffect(() => {
  //   const fetchRatingData = async () => {
  //     try {
  //       // Lấy điểm trung bình rating của bài post
  //       console.log("ratifngpost",postID);
  //       const averageResponse = await axios.get(
  //         `http://localhost:5000/api/posts/${postID}/rating/average`,
  //         {
  //           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //         }
  //       );
  //       setAverageRating(averageResponse.data.averageRating || 0);

  //       // Lấy rating của người dùng hiện tại (nếu có)
  //       const userRatingResponse = await axios.get(
  //         `http://localhost:5000/api/posts/${postID}/rating/user/${currentUserId}`,
  //         {
  //           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //         }
  //       );
  //       setUserRating(userRatingResponse.data.rating || null);
  //     } catch (error) {
  //       console.error("Lỗi khi lấy dữ liệu rating:", error);
  //     }
  //   };

  //   if (postID && currentUserId) {
  //     fetchRatingData();
  //   }
  // }, [postID, currentUserId]);
  // const handleRatingChange = async (event, newValue) => {
  //   if (!newValue) return; // Nếu người dùng bỏ chọn rating
  //   setRatingLoading(true);
  //   try {
  //     // Gửi yêu cầu cập nhật rating lên server
  //     const token = localStorage.getItem("token");
  //     console.log("newvalue:",newValue);
  //     await axios.post(
  //       `http://localhost:5000/api/posts/${postID}/rating`,
  //       { rating: newValue },
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }
  //     );

  //     // Cập nhật state sau khi gửi rating thành công
  //     setUserRating(newValue);

  //     // Fetch lại điểm trung bình rating
  //     const averageResponse = await axios.get(
  //       `http://localhost:5000/api/posts/${postID}/rating/average`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     setAverageRating(averageResponse.data.averageRating || 0);
  //   } catch (error) {
  //     console.error("Lỗi khi gửi rating:", error);
  //   } finally {
  //     setRatingLoading(false);
  //   }
  // };
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
            {usernameOfPost} <span> • {timestamp} • Advertisement</span>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image">
          <img src={postImage} alt="" />
        </div>
        <div>
          <Card elevation={3} style={{ maxWidth: 600, margin: "auto" }}>
            <Grid container>
              <Grid
                item
                xs={8}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "16px",
                }}
              >
                <Typography
                  variant="h4"
                  style={{
                    fontFamily: "Rochester, Arial, sans-serif",
                    fontWeight: 500,
                    marginBottom: 8,
                  }}
                  className="rochester"
                >
                  Voucher
                </Typography>
                <Typography variant="body1">Giảm 50% với tất cả món gà</Typography>
                <Typography variant="body2">
                  Ngày hết hạn: <span style={{ fontWeight: "bold" }}>31/01/2025</span>
                </Typography>
                <Typography variant="body2">
                  Số lượng còn: <span style={{ fontWeight: "bold" }}>36</span>
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                style={{
                  backgroundColor: "#2196F3",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="text"
                  style={{
                    backgroundColor: "#2196F3",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  Nhận
                </Button>
              </Grid>
            </Grid>
          </Card>
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
              <TelegramIcon className="postIcon" />
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
          <div className="post__caption">
            <span>{usernameOfPost} </span> {content}
          </div>
          <div className="post__comment">
            <span onClick={handleOpenPostDetail} style={{ cursor: "pointer" }}>
              View all 13,384 comments
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
      </div>
    );
  } else if (is_voucher && !is_ad) {
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
          <img src={postImage} alt="" />
        </div>
        <div>
          <Card elevation={3} style={{ maxWidth: 600, margin: "auto", minHeight: "80px" }}>
            <Grid container>
              <Grid
                item
                xs={8}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "16px",
                }}
              >
                <Typography
                  variant="h4"
                  style={{
                    fontFamily: "Rochester, Arial, sans-serif",
                    fontWeight: 500,
                    marginBottom: 8,
                  }}
                  className="rochester"
                >
                  Voucher
                </Typography>
                <Typography variant="body1">Giảm 50% với tất cả món gà</Typography>
                <Typography variant="body2">
                  Ngày hết hạn: <span style={{ fontWeight: "bold" }}>31/01/2025</span>
                </Typography>
                <Typography variant="body2">
                  Số lượng còn: <span style={{ fontWeight: "bold" }}>36</span>
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                style={{
                  backgroundColor: "#2196F3",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="text"
                  style={{
                    backgroundColor: "#2196F3",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "20px",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  Nhận
                </Button>
              </Grid>
            </Grid>
          </Card>
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
              <TelegramIcon className="postIcon" />
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
          <div className="post__caption">
            <span>{usernameOfPost} </span> {content}
          </div>
          <div className="post__comment">
            <span onClick={handleOpenPostDetail} style={{ cursor: "pointer" }}>
              View all 13,384 comments
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
      </div>
    );
  } else if (!is_voucher && is_ad) {
    return (
      <div className="post">
        <div className="post__header">
          <div className="post__headerAuthor">
            <Avatar src={userData?.avatar}>?</Avatar>
            {usernameOfPost} <span> • {timestamp} • Advertisement</span>
            <br />
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image">
          <img src={postImage} alt="" />
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
              <TelegramIcon className="postIcon" />
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
          <div className="post__caption">
            <span>{usernameOfPost} </span> {content}
          </div>
          <div className="post__comment">
            <span onClick={handleOpenPostDetail} style={{ cursor: "pointer" }}>
              View all 13,384 comments
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
      </div>
    );
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
          <img src={postImage} alt="" />
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