// src/components/applications/ApplicationModal.tsx - Application Form Modal
import { useState } from 'react';
import { X, Send, FileText, MessageSquare } from 'lucide-react';
import { Job, User } from '../../types';
import Button from '../common/Button';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { resume: string; cover_letter?: string }) => void;
  job: Job;
  user: User;
  loading?: boolean;
}

const ApplicationModal = ({ isOpen, onClose, onSubmit, job, user, loading }: ApplicationModalProps) => {
  const [formData, setFormData] = useState({
    resume: user.experience || user.bio || '',
    cover_letter: `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at your company. Based on the job description, I believe my skills and experience make me a strong candidate for this role.

${user.experience ? `I have experience in ${user.experience}.` : ''}
${user.skills && user.skills.length > 0 ? `My technical skills include: ${user.skills.join(', ')}.` : ''}

I am excited about the opportunity to contribute to your team and would love to discuss how my background aligns with your needs.

Thank you for your consideration.

Best regards,
${user.first_name} ${user.last_name}`
  });
  const [errors, setErrors] = useState<{ resume?: string; cover_letter?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { resume?: string; cover_letter?: string } = {};
    
    if (!formData.resume.trim()) {
      newErrors.resume = 'Resume/experience is required';
    } else if (formData.resume.trim().length < 50) {
      newErrors.resume = 'Please provide more details about your experience (minimum 50 characters)';
    }
    
    if (formData.cover_letter && formData.cover_letter.trim().length < 20) {
      newErrors.cover_letter = 'Cover letter must be at least 20 characters if provided';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        resume: formData.resume.trim(),
        cover_letter: formData.cover_letter?.trim() || undefined
      });
    }
  };

  const handleInputChange = (field: 'resume' | 'cover_letter', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Apply for {job.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {job.employer?.first_name && job.employer?.last_name 
                  ? `${job.employer.first_name} ${job.employer.last_name}` 
                  : 'Unknown Employer'} • {job.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Resume/Experience Section */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Resume / Experience *
                </label>
                <textarea
                  value={formData.resume}
                  onChange={(e) => handleInputChange('resume', e.target.value)}
                  rows={12}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.resume ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your experience, skills, education, and why you're a good fit for this role...

Example:
• 5 years of experience in software development
• Proficient in React, Node.js, and TypeScript
• Bachelor's degree in Computer Science
• Led a team of 3 developers on multiple projects
• Experience with agile development and CI/CD"
                  disabled={loading}
                />
                {errors.resume && (
                  <p className="text-red-600 text-sm mt-1">{errors.resume}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  {formData.resume.length}/2000 characters • Minimum 50 characters required
                </p>
              </div>

              {/* Cover Letter Section */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={formData.cover_letter}
                  onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                  rows={8}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.cover_letter ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Write a personalized message explaining why you're interested in this position..."
                  disabled={loading}
                />
                {errors.cover_letter && (
                  <p className="text-red-600 text-sm mt-1">{errors.cover_letter}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  {formData.cover_letter?.length || 0}/1000 characters
                </p>
              </div>

              {/* Job Requirements Preview */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Job Requirements:</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {job.requirements.split(',').slice(0, 5).map((req, index) => (
                    <li key={index}>{req.trim()}</li>
                  ))}
                  {job.requirements.split(',').length > 5 && (
                    <li className="text-gray-500">+{job.requirements.split(',').length - 5} more requirements</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <p>Your application will be sent to the employer for review.</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    icon={<Send className="w-4 h-4" />}
                    disabled={!formData.resume.trim() || formData.resume.trim().length < 50}
                  >
                    Submit Application
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;