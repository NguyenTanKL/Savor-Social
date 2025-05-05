import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { BACKENDURL } from "../../utils/const";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/Reducer/userSlice";
const UnfollowDialog = ({ open, handleClose, user, onUnfollowSuccess }) => {
    const dispatch = useDispatch();
    const handleUnfollow = async () => {
        if (!user) return;
      
        try {
          const token = localStorage.getItem("token");      
          const response = await axios.delete(
            `${BACKENDURL}/api/user/unfollow/${user._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
      
          if (response.status === 200 && response.data.user) {
            onUnfollowSuccess(user._id);
            // ✅ Cập nhật Redux bằng updateUser
            dispatch(updateUser(response.data.user));
      
            // ✅ Đóng modal
            handleClose();
          } else {
            console.error("API không trả về user hoặc bị lỗi:", response.data);
          }
        } catch (error) {
          console.error("Lỗi khi unfollow:", error);
        }
      };
      
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Unfollow {user?.username}?</DialogTitle>
      <DialogContent>
        Bạn có chắc chắn muốn bỏ theo dõi {user?.username}?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Cancel</Button>
        <Button onClick={handleUnfollow} color="secondary">Unfollow</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnfollowDialog;
