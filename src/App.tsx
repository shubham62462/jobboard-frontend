// src/App.tsx - Complete App with Authentication and Role-based Routing
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import JobsPage from './pages/jobs/JobsPage';
import JobDetailsPage from './pages/jobs/JobDetailsPage';
import CreateJobPage from './pages/jobs/CreateJobPage';
import MyJobsPage from './pages/jobs/MyJobsPage';
import ApplicationsPage from './pages/applications/ApplicationsPage';
import MyApplicationsPage from './pages/applications/MyApplicationsPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" replace /> : <RegisterPage />} 
          />
          
          {/* Protected Routes - Employers */}
          <Route
            path="/create-job"
            element={
              <ProtectedRoute requireAuth requireRole="employer">
                <CreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute requireAuth requireRole="employer">
                <MyJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:jobId"
            element={
              <ProtectedRoute requireAuth requireRole="employer">
                <ApplicationsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Routes - Candidates */}
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute requireAuth requireRole="candidate">
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;