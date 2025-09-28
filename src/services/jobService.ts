import { apiService } from './api'
import { Job, CreateJobData } from '../types'

class JobService {
  async getAllJobs(filters?: { location?: string }): Promise<Job[]> {
    return apiService.get<Job[]>('/jobs', filters)
  }

  async getJobById(id: number): Promise<Job> {
    return apiService.get<Job>(`/jobs/${id}`)
  }

  async getMyJobs(): Promise<Job[]> {
    return apiService.get<Job[]>('/jobs/my-jobs')
  }

  async createJob(jobData: CreateJobData): Promise<Job> {
    return apiService.post<Job>('/jobs', jobData)
  }

  async updateJob(id: number, jobData: Partial<CreateJobData>): Promise<Job> {
    return apiService.put<Job>(`/jobs/${id}`, jobData)
  }

  async deleteJob(id: number): Promise<void> {
    return apiService.delete<void>(`/jobs/${id}`)
  }
}

export const jobService = new JobService()