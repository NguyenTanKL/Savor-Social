// // src/pages/ProfilePage.js
// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import "./ProfilePage.css";
// import { useDispatch, useSelector } from 'react-redux';
// import { Box, CircularProgress } from "@mui/material";
// import Grid2 from "@mui/material/Grid2";
// import { getPostsAsync } from "../redux/Reducer/postSlice";
// import { updateUser } from "../redux/Reducer/userSlice";
// import HeaderProfile from "../components/HeaderProfile";
// import ProfileTabs from "../components/ProfileTabs";
// import FavouriteMap from "../components/FavouriteMap";
// import ProfilePost from "../components/ProfilePost";


// function ProfilePage() {
//   const userStorage = useSelector((state) => state.user.user) || {};
//   const postState = useSelector((state) => state.posts.posts || []);
//   const { posts, loading: isLoading, error } = postState;
//   const [type, setType] = useState("posts");
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [user, setUser] = useState({});
//   const { userId } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const fetchUser = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`http://localhost:5000/api/user/get-by-id/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!response.ok) {
//         throw new Error("Failed to fetch user");
//       }
//       const data = await response.json();
//       setUser(data);
//       setIsFollowing(data.isFollowing);
//       // Cập nhật userStorage nếu đây là profile của user đang đăng nhập
//       if (userId === userStorage._id) {
//         dispatch(updateUser(data));
//       }
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       navigate("/login");
//     }
//   };

//   // Fetch user mỗi lần vào trang, không phụ thuộc vào userStorage
//   useEffect(() => {
//     fetchUser();
//   }, [userId, navigate]);

//   useEffect(() => {
//     if (type === "posts") {
//       dispatch(getPostsAsync())
//         .unwrap()
//         .catch((err) => {
//           console.error("Error fetching posts:", err);
//         });
//     }
//   }, [type, dispatch]);

//   const userPosts = useSelector((state) => state.posts.posts).filter((post) => {
//     if (user) return post.userId == user._id;
//   });

//   const handlePostDelete = () => {};

//   const handleUserUpdate = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`http://localhost:5000/api/user/get-by-id/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!response.ok) {
//         throw new Error("Failed to fetch user");
//       }
//       const updatedUser = await response.json();
//       setUser(updatedUser);
//       if (userId === userStorage._id) {
//         dispatch(updateUser(updatedUser));
//       }
//     } catch (error) {
//       console.error("Error updating user:", error);
//     }
//   };

//   return (
//     <div className="profilepage">
//       <HeaderProfile user={user} userId={userId} onUserUpdate={handleUserUpdate} />
//       <ProfileTabs type={type} setType={setType} />

//       {type === "posts" ? (
//         <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
//           {isLoading ? (
//             <CircularProgress color="primary" />
//           ) : error ? (
//             <Box sx={{ textAlign: "center", p: 2 }}>
//               <p>Error loading posts: {error.message || "Something went wrong"}</p>
//             </Box>
//           ) : userPosts.length === 0 ? (
//             <Box sx={{ textAlign: "center", p: 2 }}>
//               <p>No posts available.</p>
//             </Box>
//           ) : (
//             <Grid2
//               container
//               sx={{
//                 justifyContent: "center",
//                 alignItems: "center",
//                 display: "grid",
//                 columnGap: 1,
//                 rowGap: 1,
//                 gridTemplateColumns: "repeat(3, 1fr)",
//               }}
//             >
//               {userPosts.map((post) => (
//                 <ProfilePost
//                   key={post._id}
//                   postInfo={post}
//                   usernamePost={user.username}
//                   handlePostDelete={handlePostDelete}
//                   canDelete={post.userId === userStorage._id}
//                 />
//               ))}
//             </Grid2>
//           )}
//         </Box>
//       ) : (
//         <Box sx={{ textAlign: "center", p: 2 }}>
//           <FavouriteMap />
//         </Box>
//       )}
//     </div>
//   );
// }
// export default ProfilePage;
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProfilePage.css";
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { getPostsAsync } from "../redux/Reducer/postSlice";
import { updateUser } from "../redux/Reducer/userSlice";
import HeaderProfile from "../components/HeaderProfile";
import ProfileTabs from "../components/ProfileTabs";
import FavouriteMap from "../components/FavouriteMap";
import ProfilePost from "../components/ProfilePost";

function ProfilePage() {
  const userStorage = useSelector((state) => state.user.user) || {};
  const postState = useSelector((state) => state.posts.posts || []);
  const { posts, loading: isLoading, error } = postState;
  const [type, setType] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState({});
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/user/get-by-id/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUser(data);
      setIsFollowing(data.isFollowing);
      if (userId === userStorage._id) {
        dispatch(updateUser(data));
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  // Fetch user mỗi lần vào trang
  useEffect(() => {
    fetchUser();
  }, [userId, navigate]);

  // Fetch posts khi cần (cho posts, saved, tagged)
  useEffect(() => {
    if (type === "posts" || type === "saved" || type === "tagged") {
      dispatch(getPostsAsync())
        .unwrap()
        .catch((err) => {
          console.error("Error fetching posts:", err);
        });
    }
  }, [type, dispatch]);


  // Lọc bài viết của user cho tab "posts"
  const userPosts = useSelector((state) => state.posts.posts).filter((post) => {
    if (user) return post.userId === user._id;
  });
  console.log("userPost:",userPosts);
  console.log("user:",user);

  // Lấy bài viết đã lưu cho tab "saved"
  const savedPosts = useSelector((state) => state.posts.posts).filter((post) => {
    return user.savedPosts?.some((savedPost) => savedPost._id === post._id);
  });

  // Lấy bài viết mà user được tag cho tab "tagged"
  const taggedPosts = useSelector((state) => state.posts.posts).filter((post) => {
    return post.taggedUsers?.some((taggedUserId) => taggedUserId === user._id);
  });

  const handlePostDelete = () => {};

  const handleUserUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/user/get-by-id/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const updatedUser = await response.json();
      setUser(updatedUser);
      if (userId === userStorage._id) {
        dispatch(updateUser(updatedUser));
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="profilepage">
      <HeaderProfile user={user} userId={userId} onUserUpdate={handleUserUpdate} />
      <ProfileTabs type={type} setType={setType} />

      {isLoading ? (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", p: 2 }}>
          <p>Error loading posts: {error.message || "Something went wrong"}</p>
        </Box>
      ) : (
        <>
          {type === "posts" && (
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              {userPosts.length === 0 ? (
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
                      usernamePost={user.username}
                      handlePostDelete={handlePostDelete}
                      canDelete={post.userId === userStorage._id}
                    />
                  ))}
                </Grid2>
              )}
            </Box>
          )}
          {type === "map" && (
            <Box sx={{ textAlign: "center", p: 2 }}>
              <FavouriteMap />
            </Box>
          )}
          {type === "saved" && (
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              {savedPosts.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <p>No saved posts available.</p>
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
                  {savedPosts.map((post) => (
                    <ProfilePost
                      key={post._id}
                      postInfo={post}
                      usernamePost={user.username}
                      handlePostDelete={handlePostDelete}
                      canDelete={false} // Không cho phép xóa từ tab saved
                    />
                  ))}
                </Grid2>
              )}
            </Box>
          )}
          {type === "tagged" && (
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              {taggedPosts.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <p>No tagged posts available.</p>
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
                  {taggedPosts.map((post) => (
                    <ProfilePost
                      key={post._id}
                      postInfo={post}
                      usernamePost={user.username}
                      handlePostDelete={handlePostDelete}
                      canDelete={post.userId === userStorage._id} // Chỉ cho phép xóa nếu là chủ bài viết
                    />
                  ))}
                </Grid2>
              )}
            </Box>
          )}
        </>
      )}
    </div>
  );
}
export default ProfilePage;