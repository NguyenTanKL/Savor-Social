import React, { useEffect, useState } from "react";
import { BACKENDURL } from "../../utils/const";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Drawer,
  IconButton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList"; // Icon bộ lọc
import ProfilePost from "../../components/ProfilePost";
import Grid2 from "@mui/material/Grid2";
import "./TagPage.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";

function TagPage() {
  const { tagName } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState([
    {
      startDate: null, // Ban đầu không đặt giá trị mặc định
      endDate: null,
      key: "selection",
    },
  ]);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State để kiểm soát panel bộ lọc

  useEffect(() => {
    const fetchPostsByTag = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching posts for tag:", tagName);
        const response = await axios.post(
          `${BACKENDURL}/api/user/search`,
          { tag: tagName },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        console.log("API response:", response.data);
        const fetchedPosts = response.data.posts || [];
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts); // Hiển thị tất cả bài post ban đầu
      } catch (error) {
        console.error("Error fetching posts by tag:", error);
        setError("Failed to load posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostsByTag();
  }, [tagName]);

  // Loại bỏ useEffect gọi filterPosts mặc định
  // useEffect(() => {
  //   filterPosts();
  // }, [dateRange, userTypeFilter, posts]);

  const filterPosts = () => {
    const { startDate, endDate } = dateRange[0];

    // Nếu startDate hoặc endDate là null, không áp dụng lọc thời gian
    if (!startDate || !endDate) {
      setFilteredPosts(posts); // Hiển thị tất cả nếu không có khoảng thời gian
      return;
    }

    const filtered = posts.filter((post) => {
      const postDate = new Date(post.createdAt);
      if (isNaN(postDate)) {
        console.error("Invalid date for post:", post.createdAt);
        return false;
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const matchUserType =
        userTypeFilter === "all" || post.userId.usertype === userTypeFilter;
      const matchDate = postDate >= start && postDate <= end;
      return matchUserType && matchDate;
    });

    setFilteredPosts(filtered);
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleUserTypeChange = (event) => {
    setUserTypeFilter(event.target.value);
  };

  const handleApplyFilter = () => {
    filterPosts();
    setIsFilterOpen(false); // Đóng panel sau khi áp dụng
  };

  const handleCancelFilter = () => {
    // Reset dateRange về null khi hủy để không áp dụng lọc thời gian
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    setUserTypeFilter("all"); // Reset userTypeFilter về mặc định
    setFilteredPosts(posts); // Hiển thị tất cả bài post
    setIsFilterOpen(false); // Đóng panel
  };

  return (
    <div className="tag-page">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          #{tagName}
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setIsFilterOpen(true)}
          aria-label="open filter"
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
            Bộ lọc
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="user-type-filter-label">Filter by User Type</InputLabel>
            <Select
              labelId="user-type-filter-label"
              value={userTypeFilter}
              label="Filter by User Type"
              onChange={handleUserTypeChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="restaurant">Restaurant</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              Chọn khoảng thời gian:
            </Typography>
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={handleCancelFilter}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleApplyFilter}>
              Apply
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        {isLoading ? (
          <CircularProgress color="primary" />
        ) : error ? (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <p>{error}</p>
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <p>No posts available for this filter.</p>
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
            {filteredPosts.map((post) => (
              <ProfilePost
                key={post._id}
                postInfo={post}
                onClick={() => handlePostClick(post._id)}
              />
            ))}
          </Grid2>
        )}
      </Box>
    </div>
  );
}

export default TagPage;