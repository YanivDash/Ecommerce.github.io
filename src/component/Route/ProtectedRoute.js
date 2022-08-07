import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);

  if (!loading) {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    } else {
      return <Component />;
    }
  }
  return <Component />;
};

export default ProtectedRoute;
