import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidenav from './navigation/Sidenav';
import HomePage from './Homepage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import FavouriteMapPage from './pages/FavouriteMapPage';
import SavedPostsPage from './pages/SavedPostsPage';
import VouchersPage from './pages/restaurantVoucher/VouchersPage';
import UserVouchersPage from './pages/VouchersPage';
import MessagesPage from './pages/MessagesPage';
import NotificationDrawer from './pages/NotificationDrawer';
import CreatePost from './pages/createPost/CreatePage';
import EditProfilePage from './pages/EditProfilePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import RestaurantProfilePage from './pages/RestaurantProfilePage';
import SharePost from './pages/SharePost';
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import SetupPage from './pages/SetupPage/SetupPage';
import RecommendationsPage from './pages/RecommendationsPage/RecommendationsPage';
import PostDetail from './components/post/PostDetail';
import TagPage from './pages/ListPostByTag/TagPage';

function App() {
  const userStorage = useSelector(state => state.user.user);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const token = localStorage.getItem("token");
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const toggleSearch = () => {
    console.log("Toggling search, current isSearchOpen:", isSearchOpen);
    setIsSearchOpen(!isSearchOpen);
  };

  const handleCloseSearch = () => {
    console.log("Closing search, setting isSearchOpen to false");
    setIsSearchOpen(false);
  };

  useEffect(() => {
    console.log("isSearchOpen updated:", isSearchOpen);
  }, [isSearchOpen]);

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
            {isLoggedIn && userStorage.usertype === "normal" ? (
              <>
                <Route path="home" element={<HomePage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/favouriteMap" element={<FavouriteMapPage />} />
                <Route path="/savedPosts" element={<SavedPostsPage />} />
                <Route path="/sharepost/:postId" element={<SharePost />} />
                <Route path="/vouchers" element={<UserVouchersPage userId={userStorage._id} />} />
                <Route path="/messages" element={<MessagesPage sender={userStorage._id} />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/restaurant_profile" element={<RestaurantProfilePage />} />
                <Route path="/post/:postId" element={<PostDetail />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/editProfile" element={<EditProfilePage userId={userStorage._id} />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/explore/:tagName" element={<TagPage />} />
              </>
            ) : isLoggedIn && userStorage.usertype === "restaurant" ? (
              <>
                <Route path="home" element={<HomePage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/favouriteMap" element={<FavouriteMapPage />} />
                <Route path="/savedPosts" element={<SavedPostsPage />} />
                <Route path="/post/:postId" element={<PostDetail />} />
                <Route path="/sharepost/:postId" element={<SharePost />} />
                <Route path="/vouchers" element={<VouchersPage restaurantId={userStorage._id} />} />
                <Route path="/messages" element={<MessagesPage sender={userStorage._id} />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/explore/:tagName" element={<TagPage />} />
                <Route path="/restaurant_profile" element={<RestaurantProfilePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/editProfile" element={<EditProfilePage userId={userStorage._id} />} />
                <Route path="/search" element={<SearchPage />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>

          {isLoggedIn && (
            <SearchPage open={isSearchOpen} onClose={handleCloseSearch} />
          )}
        </Grid>
      </Grid>
    </Router>
  );
}

export default App;