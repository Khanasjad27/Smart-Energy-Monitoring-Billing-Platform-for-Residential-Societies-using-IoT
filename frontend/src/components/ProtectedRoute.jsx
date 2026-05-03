import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';
const ProtectedRoute = ({ allowedRoles }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    const user = getUser();
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
};
export default ProtectedRoute;
