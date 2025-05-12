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
import parseContent from "./ParsedContent";
import { toggleFollow } from "../../api";
import { updateUser } from "../../redux/Reducer/userSlice";
const PostOptionsDialog = ({ user, open, onClose, onDelete, postInfo, onEdit, isFollowing }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.user._id);
  console.log("PostInfo:0",postInfo);
  const handlePostDelete = async () => {
    try {
      if (!userId) {
        throw new Error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      }

      if (!postInfo?._id) {
        throw new Error("Không tìm thấy postId.");
      }

      // Dispatch action deletePostAsync để xóa bài viết
      const result = await dispatch(deletePostAsync({ postId: postInfo._id, userId })).unwrap();
      // Đóng dialog sau khi xóa thành công
      onClose();
      // Điều hướng về trang profile của người dùng
      navigate(`/profile/${user._id}`);
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
    }
  };

  const handleEdit = () => {
    onEdit(); // Gọi callback để mở chế độ chỉnh sửa từ component cha
    onClose(); // Đóng dialog sau khi chọn "Edit"
  };

  const handleShare = () => {
    // Logic chia sẻ bài viết (có thể tích hợp với ShareModal nếu cần)
    onClose();
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${postInfo._id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert("Link bài viết đã được sao chép!");
    });
    onClose();
  };
  const handleUnfollow = async () => {
    try {
      const newStatus = await toggleFollow(user, true); // Gọi toggleFollow để unfollow
      dispatch(updateUser(newStatus.user)); // Cập nhật Redux state
      onClose(); // Đóng modal
    } catch (error) {
      console.error("Error unfollowing user:", error);
      alert("Failed to unfollow user. Please try again.");
    }
  };
  console.log("unfollow:",userId,user,isFollowing );
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
        {/* Chỉ hiển thị "Delete" nếu người dùng hiện tại là chủ bài viết */}
        {userId !== user && isFollowing && (
          <>
        
            <Typography
              sx={{
                color: "red",
                fontWeight: "bold",
                padding: "10px 0",
                cursor: "pointer",
              }}
              onClick={handleUnfollow}
            >
              Unfollow
            </Typography>
            <Divider />
          </>
        )}
        {userId === postInfo?.userId && (
          <>
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
          </>
        )}

        {/* Chỉ hiển thị "Edit" nếu người dùng hiện tại là chủ bài viết */}
        {userId === postInfo?.userId && (
          <>
            <Typography
              sx={{ padding: "10px 0", cursor: "pointer" }}
              onClick={handleEdit}
            >
              Edit
            </Typography>
            <Divider />
          </>
        )}
        <Divider />

        <Typography
          sx={{ padding: "10px 0", cursor: "pointer" }}
          onClick={handleCopyLink}
        >
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