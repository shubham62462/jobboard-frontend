import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Job } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useEmployerJob = (jobId: string | undefined) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!jobId || !user) {
      setLoading(false);
      return;
    }

    const fetchEmployerJob = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getJob(jobId);
        
        if (response.success && response.data) {
          setJob(response.data);
          // Check if current user is the employer
          setIsOwner(response.data.employer_id === user.id);
        } else {
          throw new Error(response.error || 'Failed to fetch job');
        }
      } catch (error: any) {
        console.error('Error fetching employer job:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerJob();
  }, [jobId, user]);

  return {
    job,
    loading,
    error,
    isOwner, // Boolean to check if user can modify this job
  };
};