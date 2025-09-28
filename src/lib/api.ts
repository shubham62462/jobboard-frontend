const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth header if token exists
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${options.method || 'GET'} ${url}`, data);
      
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${options.method || 'GET'} ${url}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'employer' | 'candidate';
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe(): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/me');
  }

  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    experience?: string;
    education?: string;
  }): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Jobs endpoints
  async getJobs(params: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    const url = `/jobs${queryString ? `?${queryString}` : ''}`;
    
    return this.request(url);
  }

  async getJob(id: string): Promise<ApiResponse<any>> {
    return this.request(`/jobs/${id}`);
  }

  async createJob(jobData: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, jobData: {
    title?: string;
    description?: string;
    requirements?: string;
    location?: string;
    salary?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string): Promise<ApiResponse> {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyJobs(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    const url = `/jobs/employer/my-jobs${queryString ? `?${queryString}` : ''}`;
    
    return this.request(url);
  }

  // Applications endpoints
  async createApplication(applicationData: {
    job_id: string;
    resume: string;
    cover_letter?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getMyApplications(): Promise<ApiResponse<any[]>> {
    return this.request('/applications/my-applications');
  }

  async getJobApplications(jobId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/applications/job/${jobId}`);
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getApplication(id: string): Promise<ApiResponse<any>> {
    return this.request(`/applications/${id}`);
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { ApiResponse, PaginatedResponse };