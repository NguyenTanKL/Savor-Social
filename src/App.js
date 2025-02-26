import './App.css';
import Homepage from './Homepage';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Grid from '@mui/material/Grid';
import Sidenav from './navigation/Sidenav';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import FavouriteMapPage from './pages/FavouriteMapPage';
import SavedPostsPage from './pages/SavedPostsPage';
import VouchersPage from './pages/restaurantVoucher/VouchersPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import CreatePage from './pages/createPost/CreatePage';
import RestaurantProfilePage from './pages/RestaurantProfilePage'

function App() {
  return (
    <Router>
      {/* <Grid container spacing={2}>
        <Grid item xs={2} style={{borderRight: "border-right: 2px solid #ebedf0"}}>
          <Sidenav />
        </Grid>
        <Grid item xs={10}>
            <Routes>
              <Route path="/HomePage" element={<Homepage />} />
              <Route path="SearchPage" element={<SearchPage/>}/>
              <Route path="/FavouriteMapPage" element= {<FavouriteMapPage/>} />
              <Route path="/SavedPostsPage" element= {<SavedPostsPage/>} />
              <Route path="/VouchersPage" element= {<VouchersPage/>} />
              <Route path="/MessagesPage" element= {<MessagesPage/>} />
              <Route path="/NotificationsPage" element= {<NotificationsPage/>} />
              <Route path="/CreatePage" element= {<CreatePage/>} />
              <Route path="/ProfilePage" element= {<ProfilePage/>} />
              <Route path="/RestaurantProfilePage" element= {<RestaurantProfilePage/>} />
            </Routes>
        </Grid>
      </Grid> */}
      <div className="app">
        <div className="app__sidebar"></div>
        <Sidenav />
        <div className="app__content">
          <Routes>
            <Route path="/HomePage" element={<Homepage />} />
            <Route path="SearchPage" element={<SearchPage/>}/>
            <Route path="/FavouriteMapPage" element= {<FavouriteMapPage/>} />
            <Route path="/SavedPostsPage" element= {<SavedPostsPage/>} />
            <Route path="/VouchersPage" element= {<VouchersPage/>} />
            <Route path="/MessagesPage" element= {<MessagesPage/>} />
            <Route path="/NotificationsPage" element= {<NotificationsPage/>} />
            <Route path="/CreatePage" element= {<CreatePage/>} />
            <Route path="/ProfilePage" element= {<ProfilePage/>} />
            <Route path="/RestaurantProfilePage" element= {<RestaurantProfilePage/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
