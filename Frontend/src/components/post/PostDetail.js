import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCommentsAsync,
  createCommentAsync,
  likePostAsync,
  unlikePostAsync,
  getPostByIdAsync,
  updatePostAsync,
} from "../../redux/Reducer/postSlice";
import { getFriendsAsync } from "../../redux/Reducer/userSlice";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import { Avatar, Popover, IconButton } from "@mui/material";
import PublicIcon from '@mui/icons-material/Public'; 
import LockIcon from '@mui/icons-material/Lock';
import MapIcon from '@mui/icons-material/Map';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import Typography from "@mui/joy/Typography";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import ShareModal from "../ShareModal/ShareModal";
import Comment from "../Comment";
import PostOptionsDialog from "./PostOptionsDialog";
import moment from "moment/moment";
import parseContent from "./ParsedContent";
import usePostInteractions from "../hooks/usePostInteractions";
import { MentionsInput, Mention } from "react-mentions";
import Picker from "@emoji-mart/react";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Button from "@mui/material/Button";
import data from "@emoji-mart/data";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import { BACKENDURL } from "../../utils/const";
import axios from "axios";
// Tái sử dụng style từ CreatePost
const mentionStyle = {
  control: {
    fontSize: "1rem",
    fontWeight: "normal",
    lineHeight: "1.5",
    minHeight: "100px",
  },
  highlighter: {
    padding: "9px 12px",
    boxSizing: "border-box",
  },
  input: {
    padding: "9px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    outline: "none",
  },
  suggestions: {
    list: {
      backgroundColor: "white",
      border: "1px solid #ccc",
      borderRadius: "4px",
      maxHeight: "150px",
      overflowY: "auto",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    item: {
      padding: "5px 10px",
      borderBottom: "1px solid #eee",
      "&focused": {
        backgroundColor: "#f0f0f0",
      },
    },
  },
};

function PostDetail({ canDelete }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Thêm state để quản lý ảnh hiện tại
  const [isLocationSaved, setIsLocationSaved] = useState(false);
 
  useEffect(() => {
    dispatch(getPostByIdAsync(postId));
    dispatch(getFriendsAsync());
    checkLocationSavedStatus();
  }, [dispatch, postId]);

  const postInfo = useSelector((state) => state.posts.currentPost || {});
  const loading = useSelector((state) => state.posts.loading);
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?._id;
  const { comments } = useSelector((state) => ({
    comments: state.posts?.comments || { commentList: [] },
  }));
  const userId = postInfo && postInfo.userId ? (postInfo.userId._id || postInfo.userId) : null;

  const [user, setUser] = useState({});
  const usernamePost = user?.username || "Unknown";

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [editAnchorEl, setEditAnchorEl] = useState(null);
  const commentInputRef = useRef(null);
  const [isEditingVisibility, setIsEditingVisibility] = useState(false);
  const [newVisibility, setNewVisibility] = useState(postInfo?.visibility || 'public');
  const [visibilityAnchorEl, setVisibilityAnchorEl] = useState(null);
  // Lấy danh sách bạn bè để tag (tương tự CreatePost)
  const following = Array.isArray(currentUser?.following) ? currentUser.following : [];
  const followers = Array.isArray(currentUser?.followers) ? currentUser.followers : [];
  const friends = [...new Set([...following, ...followers].map(f => JSON.stringify(f)))].map(f => JSON.parse(f));
  const mentionUsers = friends
    .filter(friend => friend && friend._id && friend.username)
    .map(friend => ({
      id: friend._id,
      display: friend.username,
    }));
  const suggestedTags = ["donhat", "monan", "pho", "banhmi", "anvat", "doauong", "monchay", "haisan"];
  const mentionTags = suggestedTags.map(tag => ({
    id: tag,
    display: tag,
  }));

  useEffect(() => {
    if (userId && userId !== currentUser._id) {
      fetch(`${BACKENDURL}/api/user/get-by-id/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setUser(data))
        .catch((error) => console.error("Error fetching user:", error));
    } else if (userId) {
      setUser(currentUser);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    if (postInfo?._id && !isEditing) {
      dispatch(getCommentsAsync(postInfo._id));
    }
  }, [postInfo, dispatch, isEditing]);

  const updateTaggedUsersFromContent = (content) => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentionedIds = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      const id = match[2];
      mentionedIds.push(id);
    }

    const updatedTaggedUsers = friends.filter(friend => mentionedIds.includes(friend._id));
    setTaggedUsers(updatedTaggedUsers);

    const restaurantCount = updatedTaggedUsers.filter(user => user.userType === "restaurant").length;
    if (restaurantCount > 1) {
      setErrorMessage("You can only tag at most one restaurant in a post.");
    } else {
      setErrorMessage("");
    }
  };
  const handleOpenVisibilityPicker = (event) => {
    if (currentUserId === userId) {
      setVisibilityAnchorEl(event.currentTarget);
      setIsEditingVisibility(true);
      setNewVisibility(postInfo?.visibility || 'public');
    }
  };
  const handleCloseVisibilityPicker = () => {
  setVisibilityAnchorEl(null);
  setIsEditingVisibility(false);
};
  const handleSaveVisibility = async () => {
    try {
      const updatedData = { postId: postInfo._id, visibility: newVisibility };
      const result = await dispatch(updatePostAsync(updatedData)).unwrap();
      dispatch({
        type: "posts/updatePost/fulfilled",
        payload: { ...postInfo, visibility: newVisibility },
      });
      handleCloseVisibilityPicker();
    } catch (error) {
      console.error("Error updating visibility:", error);
      alert("Failed to update visibility. Please try again.");
    }
  };
  const openVisibilityPicker = Boolean(visibilityAnchorEl);
  const handleCreateComment = () => {
    if (!commentText.trim() || isEditing) return;

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

  const { liked, likeCount, isSaved, handleSavePost, handleLike } = usePostInteractions(postId, postInfo.likes, currentUserId);

  const handleClose = () => {
    navigate(-1);
  };

  const handleFocusCommentInput = () => {
    if (commentInputRef.current && !isEditing) {
      commentInputRef.current.focus();
    }
  };

  const handleEditPost = () => {
    setIsEditing(true);
    setEditContent(postInfo.content || "");
    updateTaggedUsersFromContent(postInfo.content || "");
  };

  const handleSaveEdit = () => {
    const restaurantCount = taggedUsers.filter(user => user.userType === "restaurant").length;
    if (restaurantCount > 1) {
      setErrorMessage("You can only tag at most one restaurant in a post.");
      return;
    }

    dispatch(updatePostAsync({ postId, content: editContent, taggedUsers })).then((action) => {
      if (action.meta.requestStatus === "fulfilled") {
        const updatedPost = { ...postInfo, content: editContent, taggedUsers };
        dispatch({
          type: "posts/updatePost/fulfilled",
          payload: updatedPost,
        });
        setIsEditing(false);
        setErrorMessage("");
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(postInfo.content || "");
    setTaggedUsers(postInfo.taggedUsers || []);
    setErrorMessage("");
  };

  const handleAddMention = (id, display) => {
    const selectedUser = friends.find(friend => friend._id === id);
    if (selectedUser && !taggedUsers.some(u => u._id === id)) {
      const newTaggedUsers = [...taggedUsers, selectedUser];
      setTaggedUsers(newTaggedUsers);

      const restaurantCount = newTaggedUsers.filter(user => user.userType === "restaurant").length;
      if (restaurantCount > 1) {
        setErrorMessage("You can only tag at most one restaurant in a post.");
      } else {
        setErrorMessage("");
      }
    }
  };

  // Xử lý emoji picker cho bình luận
  const handleOpenEmojiPicker = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji) => {
    setCommentText((prev) => prev + emoji.native);
    handleCloseEmojiPicker();
  };

  // Xử lý emoji picker cho chỉnh sửa nội dung
  const handleOpenEditEmojiPicker = (event) => {
    setEditAnchorEl(event.currentTarget);
  };

  const handleCloseEditEmojiPicker = () => {
    setEditAnchorEl(null);
  };

  const handleEditEmojiSelect = (emoji) => {
    setEditContent((prev) => prev + emoji.native);
    updateTaggedUsersFromContent(editContent + emoji.native);
    handleCloseEditEmojiPicker();
  };

  const openEmojiPicker = Boolean(anchorEl);
  const openEditEmojiPicker = Boolean(editAnchorEl);

  const handleUsernameClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  // Hàm điều hướng ảnh
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (Array.isArray(postInfo.images) ? postInfo.images.length : 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (Array.isArray(postInfo.images) ? postInfo.images.length : 1)) % (Array.isArray(postInfo.images) ? postInfo.images.length : 1));
  };
// Hàm kiểm tra trạng thái lưu địa điểm
const checkLocationSavedStatus = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BACKENDURL}/api/posts/favourite-locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const favouriteLocations = response.data;
    const isSaved = favouriteLocations.some(loc => loc.postId === postId);
    setIsLocationSaved(isSaved);
  } catch (error) {
    console.error("Error checking location saved status:", error);
  }
};

// Hàm lưu địa điểm vào favourite-locations
const handleSaveLocation = async () => {
  try {
    const token = localStorage.getItem("token");
    const coordinates = postInfo.location?.coordinates || {};
    const postId = postInfo._id;
    if (!coordinates.lat || !coordinates.lng) {
      alert("This post does not have valid coordinates to save.");
      return;
    }

    if (isLocationSaved) {
      // Xóa khỏi favourite-locations nếu đã lưu
      await axios.put(`${BACKENDURL}/api/posts/${postId}/select`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsLocationSaved(false);
      alert("Location removed from favourites!");
    } else {
      // Thêm vào favourite-locations
      await axios.put(
        `${BACKENDURL}/api/posts/${postId}/select`,
        { postId, coordinates },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLocationSaved(true);
      alert("Location saved to favourites!");
    }
  } catch (error) {
    console.error("Error saving location:", error.response?.data || error.message);
    alert("Failed to save location");
  }
};
  if (!postInfo._id) {
    return <Typography>Loading...</Typography>;
  }

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
          <Box sx={{ width: "60%", height: "100%", overflow: "hidden", flexShrink: 0, position: "relative" }}>
            {Array.isArray(postInfo.images) && postInfo.images.length > 0 ? (
              <>
                <img
                  src={postInfo.images[currentImageIndex]}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  alt={`Post image ${currentImageIndex}`}
                />
                {postInfo.images.length > 1 && (
                  <>
                    <IconButton
                      onClick={prevImage}
                      sx={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "white",
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
                      }}
                    >
                      ◀
                    </IconButton>
                    <IconButton
                      onClick={nextImage}
                      sx={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "white",
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
                      }}
                    >
                      ▶
                    </IconButton>
                  </>
                )}
              </>
            ) : (
              <Typography>No images available</Typography>
            )}
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
                <Stack direction="row" sx={{ alignItems: "center", gap: 1, cursor: "pointer" }} onClick = {handleUsernameClick}>
                  <Avatar src={user?.avatar || ""} sx={{ width: 32, height: 32 }} />
                  <Typography fontWeight="bold" fontSize={14}>
                    {usernamePost}
                  </Typography>
                </Stack>
                
                {postInfo.visibility === 'public' ? (
                  <PublicIcon
                    sx={{ fontSize: 16, color: "grey.500", cursor: "pointer" }}
                    titleAccess="Công khai"
                    onClick={handleOpenVisibilityPicker}
                  />
                ) : (
                  <LockIcon
                    sx={{ fontSize: 16, color: "grey.500", cursor: "pointer" }}
                    titleAccess="Chỉ mình tôi"
                    onClick={handleOpenVisibilityPicker}
                  />
                )}
              </Stack>
              {currentUserId === userId && (
                isEditing ? (
                  <IconButton
                    onClick={handleSaveEdit}
                    color="primary"
                  >
                    <Typography variant="button" sx={{ color: "inherit" }}>
                      Done
                    </Typography>
                  </IconButton>
                ) : (
                  <MoreHorizIcon sx={{ cursor: "pointer" }} onClick={() => setDialogOpen(true)} />
                )
              )}
            </Stack>
            <Popover
              open={openVisibilityPicker}
              anchorEl={null}
              onClose={handleCloseVisibilityPicker}
              anchorOrigin={{
                vertical: "center",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "center",
                horizontal: "center",
              }}
              PaperProps={{
                sx: {
                  position: "fixed",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  minWidth: "300px",
                  maxWidth: "400px",
                  bgcolor: "white",
                  p: 2,
                  textAlign: "center",
                },
              }}
            >
              <Box >
                <Typography sx={{ fontWeight: "bold", mb: 2 }}>
                Choose visibility mode
                </Typography>
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <RadioGroup
                    value={newVisibility}
                    onChange={(e) => setNewVisibility(e.target.value)}
                  >
                    <FormControlLabel
                      value="public"
                      control={<Radio />}
                      label="Public"
                      sx={{ padding: "5px 0", justifyContent: "center" }}
                    />
                    <FormControlLabel
                      value="private"
                      control={<Radio />}
                      label="Private"
                      sx={{ padding: "5px 0", justifyContent: "center" }}
                    />
                  </RadioGroup>
                </FormControl>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button onClick={handleCloseVisibilityPicker} sx={{ width: "48%" }}>
                   Cancel
                  </Button>
                  <Button onClick={handleSaveVisibility} sx={{ width: "48%" }}>
                    Done
                  </Button>
                </Box>
              </Box>
            </Popover>
            <Stack
              sx={{
                flex: 1,
                p: 2,
                overflowY: "auto",
                height: "calc(100% - 130px)",
              }}
            >
              {isEditing ? (
                <Stack direction="column" sx={{ gap: 1 }}>
                  <Typography fontSize={14} sx={{ mb: 2 }}>
                    Preview: {parseContent(postInfo.content, postInfo.taggedUsers) || ""}
                  </Typography>
                  <MentionsInput
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      updateTaggedUsersFromContent(e.target.value);
                    }}
                    style={mentionStyle}
                    placeholder="Edit your content..."
                    className="mentions-input"
                  >
                    <Mention
                      trigger="@"
                      data={mentionUsers}
                      onAdd={handleAddMention}
                      markup="@[__display__](__id__)"
                      displayTransform={(id, display) => `@${display}`}
                      style={{ backgroundColor: "#d1eaff" }}
                    />
                    <Mention
                      trigger="#"
                      data={mentionTags}
                      markup="#[__display__](__id__)"
                      displayTransform={(id, display) => `#${display}`}
                      style={{ backgroundColor: "#d1eaff" }}
                    />
                  </MentionsInput>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <IconButton onClick={handleOpenEditEmojiPicker} sx={{ color: 'grey.500' }}>
                      <EmojiEmotionsOutlinedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                  <Popover
                    open={openEditEmojiPicker}
                    anchorEl={editAnchorEl}
                    onClose={handleCloseEditEmojiPicker}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <Picker data={data} onEmojiSelect={handleEditEmojiSelect} />
                  </Popover>
                  {errorMessage && (
                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                      {errorMessage}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Stack direction="column" sx={{ gap: 1 }}>
                  <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
                    <Avatar src={user?.avatar || ""} sx={{ width: 32, height: 32,cursor:"pointer" }} onClick={handleUsernameClick} />
                    <Stack direction="column">
                      <Stack direction="row">
                        <Typography fontWeight="bold" fontSize={14} sx = {{cursor:"pointer"}} onClick={handleUsernameClick}>
                          {usernamePost}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                          {moment(postInfo.createdAt).fromNow()}
                        </Typography>
                      </Stack>
                      <Typography fontSize={14}>
                        {parseContent(postInfo.content, postInfo.taggedUsers) || ""}
                      </Typography>
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
                  {liked ? (
                    <FavoriteIcon sx={{ fontSize: 24, color: "red" }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                  )}
                </IconButton>
                <IconButton onClick={handleFocusCommentInput} disabled={isEditing}>
                  <ChatBubbleOutlineIcon sx={{ fontSize: 24 }} />
                </IconButton>
                <IconButton onClick={handleOpenShareModal}>
                  <SendIcon sx={{ fontSize: 24 }} />
                </IconButton>
                
                <IconButton onClick={handleSavePost} sx={{ marginLeft: "auto" }}>
                  {isSaved ? (
                    <BookmarkIcon className="postIcon" onClick={handleSavePost} color="primary" />
                  ) : (
                    <BookmarkBorderIcon className="postIcon" onClick={handleSavePost} />
                  )}
                </IconButton>
                <IconButton onClick={handleSaveLocation}>
                  {isLocationSaved ? (
                    <MapIcon className="postIcon" color="error" />
                  ) : (
                    <MapOutlinedIcon className="postIcon" />
                  )}
                </IconButton>
              </Stack>

              <Typography fontSize={14} fontWeight="bold" sx={{ mb: 1 }}>
                {likeCount || 0} likes
              </Typography>

              {!isEditing && (
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                  <IconButton onClick={handleOpenEmojiPicker} sx={{ color: "#rgb(0, 0, 0)" }}>
                    <EmojiEmotionsOutlinedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
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
                  <Popover
                    open={openEmojiPicker}
                    anchorEl={anchorEl}
                    onClose={handleCloseEmojiPicker}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                  </Popover>
                </Stack>
              )}
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
        onDelete={() => navigate(-1)}
        onEdit={handleEditPost}
      />
    </Box>
  );
}

export default PostDetail;