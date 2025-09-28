// src/pages/jobs/JobsPage.tsx - UPDATED to use backend API hooks
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { Job } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const JobsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedLocation(locationFilter);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, locationFilter]);

  // ✅ Replace Supabase with hook
  const { jobs, loading, error, pagination, refetch } = useJobs({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    location: debouncedLocation,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCurrentPage(1);
  };

  if (loading && jobs.length === 0) {
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing opportunities from top companies. Use our filters to find the perfect match.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, skills, companies..."
                  className="pl-10 input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="pl-10 input"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              
              <Button onClick={clearFilters} variant="secondary">
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {pagination.total} job{pagination.total !== 1 ? 's' : ''} found
            {(debouncedSearch || debouncedLocation) && (
              <span className="ml-2">
                {debouncedSearch && `for "${debouncedSearch}"`}
                {debouncedLocation && ` in "${debouncedLocation}"`}
              </span>
            )}
          </p>
        </div>

        {jobs.length === 0 && !loading ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or removing some filters.
            </p>
            <Button onClick={clearFilters} variant="secondary">
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      <span className="badge badge-success">
                        {job.status}
                      </span>
                    </div>
                    
                    {job.employer && (
                      <p className="text-gray-600 mb-2">
                        {job.employer.first_name} {job.employer.last_name}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
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

                    <p className="text-gray-700 mb-3">
                      {job.description.length > 200 
                        ? `${job.description.substring(0, 200)}...` 
                        : job.description
                      }
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.split(',').slice(0, 3).map((req, index) => (
                        <span 
                          key={index}
                          className="badge badge-secondary"
                        >
                          {req.trim()}
                        </span>
                      ))}
                      {job.requirements.split(',').length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{job.requirements.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 md:ml-6">
                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="primary">
                        View Details
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

        {/* Loading overlay for pagination */}
        {loading && jobs.length > 0 && (
          <div className="mt-4 flex justify-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
