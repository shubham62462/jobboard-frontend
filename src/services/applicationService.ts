import { apiService } from './api'
import { Application, CreateApplicationData } from '../types'

class ApplicationService {
  async createApplication(applicationData: CreateApplicationData): Promise<Application> {
    return apiService.post<Application>('/applications', applicationData)
  }

  async getMyApplications(): Promise<Application[]> {
    return apiService.get<Application[]>('/applications/my-applications')
  }

  async getJobApplications(jobId: number): Promise<Application[]> {
    return apiService.get<Application[]>(`/applications/job/${jobId}`)
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    return apiService.put<Application>(`/applications/${id}/status`, { status })
  }
}

export const applicationService = new ApplicationService()