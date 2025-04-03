import React, { useState , useEffect} from "react";
import Sugesstions from "./Sugesstions";
import "./Timelinepostsaved.css";
import "./posts/Post";
import Post from "./posts/Post";
import MapUser from "./map/MapUser";
import axios from "axios";
function Timelinepostsaved({ currentUser }) {
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
    const [savedPosts, setSavedPosts] = useState([]); // State chứa danh sách bài post đã lưu

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

    useEffect(() => {
        axios.get(`http://localhost:5000/api/user/${currentUser}/savedPosts`)
            .then(res => setSavedPosts(res.data.savedPosts))
            .catch(err => console.error(err));
    }, [currentUser]);

    return(
        <div className="timeline">
            <div className="timeline__left">
                <div className="timeline__left__left">
                    <div className="timeline__title">
                        <span> What is here?</span>
                    </div>
                    <div className="timeline__posts">
                        {savedPosts.map((savedPosts,index) => (
                            <Post 
                            // key={index}
                            // user= {post.user}
                            // postImage={post.postImage} 
                            // likes={post.likes} 
                            // caption={post.caption}
                            // address={post.address}
                            // timestamp={post.timestamp}
                            key={savedPosts._id} 
                            user={savedPosts.userId} 
                            postImage={savedPosts.images[0]} 
                            likes={savedPosts.likes.count} 
                            caption={savedPosts.content}
                            address={savedPosts.location.name}
                            timestamp={new Date(savedPosts.createdAt).toLocaleDateString()} 
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
export default Timelinepostsaved