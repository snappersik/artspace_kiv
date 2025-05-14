import React, { useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { Navigate, Routes, Route } from 'react-router-dom';
import apiStore from '../../stores/ApiStore';

// Импорт компонентов админ-панели
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminArtworks from './AdminArtworks';
import AdminArtists from './AdminArtists';
import AdminExhibitions from './AdminExhibitions';
import AdminSidebar from './AdminSidebar';

const AdminPanel = observer(() => {
  const { user, isAuthenticated } = apiStore;
  
  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Если пользователь не админ, перенаправляем на главную страницу
  if (user?.roleName !== 'ADMIN') {
    return <Navigate to="/" />;
  }
  
  return (
    <Container fluid className="admin-panel">
      <Row>
        {/* Боковая панель */}
        <Col md={3} lg={2} className="bg-dark sidebar">
          <AdminSidebar />
        </Col>
        
        {/* Основное содержимое */}
        <Col md={9} lg={10} className="main-content p-4">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/artworks" element={<AdminArtworks />} />
            <Route path="/artists" element={<AdminArtists />} />
            <Route path="/exhibitions" element={<AdminExhibitions />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
});

export default AdminPanel;
