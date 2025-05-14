import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { observer } from 'mobx-react';

// Компоненты
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import ArtworkList from './components/artwork/ArtworkList';
import ArtistList from './components/artist/ArtistList';
import ExhibitionList from './components/exhibition/ExhibitionList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import NotFound from './components/pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfileEdit from './components/auth/ProfileEdit';
import AdminPanel from './components/admin/AdminPanel';
import AdminUsers from './components/admin/AdminUsers';
import AdminArtworks from './components/admin/AdminArtworks';
import AdminArtists from './components/admin/AdminArtists';
import AdminExhibitions from './components/admin/AdminExhibitions';
import AdminDashboard from './components/admin/AdminDashboard';

const App = observer(() => {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artworks" element={<ArtworkList />} />
            <Route path="/artists" element={<ArtistList />} />
            <Route path="/exhibitions" element={<ExhibitionList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            } />

            {/* Маршруты админ-панели */}
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
});

export default App;
