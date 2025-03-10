// store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./Reducer/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});