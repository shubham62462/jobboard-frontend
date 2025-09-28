import { useState, useEffect } from 'react';
import { apiClient, PaginatedResponse } from '../lib/api';
import { Job } from '../types';
import toast from 'react-hot-toast';

export const useMyJobs = (params: {
  page?: number;
  limit?: number;
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

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedResponse<Job> = await apiClient.getMyJobs(params);
      
      if (response.success && response.data) {
        setJobs(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        throw new Error(response.error || 'Failed to fetch your jobs');
      }
    } catch (error: any) {
      console.error('Error fetching my jobs:', error);
      setError(error.message);
      toast.error('Failed to fetch your jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [params.page, params.limit]);

  const createJob = async (jobData: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary?: string;
  }) => {
    try {
      const response = await apiClient.createJob(jobData);
      
      if (response.success) {
        toast.success('Job created successfully!');
        await fetchMyJobs(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create job');
      }
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast.error(error.message || 'Failed to create job');
      throw error;
    }
  };

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      const response = await apiClient.updateJob(id, jobData);
      
      if (response.success) {
        toast.success('Job updated successfully!');
        await fetchMyJobs(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update job');
      }
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error(error.message || 'Failed to update job');
      throw error;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const response = await apiClient.deleteJob(id);
      
      if (response.success) {
        toast.success('Job deleted successfully!');
        await fetchMyJobs(); // Refresh the list
      } else {
        throw new Error(response.error || 'Failed to delete job');
      }
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error(error.message || 'Failed to delete job');
      throw error;
    }
  };

  return {
    jobs,
    loading,
    error,
    pagination,
    refetch: fetchMyJobs,
    createJob,
    updateJob,
    deleteJob,
  };
};