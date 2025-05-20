import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import MapIcon from "@mui/icons-material/Map";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import TagIcon from "@mui/icons-material/Tag";

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
            "&.Mui-selected": {
              color: "black",
            },
          }}
          iconPosition="start"
          label="POSTS"
          value="posts"
        />
        <Tab
          icon={<BookmarkIcon />}
          sx={{
            color: "rgb(115, 115, 115",
            marginRight: "60px",
            "&.Mui-selected": {
              color: "black",
            },
          }}
          iconPosition="start"
          label="SAVED"
          value="saved"
        />
        <Tab
          icon={<TagIcon />}
          sx={{
            color: "rgb(115, 115, 115",
            "&.Mui-selected": {
              color: "black",
            },
          }}
          iconPosition="start"
          label="TAGGED"
          value="tagged"
        />
      </Tabs>
    </Box>
  );
}

export default ProfileTabs;