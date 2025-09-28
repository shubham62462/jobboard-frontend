import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';
import { Application } from '../types';

export const useApplication = (applicationId: string | undefined) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) {
      setLoading(false);
      return;
    }

    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getApplication(applicationId);
        
        if (response.success && response.data) {
          setApplication(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch application');
        }
      } catch (error: any) {
        console.error('Error fetching application:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const updateStatus = async (status: string) => {
    if (!applicationId) return;

    try {
      const response = await apiClient.updateApplicationStatus(applicationId, status);
      
      if (response.success) {
        // Update local state
        setApplication(prev => prev ? { ...prev, status } : null);
        toast.success('Application status updated!');
        return response.data;
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
    application,
    loading,
    error,
    updateStatus,
  };
};