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
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState({ restaurants: [], normalUsers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const recs = await getRecommendations(user);
        setRecommendations(recs);
      } catch (error) {
        console.error('Lấy gợi ý thất bại:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [user]);

  const handleFollow = async (accountId, type) => {
    try {
      await fetch(`http://localhost:5000/api/follow/${accountId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      console.log(`Đã follow ${type} với ID ${accountId}`);
    } catch (error) {
      console.error('Follow thất bại:', error);
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
                    <Card key={restaurant.id} sx={{ mb: 2, boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="h6" component="div">{restaurant.username}</Typography>
                        <Typography variant="body2" color="text.secondary">Điểm: {restaurant.rating}</Typography>
                      </CardContent>
                      <CardActions>
                        <Button variant="contained" color="primary" size="small" onClick={() => handleFollow(restaurant.id, 'restaurant')}>
                          Follow
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
                    <Card key={normalUser.id} sx={{ mb: 2, boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="h6" component="div">{normalUser.username}</Typography>
                        <Typography variant="body2" color="text.secondary">Điểm: {normalUser.points}</Typography>
                      </CardContent>
                      <CardActions>
                        <Button variant="contained" color="primary" size="small" onClick={() => handleFollow(normalUser.id, 'normal')}>
                          Follow
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