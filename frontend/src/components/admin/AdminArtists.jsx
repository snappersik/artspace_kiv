import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Alert, Card, Pagination, InputGroup, FormControl, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import apiStore from '../../stores/ApiStore';
import { debounce } from 'lodash';

const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [currentArtist, setCurrentArtist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    birthDate: '',
    country: '',
    photoPath: ''
  });
  const [formMode, setFormMode] = useState('create');

  const [searchTerm, setSearchTerm] = useState({ name: '', country: '' });
  const [isSearching, setIsSearching] = useState(false);

  const placeholderImage = "https://via.placeholder.com/150/CCCCCC/FFFFFF?Text=No+Image";

  const handleImageError = (event) => {
    event.target.src = placeholderImage;
  };

  const fetchArtistsData = useCallback(async (page, searchPayload) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      const cleanedSearchPayload = Object.fromEntries(
        Object.entries(searchPayload).filter(([_, v]) => v !== '')
      );
      if (isSearching && Object.keys(cleanedSearchPayload).length > 0) {
        data = await apiStore.searchArtists(cleanedSearchPayload, page, pageSize);
      } else {
        data = await apiStore.fetchArtists(page, pageSize);
      }
      setArtists(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.number || 0);
    } catch (err) {
      setError('Ошибка загрузки художников: ' + (err.message || 'Неизвестная ошибка'));
      setArtists([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize, isSearching]);

  useEffect(() => {
    fetchArtistsData(currentPage, searchTerm);
  }, [fetchArtistsData, currentPage, searchTerm]);

  const debouncedSearch = useCallback(
    debounce((newSearchTerm) => {
      setIsSearching(Object.values(newSearchTerm).some(val => val !== ''));
      setCurrentPage(0);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    const newSearchTerm = { ...searchTerm, [name]: value };
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({ name: '', biography: '', birthDate: '', country: '', photoPath: ''});
    setFormMode('create');
    setCurrentArtist(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (artist) => {
    setFormData({
      name: artist.name || '',
      biography: artist.biography || '',
      birthDate: artist.birthDate ? artist.birthDate.split('T')[0] : '',
      country: artist.country || '',
      photoPath: artist.photoPath || ''
    });
    setFormMode('edit');
    setCurrentArtist(artist);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      if (formMode === 'create') {
        await apiStore.apiClient.post('/artists/add', formData);
      } else {
        await apiStore.apiClient.put(`/artists/update?id=${currentArtist.id}`, formData);
      }
      setShowModal(false);
      fetchArtistsData(formMode === 'create' ? 0 : currentPage, searchTerm);
    } catch (err) {
      setFormError('Ошибка: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (artistId) => {
    if (window.confirm('Удалить этого художника?')) {
      setLoading(true);
      try {
        await apiStore.apiClient.delete(`/artists/delete/${artistId}`);
        fetchArtistsData(0, searchTerm);
      } catch (err) {
        setError('Ошибка удаления: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Управление художниками</h2>
          <Button variant="primary" onClick={openCreateModal}><FaPlus className="me-2" />Добавить</Button>
        </Card.Header>
        <Card.Body>
          <Form className="mb-3">
            <Row>
              <Col md={5}><FormControl placeholder="Имя" name="name" value={searchTerm.name} onChange={handleSearchChange} /></Col>
              <Col md={5}><FormControl placeholder="Страна" name="country" value={searchTerm.country} onChange={handleSearchChange} /></Col>
            </Row>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}
          {loading && artists.length === 0 ? (
            <div className="text-center p-5"><div className="spinner-border"></div></div>
          ) : artists.length === 0 && !loading ? (
             <Alert variant="info">Художники не найдены.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Фото</th>
                  <th>Имя</th>
                  <th>Страна</th>
                  <th>Дата рожд.</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {artists.map(artist => (
                  <tr key={artist.id}>
                    <td>{artist.id}</td>
                    <td>
                      <img 
                        src={artist.photoPath || placeholderImage} 
                        alt={artist.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
                        onError={handleImageError}
                      />
                    </td>
                    <td>{artist.name}</td>
                    <td>{artist.country}</td>
                    <td>{artist.birthDate ? new Date(artist.birthDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(artist)}><FaEdit /></Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(artist.id)}><FaTrash /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.First onClick={() => handlePageChange(0)} disabled={currentPage === 0} />
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />
              {[...Array(totalPages).keys()].map(page => (
                <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                  {page + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} />
              <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} />
            </Pagination>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{formMode === 'create' ? 'Добавить' : 'Редактировать'} художника</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Биография</Form.Label>
              <Form.Control as="textarea" rows={3} name="biography" value={formData.biography} onChange={handleFormChange}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Дата рождения</Form.Label>
              <Form.Control type="date" name="birthDate" value={formData.birthDate} onChange={handleFormChange} max={new Date().toISOString().split('T')[0]} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Страна</Form.Label>
              <Form.Control type="text" name="country" value={formData.country} onChange={handleFormChange}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL фото (photoPath)</Form.Label>
              <Form.Control type="text" name="photoPath" value={formData.photoPath} onChange={handleFormChange} />
              <Card.Img 
                src={formData.photoPath || placeholderImage} 
                alt="Preview" 
                className="mt-2" 
                style={{ maxHeight: '200px', objectFit: 'contain' }}
                onError={handleImageError}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminArtists;
