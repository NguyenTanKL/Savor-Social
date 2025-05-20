import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/joy/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useDispatch } from "react-redux";
import { deletePostAsync, updatePostAsync } from "../../redux/Reducer/postSlice";
import { toggleFollow } from "../../api";
import { updateUser } from "../../redux/Reducer/userSlice";
import { useState } from "react";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

const PostOptionsDialog = ({ user, open, onClose, onDelete, postInfo, onEdit, isFollowing }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.user._id);

  // State để quản lý chế độ chỉnh sửa visibility
  const [isEditingVisibility, setIsEditingVisibility] = useState(false);
  const [newVisibility, setNewVisibility] = useState(postInfo?.visibility || 'public');

  const handlePostDelete = async () => {
    try {
      if (!userId) {
        throw new Error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      }

      if (!postInfo?._id) {
        throw new Error("Không tìm thấy postId.");
      }

      const result = await dispatch(deletePostAsync({ postId: postInfo._id, userId })).unwrap();
      onClose();
      navigate(`/profile/${user._id}`);
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
    }
  };

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const handleShare = () => {
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
      const newStatus = await toggleFollow(user, true);
      dispatch(updateUser(newStatus.user));
      onClose();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      alert("Failed to unfollow user. Please try again.");
    }
  };

  // Xử lý khi chọn "Chỉnh sửa đối tượng"
  const handleEditVisibility = () => {
    setIsEditingVisibility(true);
    setNewVisibility(postInfo?.visibility || 'public');
  };

  // Xử lý khi nhấn "Xong" để lưu visibility
  const handleSaveVisibility = async () => {
    try {
      const updatedData = { postId: postInfo._id, visibility: newVisibility };
      const result = await dispatch(updatePostAsync(updatedData)).unwrap();
      // Cập nhật postInfo trong Redux
      dispatch({
        type: "posts/updatePost/fulfilled",
        payload: { ...postInfo, visibility: newVisibility },
      });
      setIsEditingVisibility(false);
      onClose();
    } catch (error) {
      console.error("Error updating visibility:", error);
      alert("Failed to update visibility. Please try again.");
    }
  };

  // Xử lý hủy chỉnh sửa visibility
  const handleCancelEditVisibility = () => {
    setIsEditingVisibility(false);
    setNewVisibility(postInfo?.visibility || 'public');
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
        {isEditingVisibility ? (
          <>
            <Typography sx={{ fontWeight: "bold", padding: "10px 0" }}>
              Chọn đối tượng
            </Typography>
            <Divider />
            <FormControl component="fieldset" sx={{ width: "100%", mt: 2 }}>
              <RadioGroup
                value={newVisibility}
                onChange={(e) => setNewVisibility(e.target.value)}
              >
                <FormControlLabel
                  value="public"
                  control={<Radio />}
                  label="Công khai"
                  sx={{ padding: "10px 0", justifyContent: "center" }}
                />
                <FormControlLabel
                  value="private"
                  control={<Radio />}
                  label="Chỉ mình tôi"
                  sx={{ padding: "10px 0", justifyContent: "center" }}
                />
              </RadioGroup>
            </FormControl>
            <Divider />
          </>
        ) : (
          <>
            {/* Chỉ hiển thị "Unfollow" nếu người dùng hiện tại không phải là chủ bài viết và đang follow */}
            {userId !== user?._id && isFollowing && (
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

            {/* Chỉ hiển thị "Delete" nếu người dùng hiện tại là chủ bài viết */}
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

            {/* Chỉ hiển thị "Chỉnh sửa đối tượng" nếu người dùng hiện tại là chủ bài viết */}
            {userId === postInfo?.userId && (
              <>
                <Typography
                  sx={{ padding: "10px 0", cursor: "pointer" }}
                  onClick={handleEditVisibility}
                >
                  Chỉnh sửa đối tượng
                </Typography>
                <Divider />
              </>
            )}

            <Typography
              sx={{ padding: "10px 0", cursor: "pointer" }}
              onClick={handleCopyLink}
            >
              Copy link
            </Typography>
            <Divider />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        {isEditingVisibility ? (
          <>
            <Button onClick={handleCancelEditVisibility} sx={{ width: "50%" }}>
              Hủy
            </Button>
            <Button onClick={handleSaveVisibility} sx={{ width: "50%" }}>
              Xong
            </Button>
          </>
        ) : (
          <Button onClick={onClose} sx={{ width: "100%" }}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PostOptionsDialog;