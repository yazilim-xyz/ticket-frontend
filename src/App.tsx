import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Auth & Public
import WelcomePage from './pages/WelcomePage';
import AboutUsPage from './pages/AboutUsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PasswordResetPage from './pages/PasswordResetPage';

// Error Pages
import Error404Page from './pages/Error404Page';
import Error403Page from './pages/Error403Page';
import Error505Page from './pages/Error505Page';

// Main Pages
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ActiveTicketsPage from './pages/ActiveTicketsPage';
import AllTicketsPage from './pages/AllTicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ExcelReportsPage from './pages/ExcelReportsPage';
import CalendarPage from './pages/CalendarPage';
//import CreateTicketPage from './pages/CreateTicketPage';
import ChatPage from './pages/ChatPage';
import AiChatBotPage from './pages/AiChatBotPage';
//import PerformancePage from './pages/PerformancePage';
//import UserStatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/aboutus" element={<AboutUsPage />} />

        {/* Auth */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />

        {/* User */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/active-tickets" element={<ActiveTicketsPage />} />
        {/*<Route path="/statistics" element={<UserStatisticsPage />} />*/}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/ai-chat-bot" element={<AiChatBotPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        {/*<Route path="/create-ticket" element={<CreateTicketPage />} />*/}
        <Route path="/ticket/:id" element={<TicketDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Admin */}
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin-panel" element={<AdminPanelPage />} />
        <Route path="/all-tickets" element={<AllTicketsPage />} />
       {/*} <Route path="/performance" element={<PerformancePage />} />*/}
        <Route path="/excel-reports" element={<ExcelReportsPage />} />

        {/* Error Pages */}
        <Route path="/403" element={<Error403Page />} />
        <Route path="/505" element={<Error505Page />} />

        {/* Catch All */}
        <Route path="*" element={<Error404Page />} />
      </Routes>
    </Router>
  );
}
export default App;

