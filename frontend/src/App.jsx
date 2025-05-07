import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Компоненты
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import ArtworkList from './components/artwork/ArtworkList';
import ArtistList from './components/artist/ArtistList';
import ExhibitionList from './components/exhibition/ExhibitionList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import NotFound from './components/pages/NotFound';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artworks" element={<ArtworkList />} />
            <Route path="/artists" element={<ArtistList />} />
            <Route path="/exhibitions" element={<ExhibitionList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
