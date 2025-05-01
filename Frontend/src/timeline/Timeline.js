import React, { useState, useEffect } from "react";
import Sugesstions from "./Sugesstions";
import "./Timeline.css";
import "./posts/Post";
import Post from "./posts/Post";
import MapUser from "./map/MapUser";
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { getPostsAsync } from "../redux/Reducer/postSlice";
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
function Timeline() {
    const dispatch = useDispatch();
    useEffect(() => {
          // Dispatch action để lấy tất cả bài viết
          dispatch(getPostsAsync())
            .unwrap()
            .catch((err) => {
              console.error("Error fetching posts:", err);
            });

      }, [ dispatch]);
      const posts = useSelector(state => state.posts.posts || []);  console.log("postState:",posts);
      console.log("TimelinePost:",posts);
    const [selectedPostId, setSelectedPostId] = useState(null);
    // Gọi API lấy bài post từ backend
    // useEffect(() => {
    //     const fetchPosts = async () => {
    //         try {
    //             const response = await axios.get("http://localhost:5000/api/posts"); // Gọi API
    //             console.log("Dữ liệu từ API:", response.data);
    //             setPosts(response.data); // Cập nhật state với dữ liệu từ MongoDB
    //             setSelectedPostId(response.data[0]._id);
    //         } catch (error) {
    //             console.error("Lỗi khi lấy bài post:", error);
    //         }
    //     };

    //     fetchPosts();
    // }, []);

    return (
        <Grid container spacing={2}>
            <Grid item xs={6} md={8}>
                <div className="timeline__left">
                    <div className="timeline__title">
                        <span> What is here?</span>
                    </div>
                    <div className="timeline__posts">
                        {posts.map((post, index) => (
                            <Post
                                key={index}
                                user={post.userId}
                                postID={post._id}
                                postComment = {post.comments}
                                images={post.images || []}
                                likes={post.likes}
                                content={post.content}
                                tags = {post.tags}
                                taggedUsers={post.taggedUsers}
                                rating = {post.rating}
                                address={post.address}
                                timestamp={post.timestamp}
                                is_voucher={post.is_voucher}
                                is_ad={post.is_ad}
                                isSelected={selectedPostId === post._id} // Chỉ bài post đang chọn có `isSelected = true`
                                onSelect={() => setSelectedPostId(post._id)}
                                ad_id={post.ad_id}
                                voucher_id={post.voucher_id}
                                
                            />
                        ))}
                    </div>
                </div>
            </Grid>
            <Grid item xs={6} md={4}>
                <div className="timeline__right">
                    <Sugesstions />
                    <MapUser selectedPostId={selectedPostId} posts={posts} />
                </div>
            </Grid>
        </Grid>
    )
}
export default Timeline