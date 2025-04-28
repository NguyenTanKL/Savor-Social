import React, { useState } from "react";
import { Grid2 } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PostOptionsDialog from "../post/PostOptionsDialog"

function ProfilePostGrid({ postInfo, usernamePost, handlePostDelete, canDelete }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenPostDetail = () => {
    navigate(`/post/${postInfo._id}`);
  };

  const handleDelete = () => {
    handlePostDelete();
  };

  return (
    <>
      <Grid2 key={postInfo._id} style={{ width: "307.66px", height: "307.66px" }}>
        <img
          src={postInfo.imageUrl}
          alt={postInfo.content}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={handleOpenPostDetail}
        />
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

export default React.memo(ProfilePostGrid);