import React from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Добавил useLocation
import { observer } from 'mobx-react';
import apiStore from '../../stores/ApiStore';

const ProtectedRoute = observer(({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = apiStore;
  const location = useLocation(); // Для state={{ from: location }}

  // Если идет первоначальная загрузка состояния аутентификации (checkAuth)
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  // Если пользователь не аутентифицирован, перенаправляем на /login
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Пользователь не аутентифицирован, перенаправление на /login');
    // Сохраняем текущий путь, чтобы вернуться после логина
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Если требуется доступ только для админа, проверяем роль
  if (adminOnly && user?.roleName !== 'ADMIN') {
    console.log('ProtectedRoute: Доступ запрещен. Требуется роль ADMIN, текущая роль:', user?.roleName);
    // Перенаправляем на главную страницу или страницу ошибки "доступ запрещен"
    return <Navigate to="/" replace />; 
  }

  // Если все проверки пройдены, отображаем дочерний компонент
  return children;
});

export default ProtectedRoute;
