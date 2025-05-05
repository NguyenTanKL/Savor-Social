import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKENDURL } from '../utils/const';
function RecommendationsPage() {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState({ restaurants: [], normalUsers: [] });

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.post(`${BACKENDURL}/api/recommendations`, {
          address: user.address,
          preferences: user.preferences,
        });
        setRecommendations(response.data);
      } catch (error) {
        console.error('Lấy gợi ý thất bại:', error);
      }
    };
    fetchRecommendations();
  }, [user]);

  const handleFollow = async (accountId, type) => {
    try {
      await axios.post(`${BACKENDURL}/api/follow/${accountId}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (error) {
      console.error('Follow thất bại:', error);
    }
  };

  const handleComplete = () => {
    navigate('/home');
  };

  return (
    <div>
      <h2>Gợi Ý Follow</h2>
      <h3>Nhà Hàng</h3>
      {recommendations.restaurants.map((restaurant) => (
        <div key={restaurant.id}>
          {restaurant.username} (Điểm: {restaurant.rating})
          <button onClick={() => handleFollow(restaurant.id, 'restaurant')}>Follow</button>
        </div>
      ))}
      <h3>Blogger</h3>
      {recommendations.normalUsers.map((normalUser) => (
        <div key={normalUser.id}>
          {normalUser.username} (Điểm: {normalUser.points})
          <button onClick={() => handleFollow(normalUser.id, 'normal')}>Follow</button>
        </div>
      ))}
      <button onClick={handleComplete}>Hoàn Tất</button>
    </div>
  );
}

export default RecommendationsPage;