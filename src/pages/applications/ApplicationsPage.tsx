// src/pages/applications/ApplicationsPage.tsx - UPDATED to use backend API hooks
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Star, CheckCircle, X, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEmployerJob } from '../../hooks/useEmployerJob'; // ✅ Using hook
import { useJobApplications } from '../../hooks/useJobApplications'; // ✅ Using hook
import { Application, Job } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ApplicationsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);

  // ✅ Replace Supabase with hooks
  const { job, loading: jobLoading, error: jobError, isOwner } = useEmployerJob(jobId);
  const { applications, loading: applicationsLoading, updateApplicationStatus } = useJobApplications(jobId);

  const loading = jobLoading || applicationsLoading;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
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

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      await updateApplicationStatus(applicationId, status);
      // Success toast is handled in the hook
    } catch (error) {
      console.error('Error updating application status:', error);
      // Error toast is handled in the hook
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <p className="text-red-600 mb-4">{jobError || 'Job not found'}</p>
          <Button onClick={() => navigate('/my-jobs')}>Back to My Jobs</Button>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <p className="text-red-600 mb-4">Access denied. You are not the owner of this job.</p>
          <Button onClick={() => navigate('/my-jobs')}>Back to My Jobs</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/my-jobs')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to My Jobs
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Applications for "{job.title}"
          </h1>
          <p className="text-gray-600 mb-4">
            Review candidates and their AI-powered compatibility scores
          </p>
          
          {/* Job Summary */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span><strong>Status:</strong> {job.status}</span>
              <span><strong>Location:</strong> {job.location}</span>
              {job.salary && <span><strong>Salary:</strong> {job.salary}</span>}
              <span><strong>Applications:</strong> {applications.length}</span>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">
              Once candidates start applying, you'll see their profiles and AI compatibility scores here.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => navigate(`/jobs/${job.id}`)}>
                View Job Details
              </Button>
              <Button onClick={() => navigate('/jobs')}>
                Browse All Jobs
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Applications Summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(
                  applications.reduce((acc: Record<string, number>, app) => {
                    acc[app.status] = (acc[app.status] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([status, count]) => (
                  <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-6">
              {applications
                .sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0)) // Sort by AI score (highest first)
                .map((application: Application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                            <User className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.candidate?.first_name || 'Unknown'} {application.candidate?.last_name || 'Candidate'}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-1" />
                              Applied {formatDate(application.created_at)}
                            </div>
                            {application.candidate?.bio && (
                              <p className="text-sm text-gray-600 mt-1 max-w-md">
                                {application.candidate.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                      </div>

                      {/* Candidate Skills */}
                      {application.candidate?.skills && application.candidate.skills.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2 text-sm">Skills:</h5>
                          <div className="flex flex-wrap gap-2">
                            {application.candidate.skills.map((skill, index) => (
                              <span key={index} className="badge badge-secondary text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Score Section */}
                      {application.ai_score && (
                        <div className={`p-4 rounded-lg border mb-4 ${getScoreColor(application.ai_score)}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold flex items-center">
                              <Star className="w-5 h-5 mr-2" />
                              AI Compatibility Score
                            </h4>
                            <div className="text-2xl font-bold">
                              {application.ai_score}/100
                            </div>
                          </div>
                          
                          {application.ai_analysis && (
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium mb-2">✓ Strengths:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {application.ai_analysis.strengths?.map((strength, index) => (
                                    <li key={index}>{strength}</li>
                                  )) || <li>No specific strengths listed</li>}
                                </ul>
                              </div>
                              
                              {application.ai_analysis.concerns && application.ai_analysis.concerns.length > 0 && (
                                <div>
                                  <h5 className="font-medium mb-2">⚠ Considerations:</h5>
                                  <ul className="list-disc list-inside space-y-1 text-sm">
                                    {application.ai_analysis.concerns.map((concern, index) => (
                                      <li key={index}>{concern}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {application.ai_analysis.explanation && (
                                <div>
                                  <h5 className="font-medium mb-2">📝 Analysis:</h5>
                                  <p className="text-sm">{application.ai_analysis.explanation}</p>
                                </div>
                              )}

                              {application.ai_analysis.recommendation && (
                                <div>
                                  <h5 className="font-medium mb-2">💡 Recommendation:</h5>
                                  <p className="text-sm font-medium">{application.ai_analysis.recommendation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resume Preview */}
                      <div className="mb-4">
                        <button
                          onClick={() => setExpandedApplication(
                            expandedApplication === application.id ? null : application.id
                          )}
                          className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {expandedApplication === application.id ? 'Hide' : 'View'} Resume & Cover Letter
                        </button>
                        
                        {expandedApplication === application.id && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Resume:</h5>
                              <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap">
                                {application.resume}
                              </div>
                            </div>
                            
                            {application.cover_letter && (
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Cover Letter:</h5>
                                <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap">
                                  {application.cover_letter}
                                </div>
                              </div>
                            )}

                            {/* Candidate Experience & Education */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {application.candidate?.experience && (
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Experience:</h5>
                                  <div className="bg-gray-50 p-4 rounded-md text-sm">
                                    {application.candidate.experience}
                                  </div>
                                </div>
                              )}
                              
                              {application.candidate?.education && (
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Education:</h5>
                                  <div className="bg-gray-50 p-4 rounded-md text-sm">
                                    {application.candidate.education}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-6 lg:min-w-[200px]">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'accepted')}
                            icon={<CheckCircle className="w-4 h-4" />}
                            className="flex-1 lg:w-full"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'reviewed')}
                            className="flex-1 lg:w-full"
                          >
                            Mark Reviewed
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            icon={<X className="w-4 h-4" />}
                            className="flex-1 lg:w-full"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {application.status !== 'pending' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, 'pending')}
                          className="flex-1 lg:w-full"
                        >
                          Mark as Pending
                        </Button>
                      )}

                      {/* Contact candidate (placeholder) */}
                      {application.status === 'accepted' && application.candidate?.email && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => window.open(`mailto:${application.candidate?.email}`, '_blank')}
                          className="flex-1 lg:w-full"
                        >
                          Contact Candidate
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;