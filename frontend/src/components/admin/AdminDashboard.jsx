import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaPaintBrush, FaUserAlt, FaCalendarAlt } from 'react-icons/fa';
import apiStore from '../../stores/ApiStore';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    artworks: 0,
    artists: 0,
    exhibitions: 0
  });
  
  useEffect(() => {
    // Загрузка статистики
    const fetchStats = async () => {
      try {
        const [users, artworks, artists, exhibitions] = await Promise.all([
          apiStore.fetchUsers(0, 1),
          apiStore.fetchArtworks(0, 1),
          apiStore.fetchArtists(0, 1),
          apiStore.fetchExhibitions(0, 1)
        ]);
        
        setStats({
          users: users.totalElements || 0,
          artworks: artworks.totalElements || 0,
          artists: artists.totalElements || 0,
          exhibitions: exhibitions.totalElements || 0
        });
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div>
      <h2 className="mb-4">Панель управления</h2>
      
      <Row>
        <Col md={3}>
          <Card className="mb-4 text-center">
            <Card.Body>
              <FaUsers className="mb-3" size={30} color="#007bff" />
              <Card.Title>{stats.users}</Card.Title>
              <Card.Text>Пользователей</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-4 text-center">
            <Card.Body>
              <FaPaintBrush className="mb-3" size={30} color="#28a745" />
              <Card.Title>{stats.artworks}</Card.Title>
              <Card.Text>Произведений</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-4 text-center">
            <Card.Body>
              <FaUserAlt className="mb-3" size={30} color="#ffc107" />
              <Card.Title>{stats.artists}</Card.Title>
              <Card.Text>Художников</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-4 text-center">
            <Card.Body>
              <FaCalendarAlt className="mb-3" size={30} color="#dc3545" />
              <Card.Title>{stats.exhibitions}</Card.Title>
              <Card.Text>Выставок</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Последние действия</Card.Header>
            <Card.Body>
              <p>Здесь будет отображаться лог последних действий администратора.</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Статистика посещений</Card.Header>
            <Card.Body>
              <p>Здесь будет отображаться статистика посещений сайта.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
