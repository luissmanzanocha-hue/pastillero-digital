import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ResidentsPage from './pages/ResidentsPage';
import ResidentDashboard from './pages/ResidentDashboard';
import ResidentKardex from './pages/ResidentKardex';
import ResidentInventory from './pages/ResidentInventory';
import ResidentCalendar from './pages/ResidentCalendar';
import ResidentHistory from './pages/ResidentHistory';
import ResidentReports from './pages/ResidentReports';
import MedicationDetail from './pages/MedicationDetail';

import GlobalInventoryPage from './pages/GlobalInventoryPage';
import AdministerPage from './pages/AdministerPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <Router>
                    <Routes>
                        {/* Public Route */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected Routes */}
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <div className="min-h-screen bg-[#0F172A] text-white">
                                        <Sidebar />
                                        <main className="lg:pl-80 pt-16 lg:pt-0">
                                            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                                                <Routes>
                                                    <Route path="/" element={<HomePage />} />
                                                    <Route path="/global-inventory" element={<GlobalInventoryPage />} />
                                                    <Route path="/calendar" element={<CalendarPage />} />
                                                    <Route path="/reports" element={<ReportsPage />} />
                                                    <Route path="/settings" element={<SettingsPage />} />
                                                    <Route path="/residents" element={<ResidentsPage />} />
                                                    <Route path="/resident/:residentId" element={<ResidentDashboard />} />
                                                    <Route path="/resident/:residentId/kardex" element={<ResidentKardex />} />
                                                    <Route path="/resident/:residentId/inventory" element={<ResidentInventory />} />
                                                    <Route path="/resident/:residentId/calendar" element={<ResidentCalendar />} />
                                                    <Route path="/resident/:residentId/history" element={<ResidentHistory />} />
                                                    <Route path="/resident/:residentId/reports" element={<ResidentReports />} />
                                                    <Route path="/resident/:residentId/administer" element={<AdministerPage />} />
                                                    <Route path="/resident/:residentId/medication/:medicationId" element={<MedicationDetail />} />
                                                    <Route path="*" element={<Navigate to="/" replace />} />
                                                </Routes>
                                            </div>
                                        </main>
                                    </div>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AppProvider>
        </AuthProvider>
    );
}

export default App;

