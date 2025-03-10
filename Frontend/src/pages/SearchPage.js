import React, { useState } from "react";
import "./SearchPage.css";
import AccountUser from "../components/AccountUser";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";

function SearchPage() {
    const [isFocused, setIsFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([
        { username: "john_doe", nickname: "Friend" },
        { username: "jane_smith", nickname: "New to Instagram" },
    ]);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = (e) => {
        if (e.target.value === "") {
            setIsFocused(false);
          }
    };

    const handleClearAll = () => {
        setSearchResults([]);
    };

    return (
        <div className="search__tab">
            <div className="tab__header">
                <div>
                    <span>Search</span>
                </div>
            </div>
            <div className="tab__main">
                <div className="input__search0">
                    <div className="input__search1">
                        {isFocused ? (
                            <CancelIcon className="cancel-icon" />
                        ) : (
                            <SearchIcon className="search-icon" />
                        )}
                        <input
                            type="text"
                            placeholder="Search"
                            id="search-input"
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    </div>
                </div>
                <hr />
                <div className="history__search">
                    <div className="history__title">
                        <span>Recent</span>
                        <button className="clear__history" onClick={handleClearAll}>
                            Clear all
                        </button>
                    </div>
                    {searchResults.map((user, index) => (
                        <AccountUser
                            key={index}
                            username={user.username}
                            nickname={user.nickname}
                            isSearchList={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
