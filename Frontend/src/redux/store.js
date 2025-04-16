// store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./Reducer/userSlice";
import postReducer from "./Reducer/postSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
  },
});