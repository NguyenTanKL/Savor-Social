import './App.css';
import Homepage from './Homepage';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidenav from './navigation/Sidenav';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import FavouriteMapPage from './pages/FavouriteMapPage';
import SavedPostsPage from './pages/SavedPostsPage';
import VouchersPage from './pages/VouchersPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import CreatePage from './pages/CreatePage';

function App() {
  return (
    <Router>
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
