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
  CardMedia,
  CircularProgress,
  Avatar
} from '@mui/material';
import { BACKENDURL } from '../../utils/const';

function RecommendationsPage() {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState({ restaurants: [], normalUsers: [] });
  const [loading, setLoading] = useState(true);
  const [followedAccounts, setFollowedAccounts] = useState(new Set());

  const fetchFollowedUsers = async () => {
    try {
      const response = await fetch(`${BACKENDURL}/api/user/followed`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("✅ API trả về danh sách following:", data.following);
        setFollowedAccounts(new Set(data.following));
        return data.following;
      } else {
        console.error("Không lấy được danh sách đã follow");
        return [];
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách follow:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const followingList = await fetchFollowedUsers();
        const updatedUser = { ...user, following: followingList };
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
      const response = await fetch(`${BACKENDURL}/api/user/follow/${accountId}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("🔥 Danh sách đã follow:", data.following); 
        setFollowedAccounts((prev) => new Set([...prev, accountId]));
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 2, backgroundColor: '#fff' }}>
        <Typography variant="h4" sx={{ mb: 4, color: '#1a1a1a', fontWeight: 700 }} gutterBottom>
          Gợi Ý Follow
        </Typography>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <CircularProgress size={60} />
          </div>
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 3, color: '#333', fontWeight: 600 }}>
                  Nhà Hàng
                </Typography>
                {recommendations.restaurants.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Không có gợi ý nhà hàng.
                  </Typography>
                ) : (
                  recommendations.restaurants.map((restaurant) => (
                    <Card key={restaurant._id} sx={{ mb: 3, borderRadius: 1, boxShadow: 3, transition: 'all 0.3s', '&:hover': { boxShadow: 6 } }}>
                      <CardMedia>
                        <Avatar
                          alt={restaurant.username}
                          src={restaurant.avatar || '/default-avatar.png'} // Sử dụng avatar từ dữ liệu hoặc ảnh mặc định
                          sx={{ width: 100, height: 100, mx: 'auto', mt: 2 }}
                        />
                      </CardMedia>
                      <CardContent sx={{ textAlign: 'center', pt: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>{restaurant.username}</Typography>
                        {/* <Typography variant="body2" color="text.secondary">Điểm: {restaurant.rating}</Typography> */}
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <Button 
                          variant="contained" 
                          color={followedAccounts.has(restaurant._id) ? "success" : "primary"}
                          size="medium"
                          onClick={() => handleFollow(restaurant._id)}
                          disabled={followedAccounts.has(restaurant._id)}
                          sx={{ borderRadius: 20, px: 3, textTransform: 'none' }}
                        >
                          {followedAccounts.has(restaurant._id) ? "Following" : "Follow"}
                        </Button>
                      </CardActions>
                    </Card>
                  ))
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 3, color: '#333', fontWeight: 600 }}>
                  Blogger
                </Typography>
                {recommendations.normalUsers.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Không có gợi ý blogger.
                  </Typography>
                ) : (
                  recommendations.normalUsers.map((normalUser) => (
                    <Card key={normalUser._id} sx={{ mb: 3, borderRadius: 1, boxShadow: 3, transition: 'all 0.3s', '&:hover': { boxShadow: 6 } }}>
                      <CardMedia>
                        <Avatar
                          alt={normalUser.username}
                          src={normalUser.avatar || '/default-avatar.png'} // Sử dụng avatar từ dữ liệu hoặc ảnh mặc định
                          sx={{ width: 100, height: 100, mx: 'auto', mt: 2 }}
                        />
                      </CardMedia>
                      <CardContent sx={{ textAlign: 'center', pt: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>{normalUser.username}</Typography>
                        {/* <Typography variant="body2" color="text.secondary">Điểm: {normalUser.points}</Typography> */}
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <Button 
                          variant="contained" 
                          color={followedAccounts.has(normalUser._id) ? "success" : "primary"}
                          size="medium"
                          onClick={() => handleFollow(normalUser._id)}
                          disabled={followedAccounts.has(normalUser._id)}
                          sx={{ borderRadius: 20, px: 3, textTransform: 'none' }}
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
              sx={{ mt: 4, py: 1.5, backgroundColor: '#0095f6', '&:hover': { backgroundColor: '#0077c0' }, borderRadius: 20, fontWeight: 600 }}
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