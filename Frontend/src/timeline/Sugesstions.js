    import React, { useEffect, useState, useMemo } from "react";
    import "./Sugesstions.css";
    import AccountUser from "../components/AccountUser";
    import { Avatar, CircularProgress } from "@mui/material";
    import { getRecommendations } from "../utils/recommendations";
    import { useSelector } from "react-redux";

    function Sugesstions() {
      const userFromRedux = useSelector((state) => state.user.user) || {};
      const currentUser = useMemo(() => ({
        ...userFromRedux,
        following: userFromRedux.following || []
      }), [userFromRedux._id]);

      const [suggestions, setSuggestions] = useState([]);
      const [loading, setLoading] = useState(true);
      const [followedAccounts, setFollowedAccounts] = useState(new Set());

      // Lấy danh sách đã follow từ API
      const fetchFollowedUsers = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/user/followed", {
            method: "GET",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
          });
          if (response.ok) {
            const data = await response.json();
            setFollowedAccounts(new Set(data.following));
            return data.following;
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách follow:", error);
        }
        return [];
      };

      // Lấy danh sách gợi ý từ API
      const fetchSuggestions = async () => {
        setLoading(true);
        try {
          const followedList = await fetchFollowedUsers();
          const updatedUser = { ...currentUser, following: followedList };
          const recommendations = await getRecommendations(updatedUser);

          const combined = [...(recommendations.restaurants || []), ...(recommendations.normalUsers || [])]
            .filter((sugg) => !followedAccounts.has(sugg._id.toString()))
            .slice(0, 5);
          
          setSuggestions(combined);
        } catch (error) {
          console.error("Lỗi khi lấy gợi ý:", error);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        if (currentUser && currentUser._id) {
          fetchSuggestions();
        }
      }, [currentUser]);

      // Xử lý Follow
      const toggleFollow = async (accountId) => {
        const isFollowing = followedAccounts.has(accountId.toString());
        const url = `http://localhost:5000/api/user/${isFollowing ? "unfollow" : "follow"}/${accountId}`;
        const method = isFollowing ? "DELETE" : "POST"; // 🛠️ Đổi thành DELETE khi Unfollow
      
        try {
          const response = await fetch(url, {
            method,
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          });
      
          if (response.ok) {
            setFollowedAccounts((prev) => {
              const updatedSet = new Set(prev);
              if (isFollowing) {
                updatedSet.delete(accountId.toString()); // ❌ Unfollow
              } else {
                updatedSet.add(accountId.toString()); // ✅ Follow
              }
              return updatedSet;
            });
          } else {
            console.error(`${isFollowing ? "Unfollow" : "Follow"} thất bại:`, await response.json());
          }
        } catch (error) {
          console.error(`${isFollowing ? "Unfollow" : "Follow"} thất bại:`, error);
        }
      };
      
      return (
        <div className="sugesstions">
          <div className="account__username">
            <div className="account__left">
              <Avatar style={{ width: "50px", height: "50px" }}>R</Avatar>
              <div className="username__info">
                <span className="username__profile">{currentUser.username || "_username"}</span>
                <span className="profilename">{currentUser.name || "User Name"}</span>
              </div>
            </div>
            <button className="switch__button">Switch</button>
          </div>

          <div className="sugesstions__title">Suggestions for you</div>

          {loading ? (
            <div className="loading-spinner">
              <CircularProgress />
            </div>
          ) : (
            <div className="sugesstions__usernames">
              {suggestions.length === 0 ? (
                <p>No suggestions available.</p>
              ) : (
                suggestions.map((user) => (
                  <AccountUser
                    key={user._id}
                    username={user.username}
                    nickname={user.nickname || "User"}
                    isFollowed={followedAccounts.has(user._id.toString())}
                    onFollow={() => toggleFollow(user._id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    export default Sugesstions;
