import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./SharePost.css";
import "../timeline/posts/Post";
import Post from "../timeline/posts/Post";
import axios from "axios";
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"

const POST_API_URL = "http://localhost:5000/api/posts"; // Địa chỉ API của bạn

function SharePost() {
    const token = localStorage.getItem("token");
    const { postId } = useParams();
    const [post, setPost] = useState(null); // State chứa danh sách bài post đã lưu
    const [selectedPostId, setSelectedPostId] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${POST_API_URL}/get/${postId}`, {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
                setPost(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        
        fetchPost();
    }, [postId]); // Chỉ gọi lại khi postId thay đổi
    console.log("Dữ liệu từ API:", post);

    if (!post) {
        return <div>Loading...</div>;  // Display loading if post is not yet available
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={6} md={8}>
                <div className="timeline__left__left">
                    <div className="timeline__title">
                        <span> What is here?</span>
                    </div>
                    <div className="timeline__posts">
                            <Post
                                user={post.userId}
                                postID={post._id}
                                images={post.images}
                                likes={post.likes}
                                caption={post.caption}
                                address={post.address}
                                timestamp={post.timestamp}
                                is_voucher={post.is_voucher}
                                is_ad={post.is_ad}
                                isSelected={selectedPostId === post._id} // Chỉ bài post đang chọn có `isSelected = true`
                                onSelect={() => setSelectedPostId(post._id)}
                                ad_id={post.ad_id}
                                voucher_id={post.voucher_id}
                            />
                    </div>
                </div>

            </Grid>
        </Grid>
    )
}
export default SharePost