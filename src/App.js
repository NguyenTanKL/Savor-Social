import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Thêm để dùng Redux state
import Sidenav from './navigation/Sidenav';
import HomePage from './HomePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import FavouriteMapPage from './pages/FavouriteMapPage';
import SavedPostsPage from './pages/SavedPostsPage';
import VouchersPage from './pages/VouchersPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import CreatePage from './pages/CreatePage';
import EditProfilePage from './pages/EditProfilePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import { useState } from 'react';

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
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            {isLoggedIn ? (
              <>
                <Route path="/" element={<Navigate to="/HomePage" />} /> {/* Điều hướng mặc định */}
                <Route path="/HomePage" element={<HomePage />} />
                <Route path="/FavouriteMapPage" element={<FavouriteMapPage />} />
                <Route path="/SavedPostsPage" element={<SavedPostsPage />} />
                <Route path="/VouchersPage" element={<VouchersPage />} />
                <Route path="/MessagesPage" element={<MessagesPage />} />
                <Route path="/NotificationsPage" element={<NotificationsPage />} />
                <Route path="/CreatePage" element={<CreatePage />} />
                <Route path="/ProfilePage" element={<ProfilePage />} />
                <Route path="/EditProfilePage" element={<EditProfilePage />} />
                <Route path="/SearchPage" element={<SearchPage />} /> {/* Thêm SearchPage vào Routes */}
              </>
            ) : (
              <Route path="*" element={<Navigate to="/LoginPage" />} />
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