import "./FavouriteMapPage.css";
<<<<<<< HEAD
import React, { useState } from "react";
import { TextField, IconButton, Box } from "@mui/material";
import { styled } from "@mui/system";
import EmojiPicker from "emoji-picker-react";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import SendIcon from "@mui/icons-material/Send";

const StyleInput = styled(TextField)(({ theme }) => ({
    "& .MuiInputBase-input": {
        paddingTop: "10px",
        paddingBottom: "10px",
    },
}));

function FavouriteMapPage() {
    const [message, setMessage] = useState([]);
    const [showPicker, setShowPicker] = useState(false);

    const addEmoji = (emoji) => {
        setMessage(prev => prev + emoji.emoji); // Append selected emoji
        setShowPicker(false); // Hide picker after selection
    };

    const sendMessage = () => {
        if (!message.trim()) return; // Prevent empty messages
        console.log("Sending message:", message);
        setMessage(""); // Clear input after sending
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
            <Box sx={{ position: "relative", width: "100%", maxWidth: "500px", display: "flex", alignItems: "center" }}>
                <StyleInput
                    fullWidth
                    variant="outlined"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <IconButton onClick={() => setShowPicker(!showPicker)} sx={{ position: "absolute", right: "50px" }}>
                    <InsertEmoticonIcon />
                </IconButton>
                <IconButton onClick={sendMessage} sx={{ position: "absolute", right: "10px" }}>
                    <SendIcon />
                </IconButton>
            </Box>

            {showPicker && (
                <Box sx={{ position: "absolute", bottom: "60px", right: "20px", zIndex: 1000 }}>
                    <EmojiPicker onEmojiClick={addEmoji} />
                </Box>
            )}
        </Box>
    );
=======
import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
import HeaderProfile from "../components/HeaderProfile";
import FavouriteMap from "../components/FavouriteMap";
function FavouriteMapPage() {
    
      const userData = {
        name: 'Hadilao.vn',
        job: 'Nhà hàng lẩu Hadilao',
        followers: 1234,
        following: 567,
        posts: 9,
        socialLinks: [
            { platform: 'Facebook', url: 'https://facebook.com/username' },
            { platform: 'Twitter', url: 'https://twitter.com/username' },
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
        ]
    };
    return(
        <div>
        <HeaderProfile user={userData}/>
        <hr/>
        <FavouriteMap/>
        
    </div>
    )
>>>>>>> 035f23c2fa82cee6acab67a7f004ff960b6166fe
}
export default FavouriteMapPage