import apiClient from './config'
import type { Plant, CreatePlantDto, UpdatePlantDto } from '../types'

export const plantsApi = {
  getAll: async () => {
    const response = await apiClient.get<Plant[]>('/plants')
    return response.data
  },
  getOne: async (id: string) => {
    const response = await apiClient.get<Plant>(`/plants/${id}`)
    return response.data
  },
  create: async (data: CreatePlantDto) => {
    const response = await apiClient.post<Plant>('/plants', data)
    return response.data
  },
  update: async (id: string, data: UpdatePlantDto) => {
    const response = await apiClient.put<Plant>(`/plants/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/plants/${id}`)
    return response.data
  },
}
