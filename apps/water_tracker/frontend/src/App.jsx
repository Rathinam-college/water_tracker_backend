import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DailyMovement from './components/DailyMovement';
import DailyYield from './components/DailyYieldReport';
import YearlyTrend from './components/YearlyTrend';
import DailyNormalConsumption from './components/DailyNormalConsumptionReport';
import WaterTypeConsumption from './components/WaterTypeConsumption';
import VendorUsage from './components/VendorUsage';
import VehicleUtilization from './components/VehicleUtilization';
import CostComparison from './components/CostComparison';
import CapacityUtilization from './components/CapacityUtilization';
import SiteConsumption from './components/SiteConsumption';
import CategoryMonthlyBreakdown from './components/CategoryMonthlyBreakdown';
import StudentCountTable from './components/StudentCountTable';
import Slideshow from './components/Slideshow';

import ProcurementTracker from './components/ProcurementTracker';
import ProcurementReport from './components/ProcurementReport';
import BudgetTracking from './components/BudgetTracking';
import UserManagement from './components/UserManagement';
import { AuthProvider, useAuth } from './context/AuthContext';

// Restore Real Components
import Entries from './components/Entries';
import YieldEntries from './components/YieldEntries';
import ConsumptionEntries from './components/ConsumptionEntries';
import AddEntry from './components/AddEntry';
import Locations from './components/Locations';
import Sources from './components/Sources';
import Vehicles from './components/Vehicles';
import Rates from './components/Rates';
import Reports from './components/Reports';
import SiteDetail from './components/SiteDetail';
import VendorDetail from './components/VendorDetail';
import BulkYieldEntry from './components/BulkYieldEntry';
import BulkConsumptionEntry from './components/BulkConsumptionEntry';
// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Access Route Component
const AccessRoute = ({ children, permission }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || user[permission] !== true) return <Navigate to="/" replace />;
  return children;
};


function App() {
  const { isAuthenticated } = useAuth(); // Use useAuth hook
  const [theme, setTheme] = useState(localStorage.getItem('wt_theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'ocean', 'robin');
    
    if (theme === 'dark' || theme === 'ocean' || theme === 'robin') {
      root.classList.add('dark');
    }
    
    root.classList.add(theme);
    localStorage.setItem('wt_theme', theme);
  }, [theme]);

  const themes = ['light', 'dark', 'ocean', 'robin'];
  
  const toggleTheme = () => {
    setTheme(prev => {
      const currentIndex = themes.indexOf(prev) === -1 ? 0 : themes.indexOf(prev);
      return themes[(currentIndex + 1) % themes.length];
    });
  };

  return (
    <Router basename="/water_tracker">
      <div className="min-h-screen flex w-full bg-white font-sans transition-colors duration-200 dark:bg-slate-900">
        
        {isAuthenticated && (
          <Sidebar theme={theme} toggleTheme={toggleTheme} />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 w-full bg-white dark:bg-slate-900 transition-colors duration-200 overflow-y-auto ${isAuthenticated ? 'main-container' : ''}`}>

          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login theme={theme} toggleTheme={toggleTheme} />
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/entries"
              element={
                <AccessRoute permission="can_access_operations">
                  <Entries />
                </AccessRoute>
              }
            />
            <Route
              path="/yield-entries"
              element={
                <AccessRoute permission="can_access_operations">
                  <YieldEntries />
                </AccessRoute>
              }
            />
            <Route
              path="/consumption-entries"
              element={
                <AccessRoute permission="can_access_operations">
                  <ConsumptionEntries />
                </AccessRoute>
              }
            />
            <Route
              path="/add-entry"
              element={
                <AccessRoute permission="can_access_operations">
                  <AddEntry />
                </AccessRoute>
              }
            />
            <Route
              path="/edit-entry/:id"
              element={
                <AccessRoute permission="can_access_operations">
                  <AddEntry />
                </AccessRoute>
              }
            />
            <Route
              path="/edit-yield-entry/:id"
              element={
                <AccessRoute permission="can_access_operations">
                  <AddEntry />
                </AccessRoute>
              }
            />
            <Route
              path="/add-consumption-entry"
              element={
                <AccessRoute permission="can_access_operations">
                  <AddEntry />
                </AccessRoute>
              }
            />
            <Route
              path="/edit-consumption-entry/:id"
              element={
                <AccessRoute permission="can_access_operations">
                  <AddEntry />
                </AccessRoute>
              }
            />
            <Route
              path="/locations"
              element={
                <AccessRoute permission="can_access_master_data">
                  <Locations />
                </AccessRoute>
              }
            />
            <Route
              path="/sources"
              element={
                <AccessRoute permission="can_access_master_data">
                  <Sources />
                </AccessRoute>
              }
            />
            <Route
              path="/vehicles"
              element={
                <AccessRoute permission="can_access_master_data">
                  <Vehicles />
                </AccessRoute>
              }
            />
            <Route
              path="/rates"
              element={
                <AccessRoute permission="can_access_master_data">
                  <Rates />
                </AccessRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <AccessRoute permission="can_access_reports">
                  <Reports />
                </AccessRoute>
              }
            />
            <Route
              path="/site-detail/:locationId"
              element={
                <AccessRoute permission="can_access_reports">
                  <SiteDetail />
                </AccessRoute>
              }
            />
            <Route
              path="/vendor-detail/:vendorId"
              element={
                <AccessRoute permission="can_access_reports">
                  <VendorDetail />
                </AccessRoute>
              }
            />
            <Route
              path="/bulk-yield-entry"
              element={
                <AccessRoute permission="can_access_operations">
                  <BulkYieldEntry />
                </AccessRoute>
              }
            />
            <Route
              path="/bulk-consumption-entry"
              element={
                <AccessRoute permission="can_access_operations">
                  <BulkConsumptionEntry />
                </AccessRoute>
              }
            />
            <Route
              path="/student-counts"
              element={
                <AccessRoute permission="can_access_master_data">
                  <StudentCountTable />
                </AccessRoute>
              }
            />
            <Route
              path="/procurement"
              element={
                <AccessRoute permission="can_access_operations">
                  <ProcurementTracker />
                </AccessRoute>
              }
            />
            <Route
              path="/procurement-report"
              element={
                <AccessRoute permission="can_access_reports">
                  <div className="w-full px-6 py-6">
                    <ProcurementReport />
                  </div>
                </AccessRoute>
              }
            />
            <Route
              path="/budget-tracking"
              element={
                <AccessRoute permission="can_access_master_data">
                  <BudgetTracking />
                </AccessRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin/users"
              element={
                <AccessRoute permission="can_manage_users">
                  <UserManagement />
                </AccessRoute>
              }
            />
            <Route
              path="/reports/slideshow"
              element={
                <AccessRoute permission="can_access_reports">
                  <Slideshow />
                </AccessRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router >
  );
}

const RootApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default RootApp;
