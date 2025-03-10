import "./FavouriteMapPage.css";
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
}
export default FavouriteMapPage