import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Card } from 'react-bootstrap';
import apiStore from '../../stores/ApiStore';

const AdminArtworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentArtwork, setCurrentArtwork] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: '',
    category: 'PAINTING',
    artistId: '',
    imageUrl: ''
  });
  const [formMode, setFormMode] = useState('create');
  
  useEffect(() => {
    fetchArtworks();
    fetchArtists();
  }, []);
  
  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const response = await apiStore.apiClient.get('/artworks/getAll');
      setArtworks(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке произведений: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const fetchArtists = async () => {
    try {
      const response = await apiStore.apiClient.get('/artists/getAll');
      setArtists(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке художников:', err);
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
        await apiStore.apiClient.post('/artworks/add', formData);
      } else {
        await apiStore.apiClient.put(`/artworks/update?id=${currentArtwork.id}`, formData);
      }
      
      setShowModal(false);
      fetchArtworks();
    } catch (err) {
      setError('Ошибка при сохранении произведения: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (artworkId) => {
    if (window.confirm('Вы уверены, что хотите удалить это произведение?')) {
      setLoading(true);
      try {
        await apiStore.apiClient.delete(`/artworks/delete/${artworkId}`);
        fetchArtworks();
      } catch (err) {
        setError('Ошибка при удалении произведения: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };
  
  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      year: new Date().getFullYear(),
      category: 'PAINTING',
      artistId: artists.length > 0 ? artists[0].id : '',
      imageUrl: ''
    });
    setFormMode('create');
    setCurrentArtwork(null);
    setShowModal(true);
  };
  
  const openEditModal = (artwork) => {
    setFormData({
      title: artwork.title || '',
      description: artwork.description || '',
      year: artwork.year || new Date().getFullYear(),
      category: artwork.category || 'PAINTING',
      artistId: artwork.artistId || '',
      imageUrl: artwork.imageUrl || ''
    });
    setFormMode('edit');
    setCurrentArtwork(artwork);
    setShowModal(true);
  };
  
  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Управление произведениями</h2>
          <Button variant="primary" onClick={openCreateModal}>
            Добавить произведение
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
                  <th>Название</th>
                  <th>Художник</th>
                  <th>Год</th>
                  <th>Категория</th>
                  <th>Изображение</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map(artwork => (
                  <tr key={artwork.id}>
                    <td>{artwork.id}</td>
                    <td>{artwork.title}</td>
                    <td>
                      {artists.find(a => a.id === artwork.artistId)?.name || 'Неизвестно'}
                    </td>
                    <td>{artwork.year}</td>
                    <td>{artwork.category}</td>
                    <td>
                      {artwork.imageUrl && (
                        <img 
                          src={artwork.imageUrl} 
                          alt={artwork.title} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => openEditModal(artwork)}
                      >
                        Редактировать
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(artwork.id)}
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
      
      {/* Модальное окно для создания/редактирования произведения */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {formMode === 'create' ? 'Добавить произведение' : 'Редактировать произведение'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Художник</Form.Label>
              <Form.Select
                name="artistId"
                value={formData.artistId}
                onChange={handleChange}
                required
              >
                <option value="">Выберите художника</option>
                {artists.map(artist => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Год создания</Form.Label>
              <Form.Control
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Категория</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="PAINTING">Живопись</option>
                <option value="SCULPTURE">Скульптура</option>
                <option value="GRAPHIC">Графика</option>
                <option value="PHOTOGRAPHY">Фотография</option>
                <option value="OTHER">Другое</option>
              </Form.Select>
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

export default AdminArtworks;
