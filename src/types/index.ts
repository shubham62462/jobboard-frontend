// src/types/index.ts - UPDATED types to match backend
export interface User {
  id: string;
  email: string;
  role: 'employer' | 'candidate';
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  resume_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Remove Profile interface - no longer needed
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary?: string;
  employer_id: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
  employer?: User;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  resume: string;
  cover_letter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  ai_score?: number;
  ai_analysis?: {
    score: number;
    strengths: string[];
    concerns: string[];
    explanation: string;
    match_percentage: number;
    recommendation: string;
  };
  created_at: string;
  updated_at: string;
  job?: Job;
  candidate?: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface SignUpData {
  first_name: string;
  last_name: string;
  role: 'employer' | 'candidate';
}