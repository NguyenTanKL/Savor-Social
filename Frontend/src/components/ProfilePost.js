  import { Grid2 } from "@mui/material";
  import React, { useState, useEffect  } from "react";
  import { useSelector } from "react-redux";
  import { useNavigate } from "react-router-dom";
  import PostOptionsDialog from "./post/PostOptionsDialog";
  import FavoriteIcon from "@mui/icons-material/Favorite";
  import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
  import "./ProfilePost.css";
  import { Box, Stack, Typography } from "@mui/material";
  import PermMediaIcon from '@mui/icons-material/PermMedia';
  import moment from "moment/moment";
  import Tooltip from '@mui/material/Tooltip';
  import { BACKENDURL } from "../utils/const";
  // Hàm helper để lấy userId
const getUserId = (userIdField) => {
  if (typeof userIdField === "string") {
    return userIdField;
  }
  if (userIdField && typeof userIdField === "object" && userIdField._id) {
    return userIdField._id;
  }
  console.error("Invalid userIdField:", userIdField);
  return null;
};
  function ProfilePost({ postInfo, usernamePost, handlePostDelete, canDelete }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false); 
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user.user);
    const postId = postInfo._id;
    const likeCount = postInfo.likes?.length || 0;
    const commentCount = postInfo.comments?.length || 0;
    const [postAuthor, setPostAuthor] = useState(null);
    useEffect(() => {
      const fetchPostAuthor = async () => {
        try {
          const token = localStorage.getItem("token");
          const userId = getUserId(postInfo.userId);
          if (!userId) {
            console.error("Cannot fetch user: userId is invalid");
            return;
          }
          const response = await fetch(`${BACKENDURL}/api/user/get-by-id/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error("Failed to fetch post author");
          const data = await response.json();
          console.log("data:",data);
          setPostAuthor(data);
          
        } catch (err) {
          console.error("Error fetching post author:", err);
        }
      };
    
      if (postInfo.userId) {
        fetchPostAuthor();
      }
    }, [postInfo.userId]);
    const handleOpenPostDetail = () => {
      navigate(`/post/${postId}`);
    };

    const handleDelete = () => {
      handlePostDelete();
    };

    // Xử lý images: Nếu là mảng thì lặp, nếu là chuỗi thì dùng trực tiếp
    const images = Array.isArray(postInfo.images) ? postInfo.images : [postInfo.images || ""];
    const hasMultipleImages = images.length > 1;
    return (
      <>
        <Grid2
    key={postInfo._id}
    sx={{
      width: "307.66px",
      height: "307.66px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {images.length > 0 ? (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: "pointer",
        }}
        onClick={handleOpenPostDetail}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          component="img"
          src={images[0]}
          alt={`${postInfo.content}-0`}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        
        {/* Icon nếu có nhiều ảnh */}
        {hasMultipleImages && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              color: "white",
              bgcolor: "rgba(0,0,0,0.4)",
              borderRadius: "50%",
              p: 0.5,
            }}
          >
            <PermMediaIcon fontSize="small" />
          </Box>
        )}

        {/* Hover overlay */}
        {isHovered && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(0,0,0,0.45)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
            }}
          >
            {postAuthor?._id !== currentUser?._id  && (
            <Tooltip title="Author Post" arrow placement="top">
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${postAuthor._id}`);
                }}
              >
                {postAuthor?.username}
              </Typography>
            </Tooltip>
            )}
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <FavoriteIcon />
                <Typography variant="body2">{likeCount}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <ChatBubbleIcon />
                <Typography variant="body2">{commentCount}</Typography>
              </Stack>
            </Stack>
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                color: "white",
                opacity: 0.8,
                fontSize: "12px",
              }}
            >
              {moment(postInfo.createdAt).fromNow()}
        </Typography>
          </Box>
        )}
      </Box>
    ) : (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No image available
        </Typography>
      </Box>
    )}
  </Grid2>

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

  export default React.memo(ProfilePost);