import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2"; // Import Grid2 giống ProfilePage
import "./TagPage.css";
import ProfilePost from "../../components/ProfilePost";
function TagPage() {
  const { tagName } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostsByTag = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          "http://localhost:5000/api/user/search",
          { tag: tagName },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching posts by tag:", error);
        setError("Failed to load posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostsByTag();
  }, [tagName]);

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="tag-page">
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        #{tagName}
      </Typography>
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        {isLoading ? (
          <CircularProgress color="primary" />
        ) : error ? (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <p>{error}</p>
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <p>No posts available for this tag.</p>
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
            {posts.map((post) => (
              <ProfilePost
              key={post._id}
              postInfo={post}
              usernamePost={post.userId.username}
              />
            ))}
          </Grid2>
        )}
      </Box>
    </div>
  );
}

export default TagPage;