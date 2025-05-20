import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProfilePage.css";
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Drawer, IconButton, Button, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList"; // Icon bộ lọc
import Grid2 from "@mui/material/Grid2";
import { getPostsAsync } from "../redux/Reducer/postSlice";
import { updateUser } from "../redux/Reducer/userSlice";
import HeaderProfile from "../components/HeaderProfile";
import ProfileTabs from "../components/ProfileTabs";
import FavouriteMap from "../components/FavouriteMap";
import ProfilePost from "../components/ProfilePost";
import { BACKENDURL } from "../utils/const";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";

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

  // State cho bộ lọc thời gian
  const [dateRange, setDateRange] = useState([
    {
      startDate: null, // Ban đầu không lọc thời gian
      endDate: null,
      key: "selection",
    },
  ]);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State để kiểm soát panel bộ lọc
  const [filteredUserPosts, setFilteredUserPosts] = useState([]);
  const [filteredSavedPosts, setFilteredSavedPosts] = useState([]);
  const [filteredTaggedPosts, setFilteredTaggedPosts] = useState([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false); // State để kiểm soát trạng thái bộ lọc

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKENDURL}/api/user/get-by-id/${userId}`, {
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

  useEffect(() => {
    fetchUser();
  }, [userId, navigate]);

  useEffect(() => {
    if (type === "posts" || type === "saved" || type === "tagged") {
      dispatch(getPostsAsync({ userId, currentUserId: userStorage._id }))
        .unwrap()
        .catch((err) => {
          console.error("Error fetching posts:", err);
        });
    }
  }, [type, dispatch, userId, userStorage._id]);

  // Lọc bài viết của user cho tab "posts"
  const userPosts = useSelector((state) => state.posts.posts).filter((post) => {
    if (!user || !user._id) return false;
    if (userId === userStorage._id) {
      return post.userId === user._id;
    }
    return post.userId === user._id && post.visibility === 'public';
  });

  // Lấy bài viết đã lưu cho tab "saved"
  const savedPosts = useSelector((state) => state.posts.posts).filter((post) => {
    return user.savedPosts?.some((savedPost) => savedPost._id === post._id);
  });

  // Lấy bài viết mà user được tag cho tab "tagged"
  const taggedPosts = useSelector((state) => state.posts.posts).filter((post) => {
    return post.taggedUsers?.some((taggedUserId) => taggedUserId === user._id) && 
           (userId === userStorage._id || post.visibility === 'public');
  });

  // Chỉ khởi tạo danh sách bài post đã lọc khi dữ liệu gốc thay đổi và bộ lọc chưa được áp dụng
  useEffect(() => {
    if (!isFilterApplied) {
      console.log("Resetting filtered posts because filter is not applied");
      setFilteredUserPosts(userPosts);
      setFilteredSavedPosts(savedPosts);
      setFilteredTaggedPosts(taggedPosts);
    } else {
      console.log("Keeping filtered posts because filter is applied");
    }
  }, [userPosts, savedPosts, taggedPosts, isFilterApplied]);

  // Reset bộ lọc khi chuyển tab
  useEffect(() => {
    if (isFilterApplied) {
      console.log("Resetting filter because tab changed:", type);
      setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
      setIsFilterApplied(false);
      setFilteredUserPosts(userPosts);
      setFilteredSavedPosts(savedPosts);
      setFilteredTaggedPosts(taggedPosts);
    }
  }, [type]);

  // Hàm lọc bài post theo thời gian
  const filterPostsByDate = (postsToFilter) => {
    const { startDate, endDate } = dateRange[0];
    console.log("Filtering with date range:", { startDate, endDate }); // Debug
    if (!startDate || !endDate) {
      console.log("No date range selected, returning all posts");
      return postsToFilter; // Không lọc nếu không có khoảng thời gian
    }

    return postsToFilter.filter((post) => {
      const postDate = new Date(post.createdAt);
      console.log("Post createdAt:", post.createdAt, "Converted to:", postDate); // Debug
      if (isNaN(postDate)) {
        console.error("Invalid date for post:", post.createdAt);
        return false;
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Đảm bảo bao gồm toàn bộ ngày endDate

      console.log("Start date range:", start, "End date range:", end); // Debug
      const matchDate = postDate >= start && postDate <= end;
      console.log("Date match:", matchDate, "Post:", post._id); // Debug
      return matchDate;
    });
  };

  const applyFilter = () => {
    // Chỉ lọc cho tab hiện tại
    let filteredResults;
    if (type === "posts") {
      filteredResults = filterPostsByDate(userPosts);
      setFilteredUserPosts(filteredResults);
      console.log("Filtered user posts after apply:", filteredResults); // Debug
    } else if (type === "saved") {
      filteredResults = filterPostsByDate(savedPosts);
      setFilteredSavedPosts(filteredResults);
      console.log("Filtered saved posts after apply:", filteredResults); // Debug
    } else if (type === "tagged") {
      filteredResults = filterPostsByDate(taggedPosts);
      setFilteredTaggedPosts(filteredResults);
      console.log("Filtered tagged posts after apply:", filteredResults); // Debug
    }
    setIsFilterApplied(true); // Đánh dấu rằng bộ lọc đã được áp dụng
    setIsFilterOpen(false);
  };

  const cancelFilter = () => {
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    setIsFilterApplied(false);
    setFilteredUserPosts(userPosts);
    setFilteredSavedPosts(savedPosts);
    setFilteredTaggedPosts(taggedPosts);
    setIsFilterOpen(false);
    console.log("Filter cancelled, resetting posts");
  };

  const handlePostDelete = () => {};

  const handleUserUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKENDURL}/api/user/get-by-id/${userId}`, {
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
      
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
        <ProfileTabs type={type} setType={setType} />
        <IconButton
          color="primary"
          onClick={() => setIsFilterOpen(true)}
          aria-label="open filter"
          sx={{ ml: 2 }}
        >
          <FilterListIcon />
        </IconButton>
      </Box>

      <Drawer
        anchor="right"
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 350,
            p: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Filter by Date
          </Typography>
          <Box>
            <DateRange
              editableDateInputs={true}
              onChange={(item) => {
                console.log("DateRange onChange:", item.selection); // Debug
                setDateRange([item.selection]);
              }}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={cancelFilter}>
              Cancel
            </Button>
            <Button variant="contained" onClick={applyFilter}>
              Apply
            </Button>
          </Box>
        </Box>
      </Drawer>

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
              {filteredUserPosts.length === 0 ? (
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
                  {filteredUserPosts.map((post) => (
                    <ProfilePost
                      key={post._id}
                      postInfo={post}
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
              {filteredSavedPosts.length === 0 ? (
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
                  {filteredSavedPosts.map((post) => (
                    <ProfilePost
                      key={post._id}
                      postInfo={post}
                      usernamePost={user.username}
                      handlePostDelete={handlePostDelete}
                      canDelete={false}
                    />
                  ))}
                </Grid2>
              )}
            </Box>
          )}
          {type === "tagged" && (
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              {filteredTaggedPosts.length === 0 ? (
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
                  {filteredTaggedPosts.map((post) => (
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
        </>
      )}
    </div>
  );
}

export default ProfilePage;