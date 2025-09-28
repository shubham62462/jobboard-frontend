// src/pages/jobs/MyJobsPage.tsx - UPDATED to use backend API hooks
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Users, Calendar, MapPin, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMyJobs } from '../../hooks/useMyJobs';
import { Job } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyJobsPage = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  
  // ✅ Replace Supabase with hook
  const { jobs, loading, error, pagination, refetch } = useMyJobs({
    page: currentPage,
    limit: 10
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Jobs</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
            <p className="text-gray-600">
              Manage your job postings and track applications
            </p>
          </div>
          <Link to="/create-job" className="mt-4 sm:mt-0">
            <Button icon={<Plus className="w-4 h-4" />}>Post New Job</Button>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 mb-6">
              Start by posting your first job to attract talented candidates.
            </p>
            <Link to="/create-job">
              <Button icon={<Plus className="w-4 h-4" />}>Post Your First Job</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          {job.salary && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {job.salary}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(job.created_at)}
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${
                        job.status === 'active' ? 'badge-success' :
                        job.status === 'closed' ? 'badge-error' :
                        'badge-secondary'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">
                      {job.description.length > 150 
                        ? `${job.description.substring(0, 150)}...` 
                        : job.description
                      }
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <Link 
                        to={`/applications/${job.id}`}
                        className="hover:text-blue-600 flex items-center"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        View Applications
                      </Link>
                      <Link 
                        to={`/jobs/${job.id}`}
                        className="hover:text-blue-600 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                    <Link to={`/applications/${job.id}`} className="flex-1 lg:flex-none">
                      <Button variant="primary" size="sm" className="w-full" icon={<Users className="w-4 h-4" />}>
                        Applications
                      </Button>
                    </Link>
                    <Link to={`/jobs/${job.id}`} className="flex-1 lg:flex-none">
                      <Button variant="secondary" size="sm" className="w-full" icon={<Eye className="w-4 h-4" />}>
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobsPage;
