import React, { useState , useEffect} from "react";
import Sugesstions from "./Sugesstions";
import "./Timeline.css";
import "./posts/Post";
import Post from "./posts/Post";
import MapUser from "./map/MapUser";
import axios from "axios";
function Timeline() {
    // const [posts, setPosts] = useState([
    //     {
    //         user: "_dangnguyen",
    //         postImage:"https://th.bing.com/th/id/R.b7f3d67f12f2336f8c8f0f14aba94cec?rik=TRAvKbxESFS4LQ&pid=ImgRaw&r=0",
    //         likes: 12,
    //         caption:"New restaurant. So yummy!😋😋😋",
    //         address:"85 10th Ave, New York NY 10011",
    //         timestamp: "2d"
    //     },
    //     {
    //         user: "_tannguyen",
    //         postImage:"https://th.bing.com/th/id/OIP.IZHtC6WrJ3zcmF5xpnybKAHaFS?rs=1&pid=ImgDetMain",
    //         likes: 122,
    //         caption:"New restaurant. So yummy!😋😋😋",
    //         address:"85 10th Ave, New York NY 10011",
    //         timestamp: "3d"
    //     },
    //     {
    //         user: "_huythai",
    //         postImage:"https://i.pinimg.com/736x/aa/7c/94/aa7c94bfeec74330694bb1fb596afa64.jpg",
    //         likes: 50,
    //         caption:"New restaurant. So yummy!😋😋😋",
    //         address:"85 10th Ave, New York NY 10011",
    //         timestamp: "3d"
    //     }
    // ]);
    const [posts, setPosts] = useState([]);

    // Gọi API lấy bài post từ backend
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/posts"); // Gọi API
                console.log("Dữ liệu từ API:", response.data);
                setPosts(response.data); // Cập nhật state với dữ liệu từ MongoDB
            } catch (error) {
                console.error("Lỗi khi lấy bài post:", error);
            }
        };

        fetchPosts();
    }, []);
    return(
        <div className="timeline">
            <div className="timeline__left">
                <div className="timeline__left__left">
                    <div className="timeline__title">
                        <span> What is here?</span>
                    </div>
                    <div className="timeline__posts">
                        {posts.map((post,index) => (
                            <Post 
                            // key={index}
                            // user= {post.user}
                            // postImage={post.postImage} 
                            // likes={post.likes} 
                            // caption={post.caption}
                            // address={post.address}
                            // timestamp={post.timestamp}
                            key={post._id} 
                            user={post.userId} 
                            postImage={post.images[0]} 
                            likes={post.likes.count} 
                            caption={post.content}
                            address={post.location.name}
                            timestamp={new Date(post.createdAt).toLocaleDateString()} 
                            
                            />
                        ))}
                    </div>
                </div>
                
            </div>
            <div className="timeline__right">
                <Sugesstions/>
                <MapUser/>
            </div>

        </div>
    )
}
export default Timeline