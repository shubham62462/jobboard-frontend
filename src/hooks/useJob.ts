import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Job } from '../types';

export const useJob = (id: string | undefined) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getJob(id);
        
        if (response.success && response.data) {
          setJob(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch job');
        }
      } catch (error: any) {
        console.error('Error fetching job:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  return { job, loading, error };
};