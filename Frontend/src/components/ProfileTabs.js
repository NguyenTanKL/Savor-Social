import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import MapIcon from "@mui/icons-material/Map";

// Component hiển thị nội dung theo tab được chọn



function ProfileTabs({ type, setType }) {

  const handleChange = (event, newValue) => {
    setType(newValue);
  };

  return (
    <Box sx={{ width: "100%", backgroundColor: "#000", color: "#fff" }}>
      <Tabs
        value={type}
        onChange={handleChange}
        centered
        TabIndicatorProps={{
          style: { backgroundColor: "black" },
        }}
        sx={{
          color: "rgb(115, 115, 115)",
          fontSize: "12px",
          fontWeight: "bold",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          "& .MuiTabs-indicator": {
            top: 0, // Đưa thanh trượt lên trên đầu
          },
        }}
      >
        <Tab
          icon={<GridViewIcon />}
          sx={{
            color: "rgb(115, 115, 115)",
       
            marginRight: "60px",
            "&.Mui-selected": {
              color: "black",
            },
          }}
          iconPosition="start"
          label="POSTS"
          value="posts"
        />
        <Tab
          icon={<MapIcon />}
          sx={{
            color: "rgb(115, 115, 115)",
          
            "&.Mui-selected": {
              color: "black",
            },
          }}
          iconPosition="start"
          label="MAP"
          value="map"
        />
      </Tabs>
    </Box>
  );
}

export default ProfileTabs;
