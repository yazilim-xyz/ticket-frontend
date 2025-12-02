import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ana sayfa - şimdilik Register'a yönlendir */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        
        {/* Register Page */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 404 - Sayfa bulunamadı */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;