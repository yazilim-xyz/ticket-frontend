import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import AboutUsPage from './pages/AboutUsPage';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<WelcomePage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/hakkimizda" element={<AboutUsPage />} />

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
