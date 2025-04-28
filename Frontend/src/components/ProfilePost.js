// import { Grid2 } from "@mui/material";
// import React, { useState, useRef } from "react";
// import Modal from "@mui/joy/Modal";
// import ModalClose from "@mui/joy/ModalClose";
// import Stack from "@mui/joy/Stack";
// import Box from "@mui/joy/Box";
// import Sheet from "@mui/joy/Sheet";
// import { Avatar } from "@mui/material";
// import Typography from "@mui/joy/Typography";
// import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
// import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
// import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
// import SendIcon from "@mui/icons-material/Send";
// import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import Comment from "../components/Comment";
// import PostOptionsDialog from "./post/PostOptionsDialog";
// import { useDispatch, useSelector } from "react-redux";
// import { getCommentsAsync, createCommentAsync, likePostAsync, unlikePostAsync } from "../redux/Reducer/postSlice";
// import TextField from "@mui/material/TextField";
// import IconButton from "@mui/material/IconButton";
// import ShareModal from "./ShareModal/ShareModal";
// import moment from 'moment/moment';

// function ProfilePost({ postInfo, usernamePost, handlePostDelete, canDelete }) {
//   const [open, setOpen] = useState(false);
//   const [shareModalOpen, setShareModalOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [commentText, setCommentText] = useState("");
//   const dispatch = useDispatch();
//   const currentUser = useSelector((state) => state.user.user);
//   const currentUserId = currentUser?._id;
//   const isLiked = postInfo.likes?.includes(currentUserId) || false;
//   const { comments, loading } = useSelector((state) => ({
//     comments: state.posts?.comments || { commentList: [] },
//   }));
//   const commentInputRef = useRef(null);
//   console.log("comment:", comments);
//   console.log("postInfo:", postInfo);

//   const handleOpenModal = () => {
//     console.log("getcomment:", postInfo._id);
//     setOpen(true);
//     dispatch(getCommentsAsync(postInfo._id));
//   };

//   const handleCreateComment = () => {
//     if (!commentText.trim()) return;

//     const commentData = {
//       postId: postInfo._id,
//       userId: postInfo.userId._id,
//       comment: commentText,
//       from: currentUser.username,
//     };

//     dispatch(createCommentAsync(commentData)).then(() => {
//       setCommentText("");
//       dispatch(getCommentsAsync(postInfo._id));
//     });
//   };

//   const handleOpenShareModal = () => {
//     setShareModalOpen(true);
//   };

//   const handleCloseShareModal = () => {
//     setShareModalOpen(false);
//   };

//   const handleLike = () => {
//     if (!postInfo?._id || !currentUserId) {
//       console.error("Missing required fields for liking post", {
//         postId: postInfo?._id,
//         userId: currentUserId,
//       });
//       return;
//     }

//     if (isLiked) {
//       console.log("unlike");
//       dispatch(unlikePostAsync({ postId: postInfo._id, userId: currentUserId }));
//     } else {
//       dispatch(likePostAsync({ postId: postInfo._id, userId: currentUserId }));
//     }
//   };

//   const handleDelete = () => {
//     handlePostDelete();
//     setOpen(false);
//   };

//   const handleFocusCommentInput = () => {
//     if (commentInputRef.current) {
//       commentInputRef.current.focus();
//     }
//   };

//   return (
//     <>
//       <Grid2 postInfo key={postInfo._id} style={{ width: "307.66px", height: "307.66px" }}>
//         <img
//           src={postInfo.imageUrl}
//           alt={postInfo.content}
//           style={{
//             width: "100%",
//             height: "100%",
//             objectFit: "cover",
//             cursor: "pointer",
//           }}
//           onClick={handleOpenModal}
//         />
//       </Grid2>
//       <Modal
//         open={open}
//         onClose={() => setOpen(false)}
//         sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
//       >
//         <Box sx={{ position: "relative", width: "65%", height: "80%", bgcolor: "white" }}>
//           <ModalClose
//             variant="plain"
//             sx={{
//               position: "absolute",
//               top: -40,
//               right: -40,
//               bgcolor: "rgba(0, 0, 0, 0.6)",
//               color: "white",
//               borderRadius: "50%",
//               width: 36,
//               height: 36,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
//             }}
//             onClick={() => setOpen(false)}
//           />
//           <Sheet
//             sx={{
//               width: "100%",
//               height: "100%",
//               borderRadius: "md",
//               overflow: "hidden",
//               display: "flex",
//             }}
//           >
//             {/* Phần hình ảnh bên trái */}
//             <Box sx={{ width: "60%", height: "100%", overflow: "hidden", flexShrink: 0 }}>
//               <img
//                 src={postInfo.imageUrl}
//                 style={{ width: "100%", height: "100%", objectFit: "cover" }}
//               />
//             </Box>

//             {/* Phần nội dung và bình luận bên phải */}
//             <Stack direction="column" sx={{ flex: 1, borderLeft: "1px solid #e0e0e0" }}>
//               {/* Header: Thông tin người đăng */}
//               <Stack
//                 direction="row"
//                 sx={{
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   p: 2,
//                   borderBottom: "1px solid #e0e0e0",
//                 }}
//               >
//                 <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
//                   <Avatar src={postInfo.user?.profileUrl || ""} sx={{ width: 32, height: 32 }} />
//                   <Typography fontWeight="bold" fontSize={14}>
//                     {usernamePost}
//                   </Typography>
//                 </Stack>
//                 <MoreHorizIcon sx={{ cursor: "pointer" }} onClick={() => setDialogOpen(true)} />
//               </Stack>

//               {/* Phần bình luận (có thể cuộn) */}
//               <Stack
//                 sx={{
//                   flex: 1,
//                   p: 2,
//                   overflowY: "auto",
//                   height: "calc(100% - 130px)", // Trừ chiều cao của header (~50px) và footer (~80px)
//                 }}
//               >
//                 {/* Nội dung bài post */}
//                 <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
//                   <Avatar src={postInfo.user?.profileUrl || ""} sx={{ width: 32, height: 32 }} />
//                   <Stack direction="column">
//                     <Stack direction="row">
//                       <Typography fontWeight="bold" fontSize={14}>
//                         {usernamePost}
//                       </Typography>
//                       <Typography fontSize={12} color="text.secondary">
//                         {moment(postInfo.createdAt).fromNow()}
//                       </Typography>
//                     </Stack>
//                     <Typography fontSize={14}>{postInfo.content || ""}</Typography>
//                   </Stack>
//                 </Stack>
//                 {/* Danh sách bình luận */}
//                 {comments.commentList.length > 0 ? (
//                   comments.commentList.map((comment) => (
//                     <Comment
//                       key={comment._id}
//                       commentInfo={comment}
//                       replies={comment.replies || []}
//                     />
//                   ))
//                 ) : (
//                   <Typography fontSize={14} sx={{ p: 2, textAlign: "center" }}>
//                     No comments yet.
//                   </Typography>
//                 )}
//               </Stack>

//               {/* Phần footer: Biểu tượng và nhập bình luận (cố định ở dưới cùng) */}
//               <Stack
//                 direction="column"
//                 sx={{
//                   borderTop: "1px solid #e0e0e0",
//                   bgcolor: "white",
//                   p: 1,
//                 }}
//               >
//                 {/* Biểu tượng Like, Comment, Share, Saved */}
//                 <Stack direction="row" sx={{ gap: 2, alignItems: "center", mb: 1 }}>
//                   <IconButton onClick={handleLike}>
//                     {isLiked ? (
//                       <FavoriteIcon sx={{ fontSize: 24, color: "red" }} />
//                     ) : (
//                       <FavoriteBorderIcon sx={{ fontSize: 24 }} />
//                     )}
//                   </IconButton>
//                   <IconButton onClick={handleFocusCommentInput}>
//                     <ChatBubbleOutlineIcon sx={{ fontSize: 24 }} />
//                   </IconButton>
//                   <IconButton onClick={handleOpenShareModal}>
//                     <SendIcon sx={{ fontSize: 24 }} />
//                   </IconButton>
//                   <IconButton sx={{ marginLeft: "auto" }}>
//                     <BookmarkBorderIcon sx={{ fontSize: 24 }} />
//                   </IconButton>
//                 </Stack>

//                 {/* Số lượt thích */}
//                 <Typography fontSize={14} fontWeight="bold" sx={{ mb: 1 }}>
//                   {postInfo.likes?.length || 0} likes
//                 </Typography>

//                 {/* Phần nhập bình luận */}
//                 <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
//                   <Avatar src={postInfo.user?.profileUrl || ""} sx={{ width: 32, height: 32 }} />
//                   <TextField
//                     inputRef={commentInputRef}
//                     fullWidth
//                     variant="standard"
//                     placeholder="Add a comment..."
//                     value={commentText}
//                     onChange={(e) => setCommentText(e.target.value)}
//                     InputProps={{
//                       disableUnderline: true,
//                       style: { fontSize: 14 },
//                     }}
//                     sx={{
//                       "& .MuiInputBase-root": {
//                         padding: "0 8px",
//                       },
//                     }}
//                   />
//                   <IconButton
//                     onClick={handleCreateComment}
//                     disabled={loading || !commentText.trim()}
//                     sx={{ color: commentText.trim() ? "#0095f6" : "#b2dffc" }}
//                   >
//                     <SendIcon sx={{ fontSize: 20 }} />
//                   </IconButton>
//                 </Stack>
//               </Stack>
//             </Stack>
//           </Sheet>
//         </Box>
//       </Modal>
//       <ShareModal open={shareModalOpen} onClose={handleCloseShareModal} />
//       <PostOptionsDialog
//         open={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//         onDelete={handleDelete}
//         postInfo={postInfo}
//         canDelete={canDelete}
//       />
//     </>
//   );
// }

// export default React.memo(ProfilePost);
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

export default React.memo(ProfilePost);