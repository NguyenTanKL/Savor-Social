import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TelegramIcon from "@mui/icons-material/Telegram";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import RoomIcon from "@mui/icons-material/Room";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import moment from "moment/moment";
import usePostInteractions from "../hooks/usePostInteractions";
import { useSelector } from "react-redux";
import axios from "axios";
import SendIcon from "@mui/icons-material/Send";
function PostNormal({
  user,
  postID,
  postImage,
  likes,
  caption,
  address,
  timestamp,
  is_voucher,
  is_ad,
  isSelected,
  onSelect,
  showComments = false, // Để hiển thị danh sách bình luận trong trang chi tiết
}) {
  const navigate = useNavigate();
  const commentInputRef = useRef(null);
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?._id;
  const [userData, setUserData] = React.useState(null);

  const {
    liked,
    likeCount,
    isSaved,
    commentText,
    setCommentText,
    comments,
    handleLike,
    handleSavePost,
    loadComments,
    handleCreateComment,
  } = usePostInteractions(postID, likes, currentUserId);

  // Lấy thông tin user
  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:5000/api/userRoutes/${user}`)
        .then((res) => {
          setUserData(res.data);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy dữ liệu user:", err);
        });
    }
  }, [user]);

  // Tải bình luận khi ở trang chi tiết
  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, loadComments]);

  const handleFocusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };
  return (
    <div className="post">
      <div className="post__header">
        <div className="post__headerAuthor">
          <Avatar src={userData?.avatar}>?</Avatar>
          {user} <span> • {timestamp}</span>
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
            <ChatBubbleOutlineIcon className="postIcon" onClick={handleFocusCommentInput} />
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
          <span>{user} </span> {caption}
        </div>
        <div className="post__comment">
          {!showComments && (
            <span
              onClick={() => navigate(`/post/${postID}`)}
              style={{ cursor: "pointer" }}
            >
              View all comments
            </span>
          )}
          {showComments && comments.commentList.length > 0 ? (
            comments.commentList.map((comment) => (
              <div key={comment._id} className="comment-item">
                <Avatar src={comment.from?.profileUrl || ""} sx={{ width: 24, height: 24 }} />
                <span>
                  <strong>{comment.from}</strong> {comment.comment}
                </span>
              </div>
            ))
          ) : (
            showComments && <p>No comments yet.</p>
          )}
          <div className="comment">
            <input
              ref={commentInputRef}
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <SendIcon className="postIcon" color="disabled" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostNormal;