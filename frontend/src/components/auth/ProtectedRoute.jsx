import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import apiStore from '../../stores/ApiStore';

const ProtectedRoute = observer(({ children }) => {
  const [checking, setChecking] = useState(true);
  const { isAuthenticated } = apiStore;
  
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await apiStore.checkAuth();
      } catch (error) {
        console.error("Authentication check error:", error);
      } finally {
        setChecking(false);
      }
    };
    
    checkAuthentication();
  }, []);
  
  if (checking) {
    return <div className="text-center mt-5">Проверка аутентификации...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
});

export default ProtectedRoute;
