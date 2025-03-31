import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Thêm để dùng Redux state
import Sidenav from './navigation/Sidenav';
import HomePage from './Homepage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import FavouriteMapPage from './pages/FavouriteMapPage';
import SavedPostsPage from './pages/SavedPostsPage';
// import VouchersPage from './pages/restaurantVoucher/VouchersPage';
// import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
<<<<<<< HEAD
// import CreatePage from './pages/CreatePage';
=======
import CreatePage from './pages/createPost/CreatePage';
>>>>>>> fdc97ab1f310be0f5d2b5b8a24f7acfc3c94824e
import EditProfilePage from './pages/EditProfilePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import RestaurantProfilePage from './pages/RestaurantProfilePage';
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import SetupPage from './pages/SetupPage/SetupPage';
import RecommendationsPage from './pages/RecommendationsPage/RecommendationsPage';
function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const token = localStorage.getItem("token"); // Kiểm tra token
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated); // Lấy từ Redux

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const handleCloseSearch = () => setIsSearchOpen(false);

  // Sử dụng isAuthenticated từ Redux thay vì chỉ dựa vào token
  const isLoggedIn = token && isAuthenticated;

  return (
    <Router>
      <Grid container>
        <Grid item xs={6} md={2}>
          {isLoggedIn && (
            <div className="app__sidebar">
              <Sidenav onSearchClick={toggleSearch} onCloseSearch={handleCloseSearch} />
            </div>
          )}
        </Grid>
        <Grid item xs={6} md={10}>
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            {isLoggedIn ? (
              <>
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/" element={<Navigate to="/home" />} /> {/* Điều hướng mặc định */}
                <Route path="home" element={<HomePage />} />
                <Route path="/favouriteMap" element={<FavouriteMapPage />} />
                <Route path="/savedPosts" element={<SavedPostsPage />} />
<<<<<<< HEAD
                {/* <Route path="/vouchers" element={<VouchersPage />} />
                <Route path="/messages" element={<MessagesPage />} /> */}
=======
                <Route path="/vouchers" element={<VouchersPage />} />
                <Route path="/messages" element={<MessagesPage sender="67c2bb9466a1dd364e1e7456" receiver="67c33d910636489fb457d0ef"/>} />
>>>>>>> fdc97ab1f310be0f5d2b5b8a24f7acfc3c94824e
                <Route path="/notifications" element={<NotificationsPage />} />
                {/* <Route path="/create" element={<CreatePage />} /> */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/restaurant_profile" element={<RestaurantProfilePage />} />
                <Route path="/editProfile" element={<EditProfilePage />} />
                <Route path="/search" element={<SearchPage />} /> {/* Thêm SearchPage vào Routes */}
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>

          {/* Chỉ render SearchPage nếu cần overlay, không phải route */}
          {isLoggedIn && isSearchOpen && <SearchPage />}
        </Grid>
      </Grid>
    </Router>
  );
}

export default App;