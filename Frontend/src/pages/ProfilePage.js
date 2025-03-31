import React, { useState, useEffect } from "react";
import {  useNavigate,useParams } from "react-router-dom";
import "./ProfilePage.css";
import { useDispatch, useSelector } from 'react-redux'
import axios from "axios";
import { Box, CircularProgress } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import HeaderProfile from "../components/HeaderProfile";
import ProfileTabs from "../components/ProfileTabs";
import FavouriteMap from "../components/FavouriteMap";
import ProfilePost from "../components/ProfilePost";

function ProfilePage() {
  const userStorage = useSelector(state => state.user.user);
  const [type, setType] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [data, setData] = useState([]);
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const { userId } = useParams();
  const dispatch = useDispatch();
  console.log("id:",userId )
  useEffect(() => {
    console.log("id:",userId )
    if (userId  !== userStorage._id) {
      // Nếu id khác userStorage._id => Lấy thông tin user khác
      axios.get(`http://localhost:5000/api/user/get-by-id/${userId}`)
        .then((response) => {
          setUser(response.data);
          console.log("user id:",userId);
          console.log("user api", response.data);
          setIsFollowing(response.data.isFollowing); // Kiểm tra trạng thái follow
        })
        .catch((error) => console.error("Error fetching user:", error));
    } else {
      console.log("userStore", userStorage)
      setUser(userStorage); // Nếu là chính user đang đăng nhập, lấy từ redux
      console.log("User:",user);
    }

  }, [userId , userStorage]);
  useEffect(() => {
    
    if (type === "posts") {
      setIsLoading(true); // Bắt đầu loading
      axios
        .get(`https://jsonplaceholder.typicode.com/photos?_limit=9`)
        .then((response) => {
          const updatedData = response.data.map((item) => ({
            ...item,
            thumbnailUrl:
              "https://th.bing.com/th/id/OIP.F48Ta-u-I74gaRY18l_8sAHaE8?rs=1&pid=ImgDetMain",
          }));
          setData(updatedData);
        })
        .catch(() => {
          const defaultData = Array.from({ length: 9 }, (_, index) => ({
            id: index + 1,
            thumbnailUrl:
              "https://th.bing.com/th/id/OIP.F48Ta-u-I74gaRY18l_8sAHaE8?rs=1&pid=ImgDetMain",
            title: `Default Image ${index + 1}`,
          }));
          setData(defaultData);
        })
        .finally(() => {
          setTimeout(() => setIsLoading(false), 500); // Dừng loading sau 0.5s
        });
    } else {
      setData([]);
    }
  }, [type]);

  return (
 
    <div className="profilepage">
      <HeaderProfile user={user} userId ={userId } />
      <ProfileTabs type={type} setType={setType} />

     

      {type === "posts" ? (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          {isLoading ? (
            <CircularProgress color="primary" />
          ) : (
            <Grid2
              container
              sx={{ justifyContent: "center", alignItems: "center", display: "grid", columnGap: 1, rowGap: 1, gridTemplateColumns: "repeat(3,1fr)" }}
            >
              {data.map((item) => (
                <ProfilePost key={item.id} item={item} />
              ))}
            </Grid2>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", p: 2 }}>
          <FavouriteMap />
        </Box>
      )}
    </div>
  );
}
export default ProfilePage;
