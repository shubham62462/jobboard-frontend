// src/pages/applications/MyApplicationsPage.tsx - UPDATED to use backend API hooks
import { Link } from 'react-router-dom';
import { FileText, Calendar, MapPin, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMyApplications } from '../../hooks/useMyApplications'; // ✅ Using hook
import { Application } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyApplicationsPage = () => {
  const { user } = useAuth();
  
  // ✅ Replace Supabase with hook
  const { applications, loading, error, refetch } = useMyApplications();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your application is being reviewed by the employer.';
      case 'reviewed':
        return 'The employer has reviewed your application.';
      case 'accepted':
        return 'Congratulations! Your application has been accepted.';
      case 'rejected':
        return 'Unfortunately, your application was not selected for this position.';
      default:
        return 'Application status unknown.';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'reviewed':
        return 'badge-secondary';
      case 'accepted':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <p className="text-red-600 mb-4">Error loading applications: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600">
              Track the status of your job applications
            </p>
          </div>
          <Link to="/jobs" className="mt-4 sm:mt-0">
            <Button>Browse More Jobs</Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">
              Start applying to jobs to see your applications here.
            </p>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((application: Application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {application.job?.title || 'Job Title'}
                        </h3>
                        {application.job?.employer && (
                          <p className="text-gray-600 mb-2">
                            {application.job.employer.first_name} {application.job.employer.last_name}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {application.job?.location || 'Location not specified'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Applied {formatDate(application.created_at)}
                          </div>
                          {application.ai_score && (
                            <div className="flex items-center">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                AI Score: {application.ai_score}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                        {application.status}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {application.job?.description && application.job.description.length > 150 
                        ? `${application.job.description.substring(0, 150)}...` 
                        : application.job?.description
                      }
                    </p>

                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <p className="text-sm text-gray-600">
                        <strong>Status:</strong> {getStatusMessage(application.status)}
                      </p>
                    </div>

                    {/* AI Analysis if available */}
                    {application.ai_analysis && (
                      <div className="bg-blue-50 p-3 rounded-md mb-4">
                        <h5 className="font-medium text-gray-900 mb-2 text-sm">AI Analysis:</h5>
                        <p className="text-sm text-gray-600 mb-2">{application.ai_analysis.explanation}</p>
                        <p className="text-xs text-blue-600 font-medium">{application.ai_analysis.recommendation}</p>
                      </div>
                    )}

                    {/* Resume Preview */}
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <h5 className="font-medium text-gray-900 mb-2 text-sm">Your Application:</h5>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {application.resume.length > 100 
                          ? `${application.resume.substring(0, 100)}...` 
                          : application.resume
                        }
                      </p>
                      {application.cover_letter && (
                        <p className="text-xs text-gray-500 mt-1">
                          + Cover letter included
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                    <Link to={`/jobs/${application.job_id}`} className="flex-1 lg:flex-none">
                      <Button variant="secondary" size="sm" className="w-full" icon={<Eye className="w-4 h-4" />}>
                        View Job
                      </Button>
                    </Link>
                    <Link to={`/application/${application.id}`} className="flex-1 lg:flex-none">
                      <Button variant="primary" size="sm" className="w-full" icon={<FileText className="w-4 h-4" />}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {applications.length > 0 && (
          <div className="mt-8 text-center">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {Object.entries(
                applications.reduce((acc: Record<string, number>, app) => {
                  acc[app.status] = (acc[app.status] || 0) + 1;
                  return acc;
                }, {})
              ).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{status}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Total applications: {applications.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;