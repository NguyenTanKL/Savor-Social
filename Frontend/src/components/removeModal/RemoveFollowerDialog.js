// RemoveFollowerDialog.js
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/Reducer/userSlice";
import { BACKENDURL } from "../../utils/const";
const RemoveFollowerDialog = ({ open, handleClose, follower, onRemoveSuccess }) => {
    const dispatch = useDispatch();
    const handleRemove = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${BACKENDURL}/api/user/remove-follower/${follower._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && response.data) {
      onRemoveSuccess(follower._id); // Gọi callback để cập nhật danh sách
      dispatch(updateUser(response.data.user));
      handleClose();}
      else {
        console.error("API không trả về user hoặc bị lỗi:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi xóa follower:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Remove Follower</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn xóa <strong>{follower?.username}</strong> khỏi danh sách follower của bạn không?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleRemove} color="error">
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveFollowerDialog;