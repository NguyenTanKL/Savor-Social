import React, { useState, useEffect, useCallback, useRef } from "react";
import Sugesstions from "./Sugesstions";
import "./Timeline.css";
import Post from "./posts/Post";
import MapUser from "./map/MapUser";
import { useDispatch, useSelector } from 'react-redux';
import { getRecommendedPostsAsync, loadMorePosts } from "../redux/Reducer/postSlice";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

function Timeline() {
  const dispatch = useDispatch();
  const recommendedPosts = useSelector((state) => state.posts.recommendedPosts || []);
  const loading = useSelector((state) => state.posts.loading);
  const error = useSelector((state) => state.posts.error);
  const page = useSelector((state) => state.posts.page);
  const hasMore = useSelector((state) => state.posts.hasMore);

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [directionsData, setDirectionsData] = useState(null);
  const observerRef = useRef(null);
  const hasLoadedInitial = useRef(false);

  console.log("recommendedPosts:", recommendedPosts);
  console.log("Current state:", { page, loading, hasMore });

  const loadPosts = useCallback(() => {
    if (loading || !hasMore || hasLoadedInitial.current) return;
    console.log("Dispatching getRecommendedPostsAsync for page:", page);
    dispatch(getRecommendedPostsAsync(page));
    hasLoadedInitial.current = true;
  }, [dispatch, page, loading, hasMore]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log("Last post visible, dispatching loadMorePosts for page:", page + 1);
          dispatch(loadMorePosts());
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, dispatch, page]
  );

  useEffect(() => {
    if (recommendedPosts.length > 0 && !selectedPostId) {
      setSelectedPostId(recommendedPosts[0]._id);
    }
  }, [recommendedPosts, selectedPostId]);

  const handlePostSelect = (data) => {
    console.log("handlePostSelect received:", data);
    if (data?.action === "showDirections" && data.coordinates) {
      console.log("Setting directionsData:", data.coordinates);
      setDirectionsData(data.coordinates);
      if (data.postId) {
        console.log("Setting selectedPostId:", data.postId);
        setSelectedPostId(data.postId);
      }
    } else {
      setSelectedPostId(data?.postId || data);
    }
  };

  if (error) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} md={8}>
        <div className="timeline__left">
          <div className="timeline__title">
            <span>What is here?</span>
          </div>
          <div className="timeline__posts">
            {recommendedPosts.map((post, index) => {
              const isLastElement = recommendedPosts.length === index + 1;
              return (
                <div
                  key={post._id}
                  ref={isLastElement ? lastPostElementRef : null}
                >
                  <Post
                    user={post.userId}
                    postID={post._id}
                    postComment={post.comments}
                    images={post.images || []}
                    likes={post.likes}
                    content={post.content}
                    tags={post.tags}
                    taggedUsers={post.taggedUsers}
                    rating={post.rating}
                    address={post.location?.address}
                    timestamp={post.createdAt}
                    is_voucher={post.is_voucher}
                    is_ad={post.is_ad}
                    isSelected={selectedPostId === post._id}
                    onSelect={handlePostSelect}
                    ad_id={post.ad_id}
                    voucher_id={post.voucher_id}
                  />
                </div>
              );
            })}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}
            {!hasMore && recommendedPosts.length > 0 && (
              <Typography sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                No more posts to load.
              </Typography>
            )}
            {recommendedPosts.length === 0 && !loading && (
              <Typography sx={{ textAlign: 'center', mt: 2 }}>
                No recommended posts available.
              </Typography>
            )}
          </div>
        </div>
      </Grid>
      <Grid item xs={6} md={4}>
        <div className="timeline__right">
          <Sugesstions />
          <MapUser selectedPostId={selectedPostId} posts={recommendedPosts} directionsData={directionsData} />
        </div>
      </Grid>
    </Grid>
  );
}

export default Timeline;