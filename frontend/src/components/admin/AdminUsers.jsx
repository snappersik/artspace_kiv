import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Card } from 'react-bootstrap';
import apiStore from '../../stores/ApiStore';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    roleId: 2, // По умолчанию роль USER
    roleName: 'USER'
  });
  const [formMode, setFormMode] = useState('create'); // 'create' или 'edit'
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiStore.apiClient.get('/users/getAll');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке пользователей: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (e) => {
    const roleId = parseInt(e.target.value);
    const roleName = roleId === 1 ? 'ADMIN' : roleId === 2 ? 'USER' : 'ARTIST';
    setFormData(prev => ({ ...prev, roleId, roleName }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (formMode === 'create') {
        await apiStore.apiClient.post('/users/add', formData);
      } else {
        await apiStore.apiClient.put(`/users/update?id=${currentUser.id}`, formData);
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError('Ошибка при сохранении пользователя: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setLoading(true);
      try {
        await apiStore.apiClient.delete(`/users/delete/${userId}`);
        fetchUsers();
      } catch (err) {
        setError('Ошибка при удалении пользователя: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };
  
  const openCreateModal = () => {
    setFormData({
      login: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      roleId: 2,
      roleName: 'USER'
    });
    setFormMode('create');
    setCurrentUser(null);
    setShowModal(true);
  };
  
  const openEditModal = (user) => {
    setFormData({
      login: user.login || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '', // Пароль не заполняем при редактировании
      roleId: user.roleId || 2,
      roleName: user.roleName || 'USER'
    });
    setFormMode('edit');
    setCurrentUser(user);
    setShowModal(true);
  };
  
  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Управление пользователями</h2>
          <Button variant="primary" onClick={openCreateModal}>
            Добавить пользователя
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
                  <th>Логин</th>
                  <th>Email</th>
                  <th>Имя</th>
                  <th>Фамилия</th>
                  <th>Роль</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.login}</td>
                    <td>{user.email}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.roleName}</td>
                    <td>
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => openEditModal(user)}
                      >
                        Редактировать
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(user.id)}
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
      
      {/* Модальное окно для создания/редактирования пользователя */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {formMode === 'create' ? 'Добавить пользователя' : 'Редактировать пользователя'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            {formMode === 'create' && (
              <Form.Group className="mb-3">
                <Form.Label>Пароль</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={formMode === 'create'}
                />
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Роль</Form.Label>
              <Form.Select
                name="roleId"
                value={formData.roleId}
                onChange={handleRoleChange}
                required
              >
                <option value="1">ADMIN</option>
                <option value="2">USER</option>
                <option value="3">ARTIST</option>
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

export default AdminUsers;
