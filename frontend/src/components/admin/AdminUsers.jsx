import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Alert, Card, Pagination, InputGroup, FormControl, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import apiStore from '../../stores/ApiStore';
import { debounce } from 'lodash'; // Для задержки поиска

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Ошибка для списка
  const [formError, setFormError] = useState(null); // Ошибка для модального окна

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Можно сделать настраиваемым

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    login: '', email: '', firstName: '', lastName: '',
    password: '', roleId: 2, // USER по умолчанию
  });
  const [formMode, setFormMode] = useState('create'); // 'create' или 'edit'

  // Search state
  const [searchTerm, setSearchTerm] = useState({
    login: '', email: '', firstName: '', lastName: '', roleName: ''
  });
  const [isSearching, setIsSearching] = useState(false);

  const fetchUsersData = useCallback(async (page, searchPayload) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (isSearching && searchPayload && Object.values(searchPayload).some(val => val !== '')) {
        data = await apiStore.searchUsers(searchPayload, page, pageSize);
      } else {
        data = await apiStore.fetchUsers(page, pageSize);
      }
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.number || 0); // Убедимся, что currentPage обновляется по ответу сервера
    } catch (err) {
      setError('Ошибка при загрузке пользователей: ' + (err.message || 'Неизвестная ошибка'));
      setUsers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize, isSearching]);

  useEffect(() => {
    fetchUsersData(currentPage, searchTerm);
  }, [fetchUsersData, currentPage, searchTerm]); // searchTerm добавлен в зависимости


  const debouncedSearch = useCallback(
    debounce((newSearchTerm) => {
      setIsSearching(Object.values(newSearchTerm).some(val => val !== ''));
      setCurrentPage(0); // Сброс на первую страницу при новом поиске
      // fetchUsersData будет вызван через useEffect, так как searchTerm изменился
    }, 500),
    [] // fetchUsersData не должен быть здесь, т.к. он сам зависит от searchTerm
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

  const handleRoleChange = (e) => {
    const roleId = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, roleId }));
  };

  const openCreateModal = () => {
    setFormData({ login: '', email: '', firstName: '', lastName: '', password: '', roleId: 2 });
    setFormMode('create');
    setCurrentUser(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setFormData({
      login: user.login || '', email: user.email || '',
      firstName: user.firstName || '', lastName: user.lastName || '',
      password: '', // Пароль не предзаполняем
      roleId: user.roleId || 2,
    });
    setFormMode('edit');
    setCurrentUser(user);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Или отдельный стейт для загрузки формы
    setFormError(null);
    try {
      if (formMode === 'create') {
        await apiStore.apiClient.post('/users/add', formData);
      } else {
        // Отправляем только те поля, которые могут быть изменены, или всю formData
        // Если пароль пустой, не отправляем его или бэкенд должен его игнорировать
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
            delete dataToUpdate.password;
        }
        await apiStore.apiClient.put(`/users/update?id=${currentUser.id}`, dataToUpdate);
      }
      setShowModal(false);
      fetchUsersData(currentPage, searchTerm); // Обновляем список
    } catch (err) {
      setFormError('Ошибка: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setLoading(true);
      try {
        await apiStore.apiClient.delete(`/users/delete/${userId}`);
        fetchUsersData(0, searchTerm); // Перезагрузить на первую страницу или текущую
      } catch (err) {
        setError('Ошибка при удалении: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Управление пользователями</h2>
          <Button variant="primary" onClick={openCreateModal}><FaPlus className="me-2" />Добавить</Button>
        </Card.Header>
        <Card.Body>
          <Form className="mb-3">
            <Row>
              <Col md={2}><FormControl placeholder="Логин" name="login" value={searchTerm.login} onChange={handleSearchChange} /></Col>
              <Col md={2}><FormControl placeholder="Email" name="email" value={searchTerm.email} onChange={handleSearchChange} /></Col>
              <Col md={2}><FormControl placeholder="Имя" name="firstName" value={searchTerm.firstName} onChange={handleSearchChange} /></Col>
              <Col md={2}><FormControl placeholder="Фамилия" name="lastName" value={searchTerm.lastName} onChange={handleSearchChange} /></Col>
              <Col md={2}><FormControl placeholder="Роль (ADMIN, USER)" name="roleName" value={searchTerm.roleName} onChange={handleSearchChange} /></Col>
              {/* <Col md={2}><Button onClick={() => fetchUsersData(0, searchTerm)}><FaSearch /> Поиск</Button></Col> */}
            </Row>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading && users.length === 0 ? (
            <div className="text-center p-5"><div className="spinner-border"></div></div>
          ) : users.length === 0 && !loading ? (
            <Alert variant="info">Пользователи не найдены.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th><th>Логин</th><th>Email</th><th>Имя</th><th>Фамилия</th><th>Роль</th><th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td><td>{user.login}</td><td>{user.email}</td>
                    <td>{user.firstName}</td><td>{user.lastName}</td><td>{user.roleName}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(user)}><FaEdit /></Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(user.id)}><FaTrash /></Button>
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
      
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{formMode === 'create' ? 'Добавить пользователя' : 'Редактировать пользователя'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Логин</Form.Label>
              <Form.Control type="text" name="login" value={formData.login} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Пароль {formMode === 'create' ? '(обязательно)' : '(оставьте пустым, если не хотите менять)'}</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleFormChange} required={formMode === 'create'} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Роль</Form.Label>
              <Form.Select name="roleId" value={formData.roleId} onChange={handleRoleChange} required>
                <option value="1">ADMIN</option>
                <option value="2">USER</option>
                <option value="3">ARTIST</option>
              </Form.Select>
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

export default AdminUsers;
