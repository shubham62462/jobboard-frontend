import { useState, useEffect } from 'react';
import { apiClient, PaginatedResponse } from '../lib/api';
import { Job } from '../types';
import toast from 'react-hot-toast';

export const useJobs = (params: {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
} = {}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedResponse<Job> = await apiClient.getJobs(params);
      
      if (response.success && response.data) {
        setJobs(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        throw new Error(response.error || 'Failed to fetch jobs');
      }
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setError(error.message);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [params.page, params.limit, params.search, params.location]);

  return {
    jobs,
    loading,
    error,
    pagination,
    refetch: fetchJobs,
  };
};
