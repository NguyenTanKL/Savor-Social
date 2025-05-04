import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCommentsAsync,
  createCommentAsync,
  likePostAsync,
  unlikePostAsync,
  getPostsAsync,
  deletePostAsync, // Thêm import
} from "../../redux/Reducer/postSlice";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import { Avatar } from "@mui/material";
import Typography from "@mui/joy/Typography";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ShareModal from "../ShareModal/ShareModal";
import Comment from "../Comment";
import PostOptionsDialog from "./PostOptionsDialog";
import moment from "moment/moment";
import parseContent from "./ParsedContent";
function PostDetail({ canDelete }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  dispatch(getPostsAsync());
  const posts = useSelector((state) => state.posts.posts || []);
  const postInfo = posts.find((p) => p._id === postId);
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?._id;
  const userId = postInfo?.userId;
  const [user, setUser] = useState({});
  const usernamePost = user?.username || "Unknown";
  const isLiked = postInfo?.likes?.includes(currentUserId) || false;
  const { comments, loading } = useSelector((state) => ({
    comments: state.posts?.comments || { commentList: [] },
    loading: state.posts?.loading || false,
  }));
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef(null);

  // Lấy thông tin user
  useEffect(() => {
    if (userId !== currentUser._id) {
      fetch(`http://localhost:5000/api/user/get-by-id/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch user");
          }
          return response.json();
        })
        .then((data) => {
          setUser(data);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });
    } else {
      setUser(currentUser);
    }
  }, [userId, currentUser]);

  // Tải bình luận khi vào trang
  useEffect(() => {
    if (postInfo?._id) {
      dispatch(getCommentsAsync(postInfo._id));
    }
  }, [postInfo, dispatch]);

  const handleCreateComment = () => {
    if (!commentText.trim()) return;

    const commentData = {
      postId: postInfo._id,
      userId: currentUserId,
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
      dispatch(unlikePostAsync({ postId: postInfo._id, userId: currentUserId }));
    } else {
      dispatch(likePostAsync({ postId: postInfo._id, userId: currentUserId }));
    }
  };
  const handleClose = () => {
    navigate(-1);
  };

  const handleFocusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  if (!postInfo) {
    return <div>Post not found</div>;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bgcolor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        overflow: "auto",
      }}
    >
      <Box sx={{ position: "relative", width: "65%", height: "80%", bgcolor: "white" }}>
        <IconButton
          onClick={handleClose}
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
        >
          <CloseIcon />
        </IconButton>

        <Sheet
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "md",
            overflow: "hidden",
            display: "flex",
          }}
        >
          <Box sx={{ width: "60%", height: "100%", overflow: "hidden", flexShrink: 0 }}>
            <img
              src={postInfo.images}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt={postInfo.content}
            />
          </Box>

          <Stack direction="column" sx={{ flex: 1, borderLeft: "1px solid #e0e0e0" }}>
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
                <Avatar src={user?.avatar || ""} sx={{ width: 32, height: 32 }} />
                <Typography fontWeight="bold" fontSize={14}>
                  {usernamePost}
                </Typography>
              </Stack>
              <MoreHorizIcon sx={{ cursor: "pointer" }} onClick={() => setDialogOpen(true)} />
            </Stack>

            <Stack
              sx={{
                flex: 1,
                p: 2,
                overflowY: "auto",
                height: "calc(100% - 130px)",
              }}
            >
              <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
                <Avatar src={user?.avatar || ""} sx={{ width: 32, height: 32 }} />
                <Stack direction="column">
                  <Stack direction="row">
                    <Typography fontWeight="bold" fontSize={14}>
                      {usernamePost}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {moment(postInfo.createdAt).fromNow()}
                    </Typography>
                  </Stack>
                  <Typography fontSize={14}>{parseContent(postInfo.content,postInfo.taggedUsers) || ""}</Typography>
                </Stack>
              </Stack>
              {comments.commentList.length > 0 ? (
                comments.commentList.map((comment) => (
                  <Comment
                    key={comment._id}
                    commentInfo={comment}
                    replies={comment.replies || []}
                  />
                ))
              ) : (
                <Typography fontSize={14} sx={{ p: 2, textAlign: "center" }}>
                  No comments yet.
                </Typography>
              )}
            </Stack>

            <Stack
              direction="column"
              sx={{
                borderTop: "1px solid #e0e0e0",
                bgcolor: "white",
                p: 1,
              }}
            >
              <Stack direction="row" sx={{ gap: 2, alignItems: "center", mb: 1 }}>
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

              <Typography fontSize={14} fontWeight="bold" sx={{ mb: 1 }}>
                {postInfo.likes?.length || 0} likes
              </Typography>

              <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                <Avatar src={user?.profileUrl || ""} sx={{ width: 32, height: 32 }} />
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
                      padding: "0 8px",
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
          </Stack>
        </Sheet>
      </Box>
      <ShareModal postId={postId} open={shareModalOpen} onClose={handleCloseShareModal} />
      <PostOptionsDialog
        user={user}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        postInfo={postInfo}
        canDelete={canDelete}
      />
    </Box>
  );
}

export default PostDetail;