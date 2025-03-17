import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Thêm để dùng Redux state
import Sidenav from './navigation/Sidenav';
import HomePage from './HomePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import FavouriteMapPage from './pages/FavouriteMapPage';
import SavedPostsPage from './pages/SavedPostsPage';
// import VouchersPage from './pages/restaurantVoucher/VouchersPage';
// import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
// import CreatePage from './pages/CreatePage';
import EditProfilePage from './pages/EditProfilePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import { useState } from 'react';
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
      <div className="app">
        {isLoggedIn && (
          <div className="app__sidebar">
            <Sidenav onSearchClick={toggleSearch} onCloseSearch={handleCloseSearch} />
          </div>
        )}

        <div className="app__content">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            {isLoggedIn ? (
              <>
                <Route path="home" element={<HomePage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/" element={<Navigate to="/home" />} /> {/* Điều hướng mặc định */}
                
                <Route path="/favouriteMap" element={<FavouriteMapPage />} />
                <Route path="/savedPosts" element={<SavedPostsPage />} />
                {/* <Route path="/vouchers" element={<VouchersPage />} />
                <Route path="/messages" element={<MessagesPage />} /> */}
                <Route path="/notifications" element={<NotificationsPage />} />
                {/* <Route path="/create" element={<CreatePage />} /> */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/editProfile" element={<EditProfilePage />} />
                <Route path="/search" element={<SearchPage />} /> {/* Thêm SearchPage vào Routes */}
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>

          {/* Chỉ render SearchPage nếu cần overlay, không phải route */}
          {isLoggedIn && isSearchOpen && <SearchPage />}
        </div>
      </div>
    </Router>
  );
}

export default App;