import React, { useState } from "react";
import Sugesstions from "./Sugesstions";
import "./Timeline.css";
import "./posts/Post";
import Post from "./posts/Post";
import MapUser from "./map/MapUser";
import Grid from "@mui/material/Grid"
function Timeline() {
    const [posts, setPosts] = useState([
        {
            user: "_dangnguyen",
            postImage:"https://th.bing.com/th/id/R.b7f3d67f12f2336f8c8f0f14aba94cec?rik=TRAvKbxESFS4LQ&pid=ImgRaw&r=0",
            likes: 12,
            caption:"New restaurant. So yummy!😋😋😋",
            address:"85 10th Ave, New York NY 10011",
            timestamp: "2d",
            is_voucher: false,
            is_ad: false
        },
        {
            user: "_tannguyen",
            postImage:"https://th.bing.com/th/id/OIP.IZHtC6WrJ3zcmF5xpnybKAHaFS?rs=1&pid=ImgDetMain",
            likes: 122,
            caption:"New restaurant. So yummy!😋😋😋",
            address:"85 10th Ave, New York NY 10011",
            timestamp: "3d",
            is_voucher: false,
            is_ad: false
        },
        {
            user: "_huythai",
            postImage:"https://i.pinimg.com/736x/aa/7c/94/aa7c94bfeec74330694bb1fb596afa64.jpg",
            likes: 50,
            caption:"New restaurant. So yummy!😋😋😋",
            address:"85 10th Ave, New York NY 10011",
            timestamp: "3d",
            is_voucher: false,
            is_ad: false
        },
        {
            user: "McDonald's",
            postImage: "https://i.pinimg.com/736x/a2/8c/94/a28c949fffdd59486dabcb0738f51bd1.jpg",
            likes: "2.5K",
            caption:"Nhận voucher nè mọi người ơi",
            address:"42 Đ. Phạm Văn Đồng, Hiệp Bình Chánh, Thủ Đức, Hồ Chí Minh 700000",
            timestamp: "2h",
            is_voucher: true,
            is_ad: false
        },
        {
            user: "lewishamilton",
            postImage: "https://i.pinimg.com/736x/0b/e4/7a/0be47ad5d2427db37badb02293b14fde.jpg",
            likes: "12.5K",
            caption:"New restaurant. So yummy!😋😋😋",
            address:"85 10th Ave, New York 10011",
            timestamp: "5h",
            is_voucher: false,
            is_ad: true
        },
    ]);
    return(
        <Grid container spacing={2}>
            <Grid item xs={8}>
                <div className="timeline">
                    <div className="timeline__left">
                        <div className="timeline__left__left">
                            <div className="timeline__title">
                                <span> What is here?</span>
                            </div>
                            <div className="timeline__posts">
                                {posts.map((post,index) => (
                                    <Post 
                                    key={index}
                                    user= {post.user}
                                    postImage={post.postImage} 
                                    likes={post.likes} 
                                    caption={post.caption}
                                    address={post.address}
                                    timestamp={post.timestamp}
                                    is_voucher={post.is_voucher}
                                    is_ad={post.is_ad}/>
                                ))}
                            </div>
                        </div>
                        
                    </div>
                </div>
            </Grid>
            <Grid item xs={4}>
                <div className="timeline__right">
                    <Sugesstions/>
                    <MapUser/>
                </div>
            </Grid>
        </Grid>
    )
}
export default Timeline