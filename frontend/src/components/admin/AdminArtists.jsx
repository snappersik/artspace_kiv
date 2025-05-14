import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Card } from 'react-bootstrap';
import apiStore from '../../stores/ApiStore';

const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentArtist, setCurrentArtist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    birthDate: '',
    deathDate: '',
    country: '',
    imageUrl: ''
  });
  const [formMode, setFormMode] = useState('create');
  
  useEffect(() => {
    fetchArtists();
  }, []);
  
  const fetchArtists = async () => {
    setLoading(true);
    try {
      const response = await apiStore.apiClient.get('/artists/getAll');
      setArtists(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке художников: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (formMode === 'create') {
        await apiStore.apiClient.post('/artists/add', formData);
      } else {
        await apiStore.apiClient.put(`/artists/update?id=${currentArtist.id}`, formData);
      }
      
      setShowModal(false);
      fetchArtists();
    } catch (err) {
      setError('Ошибка при сохранении художника: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (artistId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого художника?')) {
      setLoading(true);
      try {
        await apiStore.apiClient.delete(`/artists/delete/${artistId}`);
        fetchArtists();
      } catch (err) {
        setError('Ошибка при удалении художника: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };
  
  const openCreateModal = () => {
    setFormData({
      name: '',
      biography: '',
      birthDate: '',
      deathDate: '',
      country: '',
      imageUrl: ''
    });
    setFormMode('create');
    setCurrentArtist(null);
    setShowModal(true);
  };
  
  const openEditModal = (artist) => {
    setFormData({
      name: artist.name || '',
      biography: artist.biography || '',
      birthDate: artist.birthDate || '',
      deathDate: artist.deathDate || '',
      country: artist.country || '',
      imageUrl: artist.imageUrl || ''
    });
    setFormMode('edit');
    setCurrentArtist(artist);
    setShowModal(true);
  };
  
  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Управление художниками</h2>
          <Button variant="primary" onClick={openCreateModal}>
            Добавить художника
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Страна</th>
                  <th>Дата рождения</th>
                  <th>Дата смерти</th>
                  <th>Фото</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {artists.map(artist => (
                  <tr key={artist.id}>
                    <td>{artist.id}</td>
                    <td>{artist.name}</td>
                    <td>{artist.country}</td>
                    <td>{artist.birthDate}</td>
                    <td>{artist.deathDate || '-'}</td>
                    <td>
                      {artist.imageUrl && (
                        <img 
                          src={artist.imageUrl} 
                          alt={artist.name} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => openEditModal(artist)}
                      >
                        Редактировать
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(artist.id)}
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Модальное окно для создания/редактирования художника */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {formMode === 'create' ? 'Добавить художника' : 'Редактировать художника'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Страна</Form.Label>
              <Form.Control
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Дата рождения</Form.Label>
              <Form.Control
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Дата смерти</Form.Label>
              <Form.Control
                type="date"
                name="deathDate"
                value={formData.deathDate}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Биография</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="biography"
                value={formData.biography}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>URL изображения</Form.Label>
              <Form.Control
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.imageUrl} 
                    alt="Предпросмотр" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                </div>
              )}
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Отмена
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminArtists;
