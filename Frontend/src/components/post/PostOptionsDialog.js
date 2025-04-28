// import { useState } from "react";
// import { useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import Dialog from "@mui/material/Dialog";
// import DialogContent from "@mui/material/DialogContent";
// import DialogActions from "@mui/material/DialogActions";
// import Typography from "@mui/joy/Typography";
// import Button from "@mui/material/Button";
// import Divider from "@mui/material/Divider";
// import { useDispatch } from "react-redux";
// import { deletePostAsync } from "../../redux/Reducer/postSlice";
// const PostOptionsDialog = ({user, open, onClose, onDelete, postInfo }) => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const userId = useSelector((state) => state.user.user._id);    
//     const handlePostDelete = async () => {
//       console.log("item:",postInfo);
//         try {
//             if (!userId) {
//                 throw new Error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
//               }
        
//               if (!postInfo?._id) {
//                 throw new Error("Không tìm thấy postId.");
//               }
//               console.log("Gửi yêu cầu xóa:", { postId: postInfo._id, userId });
//           // Dispatch action deletePostAsync để xóa bài viết
//           const result = await dispatch(deletePostAsync({ postId: postInfo._id, userId })).unwrap();
//           console.log("Xóa bài viết thành công:", result);
//           // Gọi callback để thông báo cho component cha rằng bài viết đã bị xóa
//           onDelete();
//           // Đóng dialog sau khi xóa thành công
//           onClose();
//           navigate(`/profile/${postInfo?.userId}`);
//         } catch (error) {
//           console.error("Lỗi khi xóa bài viết:", error);
//         }
//       };

//   return (
//     <Dialog open={open} onClose={onClose} sx={{ textAlign: "center",
//         "& .MuiDialog-paper": {
//           width: "400px",
//           maxWidth: "90%",
//         },
//      }}>
//       <DialogContent>
//         <Typography
//           sx={{
//             color: "red",
//             fontWeight: "bold",
//             padding: "10px 0",
//             cursor: "pointer",
//           }}
//           onClick={handlePostDelete}
//         >
//           Delete
//         </Typography>
//         <Divider />
//         <Typography sx={{ padding: "10px 0", cursor: "pointer" }}>
//           Edit
//         </Typography>
//         <Divider />
//         <Typography sx={{ padding: "10px 0", cursor: "pointer" }}>
//           Share to ...
//         </Typography>
//         <Divider />
//         <Typography sx={{ padding: "10px 0", cursor: "pointer" }}>
//           Copy link
//         </Typography>
//         <Divider />
//       </DialogContent>
//       <DialogActions sx={{ justifyContent: "center" }}>
//         <Button onClick={onClose}  sx={{ width: "100%" }}>
//           Cancel
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default PostOptionsDialog;
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/joy/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useDispatch } from "react-redux";
import { deletePostAsync } from "../../redux/Reducer/postSlice";

const PostOptionsDialog = ({ user, open, onClose, onDelete, postInfo }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.user._id);

  const handlePostDelete = async () => {
    console.log("item:", postInfo);
    try {
      if (!userId) {
        throw new Error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      }

      if (!postInfo?._id) {
        throw new Error("Không tìm thấy postId.");
      }
      console.log("Gửi yêu cầu xóa:", { postId: postInfo._id, userId });

      // Dispatch action deletePostAsync để xóa bài viết
      const result = await dispatch(deletePostAsync({ postId: postInfo._id, userId })).unwrap();
      console.log("Xóa bài viết thành công:", result);
      // Đóng dialog sau khi xóa thành công
      onClose();
      navigate(`/profile/${user._id}`);
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        textAlign: "center",
        "& .MuiDialog-paper": {
          width: "400px",
          maxWidth: "90%",
        },
      }}
    >
      <DialogContent>
        <Typography
          sx={{
            color: "red",
            fontWeight: "bold",
            padding: "10px 0",
            cursor: "pointer",
          }}
          onClick={handlePostDelete}
        >
          Delete
        </Typography>
        <Divider />
        <Typography sx={{ padding: "10px 0", cursor: "pointer" }}>
          Edit
        </Typography>
        <Divider />
        <Typography sx={{ padding: "10px 0", cursor: "pointer" }}>
          Share to ...
        </Typography>
        <Divider />
        <Typography sx={{ padding: "10px 0", cursor: "pointer" }}>
          Copy link
        </Typography>
        <Divider />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={onClose} sx={{ width: "100%" }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostOptionsDialog;