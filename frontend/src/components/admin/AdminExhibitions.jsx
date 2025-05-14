import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Card, Row, Col } from 'react-bootstrap';
import apiStore from '../../stores/ApiStore';

const AdminExhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentExhibition, setCurrentExhibition] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    ticketPrice: 0,
    imageUrl: '',
    artworkIds: []
  });
  const [formMode, setFormMode] = useState('create');

  useEffect(() => {
    fetchExhibitions();
    fetchArtworks();
  }, []);

  const fetchExhibitions = async () => {
    setLoading(true);
    try {
      const response = await apiStore.apiClient.get('/exhibitions/getAll');
      setExhibitions(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке выставок: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchArtworks = async () => {
    try {
      const response = await apiStore.apiClient.get('/artworks/getAll');
      setArtworks(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке произведений:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArtworksChange = (e) => {
    const options = e.target.options;
    const selectedArtworks = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedArtworks.push(parseInt(options[i].value));
      }
    }
    setFormData(prev => ({ ...prev, artworkIds: selectedArtworks }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formMode === 'create') {
        await apiStore.apiClient.post('/exhibitions/add', formData);
      } else {
        await apiStore.apiClient.put(`/exhibitions/update?id=${currentExhibition.id}`, formData);
      }
      setShowModal(false);
      fetchExhibitions();
    } catch (err) {
      setError('Ошибка при сохранении выставки: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (exhibitionId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту выставку?')) {
      setLoading(true);
      try {
        await apiStore.apiClient.delete(`/exhibitions/delete/${exhibitionId}`);
        fetchExhibitions();
      } catch (err) {
        setError('Ошибка при удалении выставки: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const openCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setFormData({
      title: '',
      description: '',
      startDate: today,
      endDate: nextMonth.toISOString().split('T')[0],
      location: '',
      ticketPrice: 0,
      imageUrl: '',
      artworkIds: []
    });
    setFormMode('create');
    setCurrentExhibition(null);
    setShowModal(true);
  };

  const openEditModal = (exhibition) => {
    setFormData({
      title: exhibition.title || '',
      description: exhibition.description || '',
      startDate: exhibition.startDate || '',
      endDate: exhibition.endDate || '',
      location: exhibition.location || '',
      ticketPrice: exhibition.ticketPrice || 0,
      imageUrl: exhibition.imageUrl || '',
      artworkIds: exhibition.artworkIds || []
    });
    setFormMode('edit');
    setCurrentExhibition(exhibition);
    setShowModal(true);
  };

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Управление выставками</h2>
          <Button variant="primary" onClick={openCreateModal}>
            Добавить выставку
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
                  <th>Место проведения</th>
                  <th>Начало</th>
                  <th>Окончание</th>
                  <th>Цена билета</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {exhibitions.map(exhibition => (
                  <tr key={exhibition.id}>
                    <td>{exhibition.id}</td>
                    <td>{exhibition.title}</td>
                    <td>{exhibition.location}</td>
                    <td>{exhibition.startDate}</td>
                    <td>{exhibition.endDate}</td>
                    <td>{exhibition.ticketPrice} ₽</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => openEditModal(exhibition)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(exhibition.id)}
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

      {/* Модальное окно для создания/редактирования выставки */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {formMode === 'create' ? 'Добавить выставку' : 'Редактировать выставку'}
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
              <Form.Label>Место проведения</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row> {/* Использование компонента Row */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата начала</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата окончания</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Цена билета (₽)</Form.Label>
              <Form.Control
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                required
                min="0"
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
                    className="image-preview" // Можно добавить стили для этого класса
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Произведения (выберите несколько, удерживая Ctrl)</Form.Label>
              <Form.Select
                multiple
                name="artworkIds"
                value={formData.artworkIds} // Убедитесь, что это массив ID
                onChange={handleArtworksChange}
                style={{ height: '200px' }}
              >
                {artworks.map(artwork => (
                  <option key={artwork.id} value={artwork.id}>
                    {artwork.title} ({artwork.artistId ? artists.find(a => a.id === artwork.artistId)?.name : 'Неизвестный художник'})
                  </option>
                ))}
              </Form.Select>
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

export default AdminExhibitions;
