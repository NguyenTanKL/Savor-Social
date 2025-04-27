import React, { useState, useEffect } from "react";
import Sugesstions from "./Sugesstions";
import "./Timelinepostsaved.css";
import "./posts/Post";
import Post from "./posts/Post";
import MapUser from "./map/MapUser";
import axios from "axios";
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
function Timelinepostsaved() {
    
    const [savedPosts, setSavedPosts] = useState([]); // State chứa danh sách bài post đã lưu
    const [selectedPostId, setSelectedPostId] = useState(null);
    // useEffect(() => {
    //     const fetchSavedPosts = async () => {
    //         try {
    //             const userId = "67b15f306d55edda5de4cde8"; // ID user, có thể lấy từ state hoặc localStorage
    //             const response = await axios.get(`http://localhost:5000/api/users/${userId}/savedPosts`);
    //             console.log("Bài post đã lưu:", response.data);
    //             setSavedPosts(response.data);
    //         } catch (error) {
    //             console.error("Lỗi khi lấy bài post đã lưu:", error);
    //         }
    //     };

    //     fetchSavedPosts();
    // }, []);
    const userFromStorage = localStorage.getItem("user");
    let user_
    let userId_
    if (userFromStorage) {
        user_ = JSON.parse(userFromStorage); // Chuyển từ JSON string thành object
        userId_ = user_._id; // Lấy id từ object
        console.log("User ID:", userId_);
    } else {
        console.log("Không tìm thấy user trong localStorage");
    }
    useEffect(() => {
        axios.get(`http://localhost:5000/api/user/${userId_}/savedPosts/detail`)
            .then(res => {
                setSavedPosts(res.data.savedPosts);
                if (res.data.savedPosts.length > 0) {
                    setSelectedPostId(res.data.savedPosts[0]._id);
                }
            })
            .catch(err => console.error(err));
    }, [userId_]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={6} md={8}>
                <div className="timeline__left__left">
                    <div className="timeline__title">
                        <span> What is here?</span>
                    </div>
                    <div className="timeline__posts">
                        {savedPosts.map((savedPosts, index) => (
                            <Post
                                key={index}

                                user={savedPosts.userId}
                                postID={savedPosts._id}
                                images={savedPosts.images}
                                likes={savedPosts.likes}
                                caption={savedPosts.caption}
                                address={savedPosts.address}
                                timestamp={savedPosts.timestamp}
                                is_voucher={savedPosts.is_voucher}
                                is_ad={savedPosts.is_ad}
                                isSelected={selectedPostId === savedPosts._id} // Chỉ bài post đang chọn có `isSelected = true`
                                onSelect={() => setSelectedPostId(savedPosts._id)}
                                ad_id={savedPosts.ad_id}
                                voucher_id={savedPosts.voucher_id}
                            />
                        ))}
                    </div>
                </div>

            </Grid>
            <Grid item xs={6} md={4}>
                <div className="timeline__right">
                    <Sugesstions />
                    <MapUser selectedPostId={selectedPostId} posts={savedPosts} />
                </div>
            </Grid>
        </Grid>
    )
}
export default Timelinepostsaved