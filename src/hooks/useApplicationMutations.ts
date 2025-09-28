import { useState } from 'react';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

export const useApplicationMutations = () => {
  const [loading, setLoading] = useState(false);

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    setLoading(true);
    try {
      const response = await apiClient.updateApplicationStatus(applicationId, status);
      
      if (response.success) {
        toast.success(`Application ${status}!`);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update application status');
      }
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast.error(error.message || 'Failed to update application status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateApplications = async (updates: { id: string; status: string }[]) => {
    setLoading(true);
    try {
      const promises = updates.map(({ id, status }) => 
        apiClient.updateApplicationStatus(id, status)
      );
      
      await Promise.all(promises);
      toast.success(`${updates.length} applications updated!`);
    } catch (error: any) {
      console.error('Error bulk updating applications:', error);
      toast.error('Failed to update some applications');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateApplicationStatus,
    bulkUpdateApplications,
  };
};