import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BorrowerListPage from './pages/BorrowerListPage';
import BorrowerDetailsPage from './pages/BorrowerDetailsPage';
import AddLoanPage from './pages/AddLoanPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Authentication Route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />

        {/* Protected Dashboard and Management Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="borrowers" element={<BorrowerListPage />} />
          <Route path="borrowers/:id" element={<BorrowerDetailsPage />} />
          <Route path="add-loan" element={<AddLoanPage />} />
        </Route>

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
