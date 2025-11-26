import apiClient from './config'
import type { Post, PostsResponse, CreatePostDto, UpdatePostDto } from '../types'

export const postsApi = {
  async getAll(page = 1, limit = 20, search?: string): Promise<PostsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (search) {
      params.append('search', search)
    }
    const response = await apiClient.get<PostsResponse>(`/posts?${params}`)
    return response.data
  },

  async getOne(id: string): Promise<Post> {
    const response = await apiClient.get<Post>(`/posts/${id}`)
    return response.data
  },

  async create(data: CreatePostDto): Promise<Post> {
    const response = await apiClient.post<Post>('/posts', data)
    return response.data
  },

  async update(id: string, data: UpdatePostDto): Promise<Post> {
    const response = await apiClient.put<Post>(`/posts/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`)
  },

  async toggleLike(postId: string): Promise<{ liked: boolean; message: string }> {
    const response = await apiClient.post<{ liked: boolean; message: string }>(
      `/posts/${postId}/like`
    )
    return response.data
  },
}
