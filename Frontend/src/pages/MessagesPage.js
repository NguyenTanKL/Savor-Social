import React, { useState, useEffect, useRef} from "react";
import { styled } from '@mui/material/styles';
import EmojiPicker from 'emoji-picker-react';
import {
  Box,
  Toolbar,
  Typography,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Grid,
  Stack,
  Badge,
  ListItemAvatar,
  Divider,
  InputAdornment,
  Menu,
  MenuItem
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import VideocamIcon from '@mui/icons-material/Videocam';
import CallIcon from '@mui/icons-material/Call';
import InfoIcon from '@mui/icons-material/Info';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import ImageIcon from '@mui/icons-material/Image';
import GifIcon from '@mui/icons-material/Gif';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import axios from "axios";
import moment from "moment";
import io from "socket.io-client";
const socket = io("http://localhost:5000");

const CHAT_API_URL = "http://localhost:5000/api/chats";
const USER_API_URL = "http://localhost:5000/api/user";

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }));

  const StyleInput = styled(TextField)(({ theme }) => ({
    "& .MuiInputBase-input": {
        paddingTop: "10px",
        paddingBottom: "10px",
    }}))

    // list of account
const account = [
    {
        "id": "1",
        "img": "https://i.pinimg.com/736x/a6/38/65/a6386559df29f3b87e63b3a45e644a35.jpg",
        "name": "Lewis Hamilton",
        "message": "Delicious",
        "time": "05:10 PM",
    },
    {
        "id": "2",
        "img": "https://i.pinimg.com/236x/90/4b/3e/904b3e5afe3cd8dc0f3d77d25fd632d1.jpg",
        "name": "Lionel Messi",
        "message": "Delicious",
        "time": "05:10 PM",
    },
    {
        "id": "3",
        "img": "https://i.pinimg.com/236x/48/49/ba/4849ba2ea6517f805785071120cccc08.jpg",
        "name": "Cristiano Ronaldo",
        "message": "Delicious",
        "time": "05:10 PM",
    },
    {
        "id": "4",
        "img": "https://i.pinimg.com/236x/15/ee/25/15ee25561451d9b8ed1edf807dae9a46.jpg",
        "name": "McDonald's",
        "message": "Delicious",
        "time": "05:10 PM",
    }
];

    // attach file: photo/video, image, gif
const Actions = [
    {
        color: "#4da5fe",
        icon: <CameraAltIcon />,
        title: "Photo/Video"
    },
    {
        color: "#4da5fe",
        icon: <ImageIcon />,
        title: "Image"
    },
    {
        color: "#4da5fe",
        icon: <GifIcon />,
        title: "Gif"
    },
]

function MessagePage({ sender }) {
  const [type, setType] = useState();
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  const messagesEndRef = useRef(null);

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);

const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
};

  const handleMenuClose = () => {
    setAnchorEl(null);
};
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // Fetch messages when component mounts
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${CHAT_API_URL}/messages`, {
                    params: { sender, receiver: selectedReceiver },
                });
                
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [sender, selectedReceiver]); // Re-fetch when sender/receiver changes

    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            // console.log("Received new message:", message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    // Handle sending message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const messageData = {
                sender: sender,
                receiver: selectedReceiver,
                message: newMessage,
            };

            // Emit message to server using Socket.io
            socket.emit("sendMessage", messageData);

            const response = await axios.post(`${CHAT_API_URL}/send`, messageData);

            if (response.data.success) {
                const newMsg = {
                    sender: { _id: sender },  // Set sender correctly
                    message: newMessage,
                    createdAt: new Date().toISOString(),
                };
    
                setMessages((prevMessages) => [...prevMessages, newMsg]);
                setNewMessage(""); // Clear input after sending
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const [showPicker, setShowPicker] = useState(false);

    const addEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji.emoji); // Append selected emoji
    };
    
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollower = async () => {
        try {
          const token = localStorage.getItem("token"); // Retrieve stored token
          if (!token) {
            console.error("No token found! Redirecting to login...");
            return;
          }
    
          const { data } = await axios.get(`${USER_API_URL}/follower/${sender}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Attach token
              "Content-Type": "application/json",
            },
          });
    
          setFollowers(data);
        } catch (error) {
          console.error("Error fetching followers:", error.response?.data?.message || error.message);
        }
      };
    
      if (sender) fetchFollower(); // Only fetch if sender is valid
  }, [sender]);

  return (
    <Box style={{width: "100%", height: "100%", border: "none", borderLeft: "2px solid #ebedf0"}}>
        <Grid container >
            {/* list of account */}
            <Grid item xs={6} md={3.5}>
                <Box style={{ borderRight: "2px solid #ebedf0", height: "100%"}}>
                    <Toolbar style={{width: "100%", padding: "0", backgroundColor: "rgb(205, 224, 252)"}}>
                        <Typography
                            variant="h3"
                            style={{
                            fontFamily: 'Rochester, Arial, sans-serif',
                            fontWeight: 500,
                            marginLeft: "10px",
                            }}
                            className="rochester"
                        >
                            Chats
                        </Typography>
                    </Toolbar>
                    <Box style={{width: "100%", margin: "10px 0 0 10px"}}>
                        <Typography >
                            Friends
                        </Typography>
                        <Stack spacing={3} direction="row">
                        {followers.map((item) => (
                            <StyledBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                                >
                                <Avatar alt={item.name} src={item.img} />
                            </StyledBadge>
                            ))}
                        </Stack>
                        <br />
                        <Typography >
                            Messages
                        </Typography>
                        {followers.map((item) => (
                            <List sx={{ width: '100%', maxWidth: 350, bgcolor: 'background.paper' }}>
                                <ListItem onClick={() => {setType(item._id); setSelectedReceiver(item._id);}} style={{ backgroundColor: type == item._id ? "rgb(173, 202, 246)" : "#f0f0f0", borderRadius: "15px"}}>
                                    <Stack width={"100%"} direction={"row"} alignItems={"center"} justifyContent={"space-between"} spacing={5}>
                                        <Stack direction={"row"} spacing={0.3}>
                                            <ListItemAvatar>
                                                <StyledBadge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    variant="dot"
                                                    >
                                                    <Avatar alt={item.username} src={item.img} />
                                                </StyledBadge>
                                            </ListItemAvatar>
                                            <Stack spacing={0.3}>
                                                <ListItemText primary={item.username} secondary={item.message} />
                                            </Stack>
                                        </Stack>
                                        <Stack spacing={1.5} alignItems={"center"}>
                                            <Typography variant="caption" color="textSecondary">{item.time}</Typography>
                                            {/* <Badge badgeContent={2} color="primary" /> */}
                                        </Stack>
                                    </Stack>
                                </ListItem>
                            </List>
                        ))}
                    </Box>
                </Box>
            </Grid>
            {/* chat screen */}
            <Grid item xs={6} md={8.5}>
                <Box sx={{height: "64px", width: "100%", backgroundColor: "rgb(205, 224, 252)"}}>
                    <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} sx={{height: "100%", width: "100%"}}>
                        <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                <StyledBadge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                    style={{marginLeft: "10px"}}
                                    >
                                    <Avatar alt={account[0].name} src={account[0].img} />
                                </StyledBadge>
                            <Stack >
                                <Typography variant="subtitle1">{account[0].name}</Typography>
                                <Typography variant="caption" color="textSecondary">Online</Typography>
                            </Stack>
                        </Stack>
                        <Stack direction={"row"} spacing={2}>
                            <IconButton>
                                <VideocamIcon />
                            </IconButton>
                            <IconButton color="white">
                                <CallIcon />
                            </IconButton>
                            <Divider orientation="vertical" flexItem />
                            <IconButton>
                                <InfoIcon />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Box>
                <Box style={{width: "100%", height: "550px"}}>
                    <Box sx={{ flex: 1, overflowY: "auto", padding: "16px", maxHeight: "520px" }}>
                        <List>
                        {messages.map((message, index) => (
                            <ListItem
                            key={index}
                            sx={{
                                margin: "8px 0",
                                display: "flex",
                                justifyContent: message.sender._id === sender ? "flex-end" : "flex-start",
                                textAlign: message.sender._id === sender ? "right" : "left",
                            }}
                            >
                                <Stack direction={"row"} spacing={1} alignItems={"center"} justifyContent={"flex-end"}>
                                    <ListItemText
                                        secondary={
                                            <Typography variant="caption" color="textSecondary">
                                                {moment(message.createdAt).format("dddd DD/MM, HH:mm")}           
                                            </Typography>
                                        }
                                    />
                                    <Paper
                                    elevation={1}
                                    sx={{
                                        padding: "0 5px",
                                        backgroundColor:
                                        message.sender._id === sender ? "#d1e7ff" : "#EEEEEE",
                                        justifyContent:
                                        message.sender._id === sender ? "right" : "left",
                                        whiteSpace: "pre-line",
                                        wordBreak: "break-word",
                                        borderRadius: "15px",
                                        maxWidth: "350px"
                                    }}
                                    >
                                        {message.message && (
                                            <ListItemText
                                                primary={
                                                    <Typography sx={{ whiteSpace: "pre-line" }}>
                                                        {message.message}
                                                    </Typography>
                                                }
                                            />
                                        )}
                                        {message.fileUrl && (
                                            <>
                                                {message.fileType.startsWith("image/") ? (
                                                    <img
                                                        src={message.fileUrl}
                                                        alt="Uploaded file"
                                                        style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "5px" }}
                                                    />
                                                ) : message.fileType.startsWith("video/") ? (
                                                    <video
                                                        controls
                                                        src={message.fileUrl}
                                                        style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "5px" }}
                                                    />
                                                ) : (
                                                    <a href={message.fileUrl} download style={{ textDecoration: "none", color: "blue" }}>
                                                        📄 Download File
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </Paper>
                                </Stack>
                            </ListItem>
                            ))}
                            <div ref={messagesEndRef} />
                        </List>
                    </Box>
                </Box>
                <Box style={{height: "50px", width: "100%", position: "sticky", bottom: 0, right: 100}}>
                    <Stack>
                        {showPicker && (
                            <Box sx={{display: showPicker ? "inline" : "none", zIndex: 10, position: 'fixed', bottom: 102, right: 90}}>
                                <EmojiPicker onEmojiClick={addEmoji}/>
                            </Box>
                        )}
                    </Stack>
                    <Box sx={{
                        width: "100%",
                        display: "flex",
                        position: "sticky", 
                        bottom: 0, 
                        backgroundColor: "#fff" 
                        }}
                    >
                        <Stack direction={"row"} spacing={1} alignItems={"center"} width={"100%"}>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                {Actions.map((ele) => (
                                    <MenuItem>
                                        {ele.icon}{ele.title}
                                    </MenuItem>
                                ))}
                            </Menu>
                            <StyleInput
                            variant="outlined"
                            fullWidth
                            placeholder="Type a message..."
                            value={newMessage}
                            multiline={true}
                            type="small"
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{width: "100%", bottom: "0px", marginLeft: "10px"}}
                            InputProps={{
                                disableunderline: "true",
                                startAdornment:<InputAdornment position="start">
                                    <IconButton>
                                        <AttachFileIcon onClick={handleMenuClick}/>
                                    </IconButton>
                                </InputAdornment>,
                                endAdornment: <InputAdornment position="start">
                                    <IconButton>
                                        <AddReactionIcon onClick={() => setShowPicker(!showPicker)}/>
                                    </IconButton>
                                </InputAdornment>,
                            }}
                            />
                            <IconButton color="primary">
                                <SendIcon onClick={handleSendMessage}/>
                            </IconButton>
                        </Stack>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    </Box>
  );
};

export default MessagePage;