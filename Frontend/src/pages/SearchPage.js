import React, { useRef, useState } from "react";
import axios from "axios";
import "./SearchPage.css";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import FriendCard from "../components/friend/FriendCard";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
} from "@mui/material";

function SearchPage({ onClose }) {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState({ users: [], tags: [], posts: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Debug prop onClose
  console.log("SearchPage props:", { onClose });

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    if (e.target.value === "") setIsFocused(false);
  };

  const handleClearAll = () => {
    setSearchResults({ users: [], tags: [], posts: [] });
    setIsLoading(false);
  };

  const handleSearch = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    const normalizedKeyword = keyword
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

    if (normalizedKeyword === "") {
      setSearchResults({ users: [], tags: [], posts: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching data with keyword:", normalizedKeyword);
      const response = await axios.post(
        "http://localhost:5000/api/user/search",
        { query: normalizedKeyword },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Search result:", response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    console.log("Handling tag click:", tag);
    const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;
    const normalizedTag = cleanTag.toLowerCase().replace(/\s/g, "");
    onClose(); // Đóng SearchPage trước
    navigate(`/explore/${normalizedTag}`);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setSearchResults({ users: [], tags: [], posts: [] });
    setIsLoading(false);
    inputRef.current.focus();
  };

  const handleUserClick = (userId) => {
    console.log("Handling user click:", userId);
    onClose(); // Đóng SearchPage trước
    navigate(`/profile/${userId}`);
  };

  const formatPostCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="search__tab">
      <div className="tab__header">
        <span>Search</span>
      </div>
      <div className="tab__main">
        <div className="input__search0">
          <div className="input__search1">
            {searchTerm ? (
              <CancelIcon className="cancel-icon" onClick={handleClearInput} />
            ) : (
              <SearchIcon className="search-icon" />
            )}
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              onFocus={handleFocus}
              onBlur={handleBlur}
              ref={inputRef}
            />
          </div>
        </div>
        <hr />
        <div className="history__search">
          <div className="history__title">
            <span>Results</span>
            <button className="clear__history" onClick={handleClearAll}>
              Clear all
            </button>
          </div>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : searchResults.users.length > 0 || searchResults.tags.length > 0 ? (
            <>
              {searchResults.users.length > 0 && (
                <>
                  {searchResults.users.map((user, index) => (
                    <FriendCard
                      key={index}
                      friendInfo={user}
                      isSearchList={true}
                      onUserClick={handleUserClick}
                    />
                  ))}
                </>
              )}
              {searchResults.tags.length > 0 && (
                <>
                  <List dense>
                    {searchResults.tags.map((tagInfo, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleTagClick(tagInfo.tag)}
                        sx={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <ListItemText primary={tagInfo.tag} />
                        <Typography variant="body2" color="textSecondary">
                          {formatPostCount(tagInfo.postCount)} posts
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;