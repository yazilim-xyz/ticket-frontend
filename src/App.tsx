import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import AboutUsPage from './pages/AboutUsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PasswordResetPage from './pages/PasswordResetPage';
import Error404Page from './pages/Error404Page';
import Error403Page from './pages/Error403Page';
import Error505Page from './pages/Error505Page';

function App() {
  return (
    <Router>
      <Routes>
        {/* Welcome Page*/}
        <Route path="/" element={<WelcomePage />} />
        
         {/* Authentication Routes */}
        {/* Register Page */}
        <Route path="/register" element={<RegisterPage />} />
        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />
        {/* Password Reset Page */}
        <Route path="/reset-password" element={<PasswordResetPage />} />

        {/* About Us Page */}
        <Route path="/aboutus" element={<AboutUsPage />} />
        
          {/* Error Pages */}
        <Route path="/403" element={<Error403Page />} />
        <Route path="/404" element={<Error404Page />} />
        <Route path="/505" element={<Error505Page />} />

        {/* Catch All 404 - Sayfa bulunamadı */}
        <Route path="*" element={<Error404Page />} />
      </Routes>
    </Router>
  );
}
export default App;

