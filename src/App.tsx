import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PermissionsProvider } from './context/PermissionsContext';
import WelcomePage from './pages/WelcomePage';
import AboutUsPage from './pages/AboutUsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PasswordResetPage from './pages/PasswordResetPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import UserManagementPage from './pages/UserManagementPage';
import ActiveTicketsPage from './pages/ActiveTicketsPage';
import AllTicketsPage from './pages/AllTicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import CreateTicketPage from './pages/CreateTicketPage';
import ExcelReportsPage from './pages/ExcelReportsPage';
import CalendarPage from './pages/CalendarPage';
import AiChatBotPage from './pages/AiChatBotPage';
import ChatPage from './pages/ChatPage';
import PerformancePage from './pages/PerformancePage';
import UserStatisticsPage from './pages/UserStatisticsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import SettingsPage from './pages/SettingsPage';
import Error404Page from './pages/Error404Page';
import Error403Page from './pages/Error403Page';
import Error505Page from './pages/Error505Page';


function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PermissionsProvider> 
            <Routes>
              {/* Public */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/aboutus" element={<AboutUsPage />} />
          
              {/* Authentication Routes */}
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              
              {/* User Dashboard & App Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/active-tickets" element={<ProtectedRoute><ActiveTicketsPage /></ProtectedRoute>} />
              <Route path="/statistics" element={<ProtectedRoute><UserStatisticsPage /></ProtectedRoute>} />

              {/* Admin Dashboard & App Routes */}
              <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/user-management" element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} />
              <Route path="/all-tickets" element={<ProtectedRoute requiredRole="admin"><AllTicketsPage /></ProtectedRoute>} />
              <Route path="/create-ticket" element={<ProtectedRoute><CreateTicketPage /></ProtectedRoute>} />
              <Route path="/performance" element={<ProtectedRoute requiredRole="admin"><PerformancePage /></ProtectedRoute>} />
              <Route path="/activity-log" element={<ProtectedRoute requiredRole="admin"><ActivityLogPage /></ProtectedRoute>} />

              {/* Both */}
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
              <Route path="/excel-reports" element={<ProtectedRoute><ExcelReportsPage /></ProtectedRoute>} />
              <Route path="/ai-chat-bot" element={<ProtectedRoute><AiChatBotPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* Error Pages */}
              <Route path="/403" element={<Error403Page />} />
              <Route path="/404" element={<Error404Page />} />
              <Route path="/505" element={<Error505Page />} />
              {/* Catch All */}
              <Route path="*" element={<Error404Page />} />
            </Routes>
          </PermissionsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
export default App;


