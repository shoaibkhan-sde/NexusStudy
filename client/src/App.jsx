import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard';
import ClassroomView from './pages/Classroom/ClassroomView';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    if (!token) return <Navigate to="/login" />;
    return children;
};

function App() {
  return (
    <AuthProvider>
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/classroom/:id" element={
                    <ProtectedRoute>
                        <ClassroomView />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
