import React from "react";
import { useState, useEffect } from "react";
import "./ProfilePage.css";
import axios from "axios";
import { Avatar } from "@mui/material";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Grid2 from "@mui/material/Grid2";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from "@mui/material/Button";
import HeaderProfile from "../components/HeaderProfile";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TelegramIcon from "@mui/icons-material/Telegram";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import Rating from "@mui/material/Rating"

const userData = {
    name: 'Haidilao.vn',
    account_name: 'Haidilaovn',
    job: 'Nhà hàng lấu HAIDILAO VIETNAM',
    followers: '13.6K',
    following: '27',
    photoss: '9',
    socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/username' },
        { platform: 'Twitter', url: 'https://twitter.com/username' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
    ],
    is_res: true
};
const tabs  =  [
    { label: "Post", value: "photos" },
    { label: "Map", value: "map" },
    { label: "Tagged", value: "tagged" },
    { label: "Menu", value: "menu" },
];

function ProfilePage() {
    const [type, setType] = useState('photos');
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false); 
    const [anchorEl, setAnchorEl] = useState(null);

    const customBackdrop = {
        backdrop: {
            style: { backgroundColor: 'rgba(0, 0, 0, 0.1)' }
        },
    };

    const [samplePosts] = useState(() => Array.from({ length: 12 }, (_, index) => ({
        id: index, 
        image: "https://i.pinimg.com/736x/d5/d4/bb/d5d4bb7e8a83e3cc20f3383e4ca3e5c7.jpg"
    })));

    const [ratings, setRatings] = useState(
        samplePosts.reduce((acc, post) => ({ ...acc, [post.id]: 0 }), {})
      );
    
    const handleRatingChange = (id, newValue) => {
        setRatings((prevRatings) => ({ ...prevRatings, [id]: newValue }));
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
      const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return(
        <div className="profilepage">
            <HeaderProfile user= {userData}/>
            <div style={{ marginBottom: "20px" }}>
                {tabs.map((tab) => (
                <Button
                    key={tab.value}
                    size="small"
                    style={{
                    marginRight: "10px",
                    padding: "10px 20px",
                    background: type === tab.value ? "#333" : "#f0f0f0",
                    color: type === tab.value ? "#fff" : "#000",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    }}
                    onClick={() => setType(tab.value)}
                >
                    {tab.label}
                </Button>
                ))}
            </div>
            <div>
                {type === "photos" ? (
                <Grid2 container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {samplePosts.map((post) => (
                    <Grid2 item xs={4} sm={3} md={3} key={post.id}>
                        <Card>
                        <CardMedia
                            component="img"
                            height="250"
                            image={post.image}
                            alt={`Post ${post.id}`}
                            onClick={handleOpen}
                        />
                        </Card>
                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            open={open}
                            onClose={handleClose}
                            closeAfterTransition
                            slots={{ backdrop: Backdrop }}
                            slotProps={
                                customBackdrop
                            }
                        >
                            <Fade in={open}>
                            <Box sx={style}>
                            <Grid2 container spacing={1}>
                                <Grid2 size={7}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="500"
                                        width="500"
                                        image={post.image}
                                        alt={`Post ${post.id}`}
                                        onClick={handleOpen}
                                    />
                                    </Card>
                                </Grid2>
                                <Grid2 size={5}>
                                    <div className="post__header">
                                        <div className="post__headerAuthor">
                                            <Avatar alt="Lewis Hamilton" src="https://i.pinimg.com/736x/a6/38/65/a6386559df29f3b87e63b3a45e644a35.jpg" />
                                            lewishamilton<span> • 3d</span>
                                        </div>
                                        <MoreHorizIcon onClick={handleMenuClick}/>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleMenuClose}
                                        >
                                            <MenuItem onClick={handleMenuClose}>Report</MenuItem>
                                            <MenuItem onClick={handleMenuClose}>Option 2</MenuItem>
                                            <MenuItem onClick={handleMenuClose}>Option 3</MenuItem>
                                        </Menu>
                                    </div>
                                    <div className="post__address">
                                        <FmdGoodOutlinedIcon className="postIcon" color="action" /> 
                                        <span>85 10th Ave, New York NY 10011</span>
                                    </div>
                                    <div className="post__footer ">
                                        <div className="post__caption">
                                            <span>lewishamilton </span> New restaurant. So yummy!😋😋😋
                                        </div>
                                        <div className="post__comment">
                                            <span>View all 13,384 comments</span>
                                        </div>
                                        <div className="post_footerIcons">
                                            <div className="post__iconsMain">
                                                <FavoriteBorderIcon className="postIcon"/>
                                                <ChatBubbleOutlineIcon className="postIcon"/>
                                                <TelegramIcon className="postIcon"/>
                                            </div>
                                            <div className="post_iconSave">
                                                <MapOutlinedIcon className="postIcon" />    
                                                <FmdGoodOutlinedIcon className="postIcon" />
                                                <BookmarkBorderIcon className="postIcon" />
                                            </div>
                                        </div>
                                        <span className="post_likes">100K likes</span>
                                        <br/>
                                        <Rating
                                            name={`rating-${post.id}`}
                                            value={ratings[post.id]}
                                            precision={0.5}
                                            onChange={(event, newValue) => handleRatingChange(post.id, newValue)}
                                        />
                                        <div className="comment">
                                            <input placeholder="Add a comment…"  />
                                            <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled"/>
                                        </div>
                                    </div>
                                    <Card>
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            width="200"
                                            image="https://i.pinimg.com/736x/08/37/50/08375081614ed41a301851e60e3678f7.jpg"
                                            alt={`Post ${post.id}`}
                                            onClick={handleOpen}
                                        />
                                    </Card>
                                </Grid2>
                            </Grid2>
                            </Box>
                            </Fade>
                        </Modal>
                    </Grid2>
                    ))}
                </Grid2>
                
                ) : type === "map" ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <h3>Map content goes here</h3>
                    </div>
                ) : type === "tagged" ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <h3>Tagged content goes here</h3>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <h3>Menu content goes here</h3>
                    </div>
                )}
            </div>

        </div>
    )
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    bgcolor: 'background.paper',
    p: 1
};

export default ProfilePage