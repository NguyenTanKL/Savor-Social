import { Grid2 } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PostOptionsDialog from "./post/PostOptionsDialog";

function ProfilePost({ postInfo, usernamePost, handlePostDelete, canDelete }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const postId = postInfo._id;

  const handleOpenPostDetail = () => {
    navigate(`/post/${postId}`);
  };

  const handleDelete = () => {
    handlePostDelete();
  };

  // Xử lý images: Nếu là mảng thì lặp, nếu là chuỗi thì dùng trực tiếp
  const images = Array.isArray(postInfo.images) ? postInfo.images : [postInfo.images || ""];

  return (
    <>
      <Grid2 key={postInfo._id} style={{ width: "307.66px", height: "307.66px", position: "relative" }}>
        {images.length > 0 ? (
          images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${postInfo.content}-${index}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: "pointer",
                position: index === 0 ? "absolute" : "relative",
                opacity: index === 0 ? 1 : 0, // Chỉ hiển thị ảnh đầu tiên
              }}
              onClick={handleOpenPostDetail}
            />
          ))
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            No image available
          </div>
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