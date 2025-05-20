import { Avatar } from "@mui/material";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createReplyAsync, likeCommentAsync, unlikeCommentAsync } from "../redux/Reducer/postSlice";
import moment from 'moment/moment';
import {  useNavigate } from "react-router-dom";
function Reply({ reply, commentId }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?._id;
  const isLiked = reply.likes?.includes(currentUserId) || false;
  const userId = reply.userId._id;
  const handleUsernameClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };
  const handleCreateReply = () => {
    if (!replyText.trim()) return;

    const replyData = {
      commentId,
      userId: currentUser._id,
      comment: replyText,
      from: currentUser.username,
      replyAt: reply.from,
    };

    dispatch(createReplyAsync(replyData)).then(() => {
      setReplyText("");
      setShowReplyForm(false);
    });
  };

  const handleLikeReply = () => {
    const actionData = { commentId, replyId: reply._id, userId: currentUserId };
    if (isLiked) {
      dispatch(unlikeCommentAsync(actionData));
    } else {
      dispatch(likeCommentAsync(actionData));
    }
  };

  return (
    <Stack direction="column" sx={{ gap: 0.5, ml: 2, my: 0.5 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: "flex-start" }}>
        <Avatar
          alt={reply.from}
          src={reply.userId?.avatar || ""}
          sx={{ width: 24, height: 24, cursor: "pointer" }}
          onClick={handleUsernameClick}
        />
        <Stack direction="column" sx={{ flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
            <Typography fontWeight="bold" fontSize={13}  sx={{cursor: "pointer" }}  onClick={handleUsernameClick} >
              {reply.from}
            </Typography>
            <Typography fontSize={13} sx={{ color: "#8e8e8e" }}>
              <Typography
                component="span"
                fontSize={13}
                sx={{ color: "#0095f6", mr: 0.5 }}
              >
                @{reply.replyAt}
              </Typography>
              {reply.comment}
            </Typography>
            <Typography fontSize={12} sx={{ color: "#8e8e8e", ml: "auto" }}>
              {moment(reply.createdAt).fromNow()}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 1, mt: 0.5 }}>
            <Typography
              sx={{ cursor: "pointer", color: "#8e8e8e", fontSize: 12 }}
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </Typography>
            <IconButton
              onClick={handleLikeReply}
              sx={{ p: 0, color: isLiked ? "red" : "#8e8e8e" }}
            >
              {isLiked ? (
                <FavoriteIcon sx={{ fontSize: 14 }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 14 }} />
              )}
            </IconButton>
            {reply.likes?.length > 0 && (
              <Typography fontSize={12} sx={{ color: "#8e8e8e", lineHeight: "14px" }}>
                {reply.likes.length}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>

      {showReplyForm && (
        <Stack direction="row" sx={{ gap: 1, alignItems: "center", ml: 4, mt: 0.5 }}>
          <Avatar
            alt={currentUser.username}
            src={currentUser.avatar}
            sx={{ width: 24, height: 24 }}
          />
          <TextField
            fullWidth
            variant="standard"
            placeholder={`Reply to ${reply.from}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            InputProps={{
              disableUnderline: true,
              style: { fontSize: 13 },
            }}
          />
          <Typography
            onClick={handleCreateReply}
            sx={{
              cursor: replyText.trim() ? "pointer" : "default",
              color: replyText.trim() ? "#0095f6" : "#b2dffc",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Post
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

function Comment({ commentInfo }) {
  const { _id: commentId, createdAt ,from, comment, replies = [], likes = [] } = commentInfo;
  const user = commentInfo.userId;
  const userId = commentInfo.userId._id;
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?._id;
  const isLiked = likes.includes(currentUserId);
console.log("userId:",userId);
  const handleCreateReply = () => {
    if (!replyText.trim()) return;

    const replyData = {
      commentId,
      userId: currentUser._id,
      comment: replyText,
      from: currentUser.username,
      replyAt: from,
    };

    dispatch(createReplyAsync(replyData)).then(() => {
      setReplyText("");
      setShowReplyForm(false);
    });
  };

  const handleLikeComment = () => {
    const actionData = { commentId, userId: currentUserId };
    if (isLiked) {
      dispatch(unlikeCommentAsync(actionData));
    } else {
      dispatch(likeCommentAsync(actionData));
    }
  };
  const handleUsernameClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };
  return (
    <Stack direction="column" sx={{ gap: 0.5, mb: 1 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: "flex-start" }}>
        <Avatar alt={from} src={user?.avatar || ""} sx={{ width: 32, height: 32, cursor:"pointer" }} onClick={handleUsernameClick} />
        <Stack direction="column" sx={{ flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
            <Typography fontWeight="bold" fontSize={13} onClick={handleUsernameClick} sx = {{cursor:"pointer"}}>
              {from}
            </Typography>
            <Typography fontSize={13} sx={{ color: "#8e8e8e" }}>
              {comment}
            </Typography>
            <Typography fontSize={12} sx={{ color: "#8e8e8e", ml: "auto" }}>
              {moment(createdAt).fromNow()}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 1, mt: 0.5 }}>
            <Typography
              sx={{ cursor: "pointer", color: "#8e8e8e", fontSize: 12 }}
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </Typography>
            <IconButton
              onClick={handleLikeComment}
              sx={{ p: 0, color: isLiked ? "red" : "#8e8e8e" }}
            >
              {isLiked ? (
                <FavoriteIcon sx={{ fontSize: 14 }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 14 }} />
              )}
            </IconButton>
            {likes.length > 0 && (
              <Typography fontSize={12} sx={{ color: "#8e8e8e", lineHeight: "14px" }}>
                {likes.length}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>

      {showReplyForm && (
        <Stack direction="row" sx={{ gap: 1, alignItems: "center", ml: 4, mt: 0.5 }}>
          <Avatar
            alt={currentUser.username}
            src={currentUser.avatar}
            sx={{ width: 24, height: 24 }}
          />
          <TextField
            fullWidth
            variant="standard"
            placeholder={`Reply to ${from}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            InputProps={{
              disableUnderline: true,
              style: { fontSize: 13 },
            }}
          />
          <Typography
            onClick={handleCreateReply}
            sx={{
              cursor: replyText.trim() ? "pointer" : "default",
              color: replyText.trim() ? "#0095f6" : "#b2dffc",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Post
          </Typography>
        </Stack>
      )}

      {replies.length > 0 && (
        <Stack sx={{ ml: 4 }}>
          {replies.map((reply) => (
            <Reply
              key={reply._id}
              reply={reply}
              commentId={commentId}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default Comment;