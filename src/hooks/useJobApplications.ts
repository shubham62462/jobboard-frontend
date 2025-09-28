import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

export const useJobApplications = (jobId: string | undefined) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getJobApplications(jobId);
        
        if (response.success && response.data) {
          setApplications(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch applications');
        }
      } catch (error: any) {
        console.error('Error fetching job applications:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await apiClient.updateApplicationStatus(applicationId, status);
      
      if (response.success) {
        toast.success('Application status updated!');
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status } 
              : app
          )
        );
      } else {
        throw new Error(response.error || 'Failed to update application status');
      }
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast.error(error.message || 'Failed to update application status');
      throw error;
    }
  };

  return {
    applications,
    loading,
    error,
    updateApplicationStatus,
  };
};