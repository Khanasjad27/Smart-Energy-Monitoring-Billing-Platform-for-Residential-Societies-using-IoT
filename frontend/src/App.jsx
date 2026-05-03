import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reading from './pages/Reading';
import Billing from './pages/Billing';
import Profile from './pages/Profile';

function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/reading" element={<Reading />} />
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/profile" element={<Profile />} />
                        
                        {/* Fallback to dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Route>

                {/* Default redirect to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
