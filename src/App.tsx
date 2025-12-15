import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PermissionsProvider } from './context/PermissionsContext';
import WelcomePage from './pages/WelcomePage';
import AboutUsPage from './pages/AboutUsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PasswordResetPage from './pages/PasswordResetPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanelPage from './pages/AdminPanelPage';
import ActiveTicketsPage from './pages/ActiveTicketsPage';
import AllTicketsPage from './pages/AllTicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import CreateTicketPage from './pages/CreateTicketPage';
import ExcelReportsPage from './pages/ExcelReportsPage';
import CalendarPage from './pages/CalendarPage';
import AiChatBotPage from './pages/AiChatBotPage';
import ChatPage from './pages/ChatPage';
import PerformancePage from './pages/PerformancePage';
import UserStatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import Error404Page from './pages/Error404Page';
import Error403Page from './pages/Error403Page';
import Error505Page from './pages/Error505Page';

function App() {
  return (
    <ThemeProvider>
      <PermissionsProvider> 
        <Router>
          <Routes>
            {/* Public*/}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/aboutus" element={<AboutUsPage />} />
        
            {/* Authentication Routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<PasswordResetPage />} />
            
            {/* User Dashboard & App Routes */}
            <Route path="/dashboard" element={ <ProtectedRoute requiredRole="user"> <DashboardPage /> </ProtectedRoute>} />
            <Route path="/active-tickets" element={<ActiveTicketsPage />} />
            <Route path="/statistics" element={<UserStatisticsPage />} />

            {/* Admin Dashboard & App Routes  */}
            <Route path="/admin-dashboard" element={ <ProtectedRoute requiredRole="admin"> <AdminDashboardPage /> </ProtectedRoute>} />
            <Route path="/admin-panel" element={<AdminPanelPage />} />
            <Route path="/all-tickets" element={<AllTicketsPage />} />
            <Route path="/create-ticket" element={<CreateTicketPage />} />
            <Route path="/performance" element={<PerformancePage />} />

            {/* Both */}
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/ticket/:id" element={<TicketDetailPage />} />
            <Route path="/excel-reports" element={<ExcelReportsPage />} />
            <Route path="/ai-chat-bot" element={<AiChatBotPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Error Pages */}
            <Route path="/403" element={<Error403Page />} />
            <Route path="/404" element={<Error404Page />} />
            <Route path="/505" element={<Error505Page />} />
            {/* Catch All */}
            <Route path="*" element={<Error404Page />} />
          </Routes>
        </Router>
      </PermissionsProvider>
    </ThemeProvider>
  );
}
export default App;


