import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFriends } from "../../api";
// Hàm lấy user từ localStorage
const getInitialUser = () => {
  const userFromStorage = localStorage.getItem("user");
  console.log("userFromStorage:", userFromStorage); // Debug giá trị
  if (!userFromStorage || userFromStorage === "undefined") {
    return {}; // Return an empty object instead of null
  }
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

// Action bất đồng bộ để lấy danh sách bạn bè
export const getFriendsAsync = createAsyncThunk(
  "user/getFriends",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getFriends(); // Gọi API từ userApi.js
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch friends" });
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: getInitialUser(),
    isAuthenticated: !!localStorage.getItem("token"), // Kiểm tra token để xác thực
    friends: [], // Thêm trường để lưu danh sách bạn bè
    friendsLoading: false, // Trạng thái loading khi lấy danh sách bạn bè
    friendsError: null, // Lưu lỗi nếu có khi lấy danh sách bạn bè
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.friends = []; // Xóa danh sách bạn bè khi đăng xuất
      state.friendsLoading = false;
      state.friendsError = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }; // Cập nhật state trực tiếp
      console.log("Redux state updated:", state.user); // Debug
      localStorage.setItem("user", JSON.stringify(state.user)); // Cập nhật localStorage
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFriendsAsync.pending, (state) => {
        state.friendsLoading = true;
        state.friendsError = null;
      })
      .addCase(getFriendsAsync.fulfilled, (state, action) => {
        state.friendsLoading = false;
        state.friends = action.payload;
      })
      .addCase(getFriendsAsync.rejected, (state, action) => {
        state.friendsLoading = false;
        state.friendsError = action.payload;
      });
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