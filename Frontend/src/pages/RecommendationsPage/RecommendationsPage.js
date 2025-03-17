  import React, { useEffect, useState } from 'react';
  import { useSelector } from 'react-redux';
  import { useNavigate } from 'react-router-dom';
  import { getRecommendations } from '../../utils/recommendations';
  import {
    Container,
    Paper,
    Typography,
    Grid,
    Button,
    Card,
    CardContent,
    CardActions,
    CircularProgress
  } from '@mui/material';

  function RecommendationsPage() {
    const user = useSelector((state) => state.user.user);
    console.log("🔍 Redux user state:", user);
  console.log("📌 Danh sách following:", user.following);
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState({ restaurants: [], normalUsers: [] });
    const [loading, setLoading] = useState(true);
    const [followedAccounts, setFollowedAccounts] = useState(new Set()); // ⚡ Set lưu danh sách đã follow
    const fetchFollowedUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user/followed", {
          method: "GET",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log("✅ API trả về danh sách following:", data.following);
          setFollowedAccounts(new Set(data.following)); // ✅ Lưu danh sách đã follow vào state
        } else {
          console.error("Không lấy được danh sách đã follow");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách follow:", error);
      }
    };
    
    useEffect(() => {
      fetchFollowedUsers(); // 🔥 Gọi API khi load trang
    }, []);
    useEffect(() => {
      const fetchFollowedUsers = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/user/followed", {
            method: "GET",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
          });
    
          if (response.ok) {
            const data = await response.json();
            console.log("🔥 Danh sách đã follow từ API:", data.following); 
            setFollowedAccounts(new Set(data.following)); // ✅ Cập nhật danh sách follow
            return data.following; // 🔥 Trả về danh sách following
          } else {
            console.error("Không lấy được danh sách đã follow");
            return [];
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách follow:", error);
          return [];
        }
      };
    
      const fetchRecommendations = async () => {
        setLoading(true);
        try {
          const followingList = await fetchFollowedUsers(); // ✅ Đợi API trả về
          const updatedUser = { ...user, following: followingList }; // ✅ Truyền danh sách following đã cập nhật vào getRecommendations
          const recs = await getRecommendations(updatedUser);
          setRecommendations(recs);
        } catch (error) {
          console.error('Lấy gợi ý thất bại:', error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchRecommendations();
    }, [user]);
    
    
    const handleFollow = async (accountId) => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/follow/${accountId}`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          },
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log("🔥 Danh sách đã follow:", data.following); 
          setFollowedAccounts((prev) => new Set([...prev, accountId])); // ✅ Cập nhật Set đúng cách
        } else {
          console.error("Follow thất bại:", await response.json());
        }
      } catch (error) {
        console.error("Follow thất bại:", error);
      }
    };
    

    const handleComplete = () => {
      navigate('/home');
    };

    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ padding: '20px', marginTop: '20px' }}>
          <Typography variant="h4" sx={{ mb: 3, color: '#333' }} gutterBottom>Gợi Ý Follow</Typography>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" sx={{ mb: 2, color: '#666' }}>Nhà Hàng</Typography>
                  {recommendations.restaurants.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Không có gợi ý nhà hàng.</Typography>
                  ) : (
                    recommendations.restaurants.map((restaurant) => (
                      <Card key={restaurant._id} sx={{ mb: 2, boxShadow: 2 }}>
                        <CardContent>
                          <Typography variant="h6">{restaurant.username}</Typography>
                          <Typography variant="body2" color="text.secondary">Điểm: {restaurant.rating}</Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            variant="contained" 
                            color={followedAccounts.has(restaurant._id) ? "success" : "primary"}
                            size="small"
                            onClick={() => handleFollow(restaurant._id)}
                            disabled={followedAccounts.has(restaurant._id)} // ✅ Disable nếu đã follow
                          >
                            {followedAccounts.has(restaurant._id) ? "Following" : "Follow"}
                          </Button>
                        </CardActions>
                      </Card>
                    ))
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" sx={{ mb: 2, color: '#666' }}>Blogger</Typography>
                  {recommendations.normalUsers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Không có gợi ý blogger.</Typography>
                  ) : (
                    recommendations.normalUsers.map((normalUser) => (
                      <Card key={normalUser._id} sx={{ mb: 2, boxShadow: 2 }}>
                        <CardContent>
                          <Typography variant="h6">{normalUser.username}</Typography>
                          <Typography variant="body2" color="text.secondary">Điểm: {normalUser.points}</Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            variant="contained" 
                            color={followedAccounts.has(normalUser._id) ? "success" : "primary"}
                            size="small"
                            onClick={() => handleFollow(normalUser._id)}
                            disabled={followedAccounts.has(normalUser._id)} // ✅ Disable nếu đã follow
                          >
                            {followedAccounts.has(normalUser._id) ? "Following" : "Follow"}
                          </Button>
                        </CardActions>
                      </Card>
                    ))
                  )}
                </Grid>
              </Grid>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 3, backgroundColor: '#0095f6', '&:hover': { backgroundColor: '#0077c0' } }}
                onClick={handleComplete}
              >
                Hoàn Tất
              </Button>
            </>
          )}
        </Paper>
      </Container>
    );
  }

  export default RecommendationsPage;
