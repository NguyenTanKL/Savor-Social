// userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const getInitialUser = () => {
    const userFromStorage = localStorage.getItem("user");
    console.log("userFromStorage:", userFromStorage); // Debug giá trị
    if (userFromStorage && typeof userFromStorage === "string") {
      try {
        return JSON.parse(userFromStorage);
      } catch (error) {
        console.error("Lỗi khi parse user từ localStorage:", error);
        return null; // Trả về null nếu parse thất bại
      }
    }
    return null; // Trả về null nếu không có dữ liệu hoặc dữ liệu không hợp lệ
  };

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: getInitialUser(),
    isAuthenticated: !!localStorage.getItem("token"), // Kiểm tra token để xác thực
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;

// Async action để login
export function userLogin(data) {
  return (dispatch) => {
    dispatch(login(data));
  };
}

// Async action để logout
export function userLogout() {
  return (dispatch) => {
    dispatch(logout());
  };
}
