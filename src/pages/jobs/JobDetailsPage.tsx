// src/pages/jobs/JobDetailsPage.tsx - UPDATED with Application Modal
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Calendar, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useJob } from '../../hooks/useJob';
import { useMyApplications } from '../../hooks/useMyApplications';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ApplicationModal from '../../components/applications/ApplicationModal';
import toast from 'react-hot-toast';

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { job, loading, error } = useJob(id);
  const { createApplication } = useMyApplications();

  // ✅ Modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ✅ Updated apply handler to show modal
  const handleApplyClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!job) return;

    setShowApplicationModal(true);
  };

  // ✅ Handle application submission from modal
  const handleApplicationSubmit = async (applicationData: { resume: string; cover_letter?: string }) => {
    if (!job) return;

    setIsSubmitting(true);
    try {
      await createApplication({
        job_id: job.id,
        resume: applicationData.resume,
        cover_letter: applicationData.cover_letter
      });
      
      setShowApplicationModal(false);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      console.error('Application error:', error);
      // Error handling is done in the hook, but we can add custom logic here if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Close modal handler
  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowApplicationModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card text-center">
          <p className="text-red-600 mb-4">{error || 'Job not found'}</p>
          <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jobs')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Jobs
          </Button>
        </div>

        <div className="card">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <span className={`badge ${
                job.status === 'active' ? 'badge-success' :
                job.status === 'closed' ? 'badge-error' :
                'badge-secondary'
              }`}>
                {job.status}
              </span>
            </div>

            {job.employer && (
              <p className="text-lg text-gray-700 mb-4">
                {job.employer.first_name} {job.employer.last_name}
                {job.employer.bio && (
                  <span className="text-gray-600 block text-sm mt-1">{job.employer.bio}</span>
                )}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {job.location}
              </div>
              {job.salary && (
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {job.salary}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Posted {formatDate(job.created_at)}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-gray-700">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="prose max-w-none text-gray-700">
                <ul className="list-disc list-inside space-y-2">
                  {job.requirements.split(',').map((req, index) => (
                    <li key={index}>{req.trim()}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ✅ Updated Apply Section */}
            {user?.role === 'candidate' && job.status === 'active' && (
              <div className="border-t pt-6">
                <Button
                  icon={<Send className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                  onClick={handleApplyClick}
                  size="lg"
                >
                  Apply for this Job
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Click to fill out your application with resume and cover letter
                </p>
              </div>
            )}

            {user?.role === 'employer' && user.id === job.employer_id && (
              <div className="border-t pt-6">
                <div className="flex gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/applications/${job.id}`)}
                  >
                    View Applications
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/edit-job/${job.id}`)}
                  >
                    Edit Job
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Application Modal */}
      {user && job && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={handleCloseModal}
          onSubmit={handleApplicationSubmit}
          job={job}
          user={user}
          loading={isSubmitting}
        />
      )}
    </div>
  );
};

export default JobDetailsPage;