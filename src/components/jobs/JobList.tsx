import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { Job } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { MagnifyingGlassIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

const JobList = () => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');

  // Debounce search inputs
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedLocation(location);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [search, location]);

  const { jobs, loading, error, pagination, refetch } = useJobs({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    location: debouncedLocation,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Next Job</h1>
        
        {/* Search Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {jobs.length} of {pagination.total} jobs
          {(debouncedSearch || debouncedLocation) && (
            <span className="ml-2">
              for "{debouncedSearch}" in "{debouncedLocation}"
            </span>
          )}
        </p>
      </div>

      {/* Job List */}
      <div className="space-y-6">
        {jobs.map((job: Job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Empty State */}
      {jobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="mt-2 text-gray-600">
            Try adjusting your search criteria or check back later.
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
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
  );
};

// Job Card Component
const JobCard = ({ job }: { job: Job }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Link
            to={`/jobs/${job.id}`}
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {job.title}
          </Link>
          
          {job.employer && (
            <p className="text-gray-600 mt-1">
              {job.employer.first_name} {job.employer.last_name}
            </p>
          )}
          
          <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {new Date(job.created_at).toLocaleDateString()}
            </div>
          </div>

          <p className="mt-3 text-gray-700 line-clamp-2">
            {job.description}
          </p>

          {job.salary && (
            <p className="mt-2 text-lg font-medium text-green-600">
              {job.salary}
            </p>
          )}
        </div>

        <div className="ml-4">
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobList;