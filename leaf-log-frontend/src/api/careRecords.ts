import apiClient from './config'
import type { CareRecord, CreateCareRecordDto } from '../types'

export const careRecordsApi = {
  create: async (data: CreateCareRecordDto) => {
    const response = await apiClient.post<CareRecord>('/care-records', data)
    return response.data
  },
  getByPlant: async (plantId: string) => {
    const response = await apiClient.get<CareRecord[]>(`/care-records/plant/${plantId}`)
    return response.data
  },
  getOne: async (id: string) => {
    const response = await apiClient.get<CareRecord>(`/care-records/${id}`)
    return response.data
  },
}
