import React, { useRef, useState } from "react";
import axios from "axios";
import "./SearchPage.css";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import FriendCard from "../components/friend/FriendCard";
import { useNavigate } from "react-router-dom";

function SearchPage() {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    if (e.target.value === "") setIsFocused(false);
  };

  const handleClearAll = () => setSearchResults([]);

  const handleSearch = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      console.log("Fetching data...");
      const response = await axios.post("http://localhost:5000/api/user/search", { keyword });
      console.log("Search result:", response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setSearchResults([]);
    inputRef.current.focus();
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchTerm("");
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
          {searchResults.length > 0 ? (
            searchResults.map((user, index) => (
              <FriendCard
                key={index}
                friendInfo={user}
                isSearchList={true}
                onUserClick={handleUserClick} // Truyền handleUserClick vào FriendCard
              />
            ))
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;