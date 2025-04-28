import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // Thêm để dùng Redux state
import Sidenav from './navigation/Sidenav';
import HomePage from './Homepage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import FavouriteMapPage from './pages/FavouriteMapPage';
import SavedPostsPage from './pages/SavedPostsPage';
import VouchersPage from './pages/restaurantVoucher/VouchersPage';
import UserVouchersPage from './pages/VouchersPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import CreatePost from './pages/createPost/CreatePage';
import EditProfilePage from './pages/EditProfilePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import RestaurantProfilePage from './pages/RestaurantProfilePage';
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import SetupPage from './pages/SetupPage/SetupPage';
import RecommendationsPage from './pages/RecommendationsPage/RecommendationsPage';
import PostDetail from './components/post/PostDetail';
import TagPage from './pages/ListPostByTag/TagPage';
function App() {
  const userStorage = useSelector(state => state.user.user);
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
            {isLoggedIn && userStorage.usertype == "normal" ? (
              <>
                <Route path="home" element={<HomePage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/" element={<Navigate to="/home" />} /> {/* Điều hướng mặc định */}
                <Route path="/favouriteMap" element={<FavouriteMapPage />} />
                <Route path="/savedPosts" element={<SavedPostsPage />} />

                <Route path="/vouchers" element={<VouchersPage />} />
                <Route path="/messages" element={<MessagesPage sender="67c2bb9466a1dd364e1e7456" receiver="67c33d910636489fb457d0ef"/>} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/restaurant_profile" element={<RestaurantProfilePage />} />  
                <Route path="/post/:postId" element={<PostDetail />} />   
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/editProfile" element={<EditProfilePage userId={userStorage._id} />} />
                <Route path="/search" element={<SearchPage />} /> {/* Thêm SearchPage vào Routes */}
                <Route path="/explore/:tagName" element={<TagPage />} />
              </>
            ) : isLoggedIn && userStorage.usertype == "restaurant" ? (
              <>
                <Route path="home" element={<HomePage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/" element={<Navigate to="/home" />} /> {/* Điều hướng mặc định */}
                <Route path="/favouriteMap" element={<FavouriteMapPage />} />
                <Route path="/savedPosts" element={<SavedPostsPage />} />

                <Route path="/vouchers" element={<VouchersPage restaurantIdId={userStorage._id}/>} />
                <Route path="/messages" element={<MessagesPage sender={userStorage._id}/>} />
                <Route path="/notifications" element={<NotificationsPage />} />
                {/* <Route path="/create" element={<CreatePage />} /> */}

                <Route path="/restaurant_profile" element={<RestaurantProfilePage />} />     
                <Route path="/profile/:userId" element={<ProfilePage />} />
              
                <Route path="/editProfile" element={<EditProfilePage userId={userStorage._id}/>} />
                <Route path="/search" element={<SearchPage />} /> {/* Thêm SearchPage vào Routes */}
              </>
            ) : 
            (
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