// src/pages/jobs/CreateJobPage.tsx - UPDATED to use backend API hooks
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMyJobs } from '../../hooks/useMyJobs';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';

interface CreateJobData {
  title: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string;
}

const CreateJobPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // ✅ Replace Supabase with hook
  const { createJob } = useMyJobs();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateJobData>();

  const onSubmit = async (data: CreateJobData) => {
    if (!user) return;

    setLoading(true);
    try {
      await createJob(data);
      navigate('/my-jobs');
    } catch (error: any) {
      // Error handling is done in the hook
      console.error('Job creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/my-jobs')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to My Jobs
          </Button>
        </div>

        <div className="card">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Plus className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
                <p className="text-gray-600">Fill in the details to attract the right candidates</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Job Title"
              placeholder="e.g. Senior Software Engineer, Marketing Manager"
              error={errors.title?.message}
              {...register('title', {
                required: 'Job title is required',
                minLength: {
                  value: 3,
                  message: 'Job title must be at least 3 characters'
                }
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location"
                placeholder="e.g. New York, NY or Remote"
                error={errors.location?.message}
                {...register('location', {
                  required: 'Location is required'
                })}
              />

              <Input
                label="Salary Range (Optional)"
                placeholder="e.g. $80,000 - $120,000"
                error={errors.salary?.message}
                {...register('salary')}
              />
            </div>

            <Textarea
              label="Job Description"
              placeholder="Describe the role, responsibilities, company culture, and what makes this opportunity exciting..."
              rows={8}
              error={errors.description?.message}
              {...register('description', {
                required: 'Job description is required',
                minLength: {
                  value: 50,
                  message: 'Job description must be at least 50 characters'
                }
              })}
            />

            <Textarea
              label="Requirements"
              placeholder="List the required skills, experience, education, and qualifications. Separate each requirement with a comma..."
              rows={6}
              error={errors.requirements?.message}
              {...register('requirements', {
                required: 'Requirements are required',
                minLength: {
                  value: 20,
                  message: 'Requirements must be at least 20 characters'
                }
              })}
            />

            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Post Job
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/my-jobs')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Your job will be posted immediately and visible to all candidates on the platform.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;
