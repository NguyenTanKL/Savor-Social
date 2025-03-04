import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import axios from "axios";
import { Box, CircularProgress } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import HeaderProfile from "../components/HeaderProfile";
import ProfileTabs from "../components/ProfileTabs";
import FavouriteMap from "../components/FavouriteMap";
import ProfilePost from "../components/ProfilePost";
const userData = {
  name: "Thái Tăng Huy",
  job: "Food reviewer",
  followers: 1234,
  following: 567,
  posts: 9,
  socialLinks: [
    { platform: "Facebook", url: "https://facebook.com/username" },
    { platform: "Twitter", url: "https://twitter.com/username" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/username" },
  ],
};

function ProfilePage() {
  const [type, setType] = useState("posts");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading

  useEffect(() => {
    console.log(type);
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
      <HeaderProfile user={userData} />
      <ProfileTabs type={type} setType={setType} />

      {type === "posts" ? (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          {isLoading ? (
            <CircularProgress color="primary" /> // Hiển thị hiệu ứng loading
          ) : (
            <Grid2
              container
              direction="row"
              sx={{
                justifyContent: "center",
                alignItems: "center",
                display: "grid",
                columnGap: 1,
                rowGap: 1,
                gridTemplateColumns: "repeat(3,1fr)",
              }}
            >
              {data.map((item) => (
               <ProfilePost item={item}/>
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
