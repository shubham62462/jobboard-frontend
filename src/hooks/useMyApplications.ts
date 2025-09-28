import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Application } from '../types';
import toast from 'react-hot-toast';

export const useMyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getMyApplications();
      
      if (response.success && response.data) {
        setApplications(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch applications');
      }
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const createApplication = async (data: {
    job_id: string;
    resume: string;
    cover_letter?: string;
  }) => {
    try {
      const response = await apiClient.createApplication(data);
      
      if (response.success) {
        toast.success('Application submitted successfully!');
        await fetchMyApplications(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to submit application');
      }
    } catch (error: any) {
      console.error('Error creating application:', error);
      toast.error(error.message || 'Failed to submit application');
      throw error;
    }
  };

  return {
    applications,
    loading,
    error,
    refetch: fetchMyApplications,
    createApplication,  // ✅ This is what you need!
  };
};