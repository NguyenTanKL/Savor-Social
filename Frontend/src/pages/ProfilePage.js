// src/pages/ProfilePage.js
import React, { useState, useEffect } from "react";
import {  useNavigate,useParams } from "react-router-dom";
import "./ProfilePage.css";
import { useDispatch, useSelector } from 'react-redux'
import axios from "axios";
import { Box, CircularProgress } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { getPostsAsync } from "../redux/Reducer/postSlice"; // Import getPostsAsync
import HeaderProfile from "../components/HeaderProfile";
import ProfileTabs from "../components/ProfileTabs";
import FavouriteMap from "../components/FavouriteMap";
import ProfilePost from "../components/ProfilePost";

function ProfilePage() {
  const userStorage = useSelector(state => state.user.user);
  const [error, setError] = useState(null); 
  const [type, setType] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [data, setData] = useState([]);
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log("id:",userId )
  useEffect(() => {
    console.log("id:",userId )
    if (userId  !== userStorage._id) {
      // Nếu id khác userStorage._id => Lấy thông tin user khác
      axios.get(`http://localhost:5000/api/user/get-by-id/${userId}`)
        .then((response) => {
          setUser(response.data);
          console.log("user id:",userId);
          console.log("user api", response.data);
          setIsFollowing(response.data.isFollowing); // Kiểm tra trạng thái follow
        })
        .catch((error) => console.error("Error fetching user:", error));
    } else {
      console.log("userStore", userStorage)
      setUser(userStorage); // Nếu là chính user đang đăng nhập, lấy từ redux
      console.log("User:",user);
    }

  }, [userId , userStorage]);
  useEffect(() => {
    
    if (type === "posts") {
      setIsLoading(true); // Bắt đầu loading
      axios
        .get(`https://jsonplaceholder.typicode.com/photos?_limit=9`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch user');
          }
          return response.json();
        })
        .then((data) => {
          setUser(data);
          console.log("user id:", userId);
          console.log("user api", data);
          setIsFollowing(data.isFollowing); // Kiểm tra trạng thái follow
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          navigate('/login'); // Chuyển hướng nếu lỗi (ví dụ: không có quyền truy cập)
        });
    } else {
      console.log("userStore", userStorage);
      setUser(userStorage); // Nếu là chính user đang đăng nhập, lấy từ redux
      console.log("User:", user);
    }
  }, [userId, userStorage, navigate]);

  // Lấy danh sách bài viết
  useEffect(() => {
    if (type === "posts") {
      // Dispatch action để lấy tất cả bài viết
      dispatch(getPostsAsync())
        .unwrap()
        .catch((err) => {
          console.error("Error fetching posts:", err);
        });
    } 
  }, [type, dispatch]);

  // Lọc bài viết theo userId
  const userPosts = (postState && Array.isArray(postState)) 
  ? postState.filter((post) => post.userId && post.userId._id && post.userId._id.toString() === userId)
  : [];

  console.log("userPosts:",userPosts);
  const handlePostDelete = () => {
    // Không cần gọi lại getPostsAsync vì state đã được cập nhật trong postSlice
  };
  return (
 
    <div className="profilepage">
      <HeaderProfile user={user} userId={userId} />
      <ProfileTabs type={type} setType={setType} />

     

      {type === "posts" ? (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          {isLoading ? (
            <CircularProgress color="primary" />
          ) : userPosts.length === 0 ?  (
            <Box sx={{ textAlign: "center", p: 2 }}>
              <p>Error loading posts: {error.message || "Something went wrong"}</p>
            </Box>
          ) : userPosts.length === 0 ? (
            <Box sx={{ textAlign: "center", p: 2 }}>
              <p>No posts available.</p>
            </Box>
          ) : (
            <Grid2
              container
              sx={{
                justifyContent: "center",
                alignItems: "center",
                display: "grid",
                columnGap: 1,
                rowGap: 1,
                gridTemplateColumns: "repeat(3, 1fr)",
              }}
            >
              {userPosts.map((post) => (
                <ProfilePost
                  key={post._id}
                  postInfo={post}
                    // id: post._id,
                    // imageUrl: post.imageUrl, // Ảnh từ backend
                    // content: post.content || "No caption", // Caption của bài viết
                    // user: post.userId || {},
                    // comments:post.comments || [],
                    // username:user.username
                  usernamePost = {user.username}
                  
                  handlePostDelete={handlePostDelete}
                  canDelete={post.userId?._id === userStorage._id}
                />
              ))}
            </Grid2>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", p: 2 }}>
          <FavouriteMap />
        </Box>
      )}
    </div>
  );
}
export default ProfilePage;
