import { Grid2 } from "@mui/material";
import { useState, useRef } from "react";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import { Avatar } from "@mui/material";
import Typography from "@mui/joy/Typography";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"; // Icon Like
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline"; // Icon Comment
import SendIcon from "@mui/icons-material/Send"; // Icon Share
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder"; // Icon Saved
import Divider from "@mui/material/Divider";
import FavoriteIcon from '@mui/icons-material/Favorite';
import Comment from "../components/Comment";
import PostOptionsDialog from "./post/PostOptionsDialog";
import { useDispatch, useSelector } from "react-redux";
import { getCommentsAsync, createCommentAsync, likePostAsync, unlikePostAsync } from "../redux/Reducer/postSlice";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ShareModal from "./ShareModal/ShareModal";
import moment from 'moment/moment'
function ProfilePost({ postInfo,usernamePost, onPostDelete, canDelete }) {
  const [open, setOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?._id;
  const isLiked = Array.isArray(postInfo.likes) && postInfo.likes.includes(currentUserId);
  // const isLiked = postInfo.likes?.includes(currentUserId) || false;
  const [liking, setLiking] = useState(false);
  const { comments, loading } = useSelector((state) => ({
    comments: state.posts?.comments || { commentList: [] },
    // loading: state.post?.loading || false,
  }));
  const commentInputRef = useRef(null);
console.log("comment:",comments);
console.log("postInfo:",postInfo);
  const handleOpenModal = () => {
    console.log("getcommnet:",postInfo._id)
    setOpen(true);
    dispatch(getCommentsAsync(postInfo._id));
  };

  const handleCreateComment = () => {
    if (!commentText.trim()) return;

    const commentData = {
      postId: postInfo._id,
      userId: postInfo.userId._id,
      comment: commentText,
      from: currentUser.username,
    };

    dispatch(createCommentAsync(commentData)).then(() => {
      setCommentText("");
      dispatch(getCommentsAsync(postInfo._id));
    });
  };
  const handleOpenShareModal = () => {
    setShareModalOpen(true);
  };

  // Hàm đóng ShareModal
  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };
  const handleLike = () => {
    if (!postInfo?._id || !currentUserId) {
      console.error("Missing required fields for liking post", {
        postId: postInfo?._id,
        userId: currentUserId,
      });
      return;
    }

    if (isLiked) {
      // Unlike
      console.log("unlike");
      dispatch(unlikePostAsync({ postId: postInfo._id, userId: currentUserId }));
    } else {
      // Like
      dispatch(likePostAsync({ postId: postInfo._id, userId: currentUserId }));
    }
  };
  const handleDelete = () => {
    onPostDelete();
    setOpen(false);
  };
  const handleFocusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };
  return (
    <>
      <Grid2 postInfo key={postInfo._id} style={{ width: "307.66px", height: "307.66px" }}>
        <img
          src={postInfo.imageUrl}
          alt={postInfo.content}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={handleOpenModal}
        />
      </Grid2>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box sx={{ position: "relative", width: "65%", height: "80%", bgcolor: "white" }}>
          <ModalClose
            variant="plain"
            sx={{
              position: "absolute",
              top: -40,
              right: -40,
              bgcolor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
            }}
            onClick={() => setOpen(false)}
          />
          <Sheet
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "md",
              overflow: "hidden",
              display: "flex",
            }}
          >
            {/* Phần hình ảnh bên trái */}
            <Box sx={{ width: "60%", height: "100%", overflow: "hidden", flexShrink: 0 }}>
              <img
                src={postInfo.imageUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            {/* Phần nội dung và bình luận bên phải */}
            <Stack direction="column" sx={{ flex: 1, borderLeft: "1px solid #e0e0e0", position: "relative" }}>
              {/* Header: Thông tin người đăng */}
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                  <Avatar src={postInfo.user?.profileUrl || ""} sx={{ width: 32, height: 32 }} />
                  <Typography fontWeight="bold" fontSize={14}>
                    {postInfo.userId.username}
                  </Typography>
                </Stack>
                <MoreHorizIcon sx={{ cursor: "pointer" }} onClick={() => setDialogOpen(true)} />
              </Stack>

              {/* Phần bình luận (có thể cuộn) */}
              <Stack
                sx={{
                  flex: 1,
                  p: 2,
                  overflowY: "auto",
                  pb: "60px", // Khoảng cách để phần nhập bình luận không che nội dung
                }}
              >
                {/* Nội dung bài post */}
                <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
                  <Avatar src={postInfo.user?.profileUrl || ""} sx={{ width: 32, height: 32 }} />
                  <Stack direction="column">
                    <Stack direction="row">
                      <Typography fontWeight="bold" fontSize={14}>
                        {usernamePost}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {moment(postInfo.createdAt).fromNow()}
                    </Typography>
                    </Stack>
                    
                    <Typography fontSize={14}>{postInfo.content || ""}</Typography>
                    
                  </Stack>
                </Stack>
                  {/* Danh sách bình luận */}
                  {comments.commentList.length > 0 ? (
                    comments.commentList.map((comment) => (
                      <Comment
                        key={comment._id}
                        commentInfo = {comment}
                        replies = {comment.replies || []}
                      />
                  ))
                ) : (
                  <Typography fontSize={14} sx={{ p: 2, textAlign: "center" }}>
                    No comments yet.
                  </Typography>
                )}
                {/* Biểu tượng Like, Comment, Share, Saved */}
                <Stack direction="row" sx={{ gap: 2, mb: 2, alignItems: "center" }}>
                <IconButton onClick={handleLike}>
                    {isLiked ? (
                      <FavoriteIcon sx={{ fontSize: 24, color: "red" }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                    )}
                  </IconButton>
                  <IconButton onClick={handleFocusCommentInput}>
                    <ChatBubbleOutlineIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                  <IconButton onClick={handleOpenShareModal}>
                    <SendIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                  <IconButton sx={{ marginLeft: "auto" }}>
                    <BookmarkBorderIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                </Stack>

                {/* Số lượt thích */}
                <Typography fontSize={14} fontWeight="bold" sx={{ mb: 2 }}>
                  {postInfo.likes?.length || 0} likes
                </Typography>

                
              </Stack>

              {/* Phần nhập bình luận (cố định ở dưới cùng) */}
              <Stack
                direction="row"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 1, // Giảm padding để trông gọn hơn
                  borderTop: "1px solid #e0e0e0",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "white",
                }}
              >
                <Avatar src={postInfo.user?.profileUrl || ""} sx={{ width: 32, height: 32 }} />
                <TextField
                  inputRef={commentInputRef}
                  fullWidth
                  variant="standard"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: 14 },
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      padding: "0 8px", // Giảm padding để trông gọn hơn
                    },
                  }}
                />
                <IconButton
                  onClick={handleCreateComment}
                  disabled={loading || !commentText.trim()}
                  sx={{ color: commentText.trim() ? "#0095f6" : "#b2dffc" }}
                >
                  <SendIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
            </Stack>
          </Sheet>
        </Box>
      </Modal>
      <ShareModal open={shareModalOpen} onClose={handleCloseShareModal} />
      <PostOptionsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onDelete={handleDelete}
        postInfo={postInfo}
        canDelete={canDelete}
      />
    </>
  );
}

export default ProfilePost;