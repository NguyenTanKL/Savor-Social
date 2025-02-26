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
  Grid2,
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

function MessagePage() {
  const [type, setType] = useState();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How are you?", sender: "other", time: "00:00 AM" },
    { id: 2, text: "I'm good, thanks! How about you?", sender: "me", time: "00:01 AM" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const [openEmoji, setOpenEmoji] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages((prev) => [
        ...prev,
        { 
            id: Date.now(), 
            text: inputValue.trim(), 
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })    
        },
      ]);
      setInputValue("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);

const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
};

  const handleMenuClose = () => {
    setAnchorEl(null);
};

  return (
    <Box style={{width: "100%", height: "100%"}}>
        <Grid2 container >
            {/* list of account */}
            <Grid2 size={3.5}>
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
                        {account.map((item) => (
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
                        {account.map((item) => (
                            <List sx={{ width: '100%', maxWidth: 330, bgcolor: 'background.paper' }}>
                                <ListItem onClick={() => setType(item.id)} style={{ backgroundColor: type == item.id ? "rgb(173, 202, 246)" : "#f0f0f0", borderRadius: "15px" }}>
                                    <Stack width={"100%"} direction={"row"} alignItems={"center"} justifyContent={"space-between"} spacing={5}>
                                        <Stack direction={"row"} spacing={0.3}>
                                            <ListItemAvatar>
                                                <StyledBadge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    variant="dot"
                                                    >
                                                    <Avatar alt={item.name} src={item.img} />
                                                </StyledBadge>
                                            </ListItemAvatar>
                                            <Stack spacing={0.3}>
                                                <ListItemText primary={item.name} secondary={item.message} />
                                            </Stack>
                                        </Stack>
                                        <Stack spacing={1.5} alignItems={"center"}>
                                            <Typography variant="caption" color="textSecondary">{item.time}</Typography>
                                            <Badge badgeContent={2} color="primary" />
                                        </Stack>
                                    </Stack>
                                </ListItem>
                            </List>
                        ))}
                    </Box>
                </Box>
            </Grid2>
            {/* chat screen */}
            <Grid2 size={8.5}>
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
                        {messages.map((message) => (
                            <ListItem
                            key={message.id}
                            sx={{
                                margin: "8px 0",
                                display: "flex",
                                justifyContent: message.sender === "me" ? "flex-end" : "flex-start",
                                textAlign: message.sender === "me" ? "right" : "left",
                            }}
                            >
                                <Stack direction={"row"} spacing={1} alignItems={"center"} justifyContent={"flex-end"}>
                                    <ListItemText
                                        secondary={
                                            <Typography variant="caption" color="textSecondary">
                                                {message.time}
                                            </Typography>
                                        }
                                    />
                                    <Paper
                                    elevation={1}
                                    sx={{
                                        padding: "0 5px",
                                        backgroundColor:
                                        message.sender === "me" ? "#d1e7ff" : "#EEEEEE",
                                        justifyContent:
                                        message.sender === "me" ? "right" : "left",
                                        whiteSpace: "pre-line",
                                        wordBreak: "break-word",
                                        borderRadius: "15px",
                                    }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography sx={{ whiteSpace: "pre-line" }}>
                                                    {message.text}
                                                </Typography>
                                            }
                                            
                                        />
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
                        <Box sx={{display: openEmoji ? "inline" : "none", zIndex: 10, position: 'fixed', bottom: 102, right: 90}}>
                            <EmojiPicker />
                        </Box>
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
                                    <MenuItem onClick={handleMenuClose}>{ele.icon}{ele.title}</MenuItem>
                                ))}
                            </Menu>
                            <StyleInput
                            variant="outlined"
                            fullWidth
                            placeholder="Type a message..."
                            value={inputValue}
                            multiline={true}
                            type="small"
                            onChange={(e) => setInputValue(e.target.value)}
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
                                        <AddReactionIcon onClick={() => {
                                            setOpenEmoji(prev => !prev)
                                        }}/>
                                    </IconButton>
                                </InputAdornment>,
                            }}
                            />
                            <IconButton color="primary">
                                <SendIcon onClick={handleSend}/>
                            </IconButton>
                        </Stack>
                    </Box>
                </Box>
            </Grid2>
        </Grid2>
    </Box>
  );
};

export default MessagePage;