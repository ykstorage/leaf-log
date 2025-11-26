export interface User {
  id: string
  email: string
  nickname: string
  profileImageUrl?: string
  bio?: string
}

export interface Post {
  id: string
  userId: string
  title: string
  content: string
  imageUrls: string[]
  createdAt: string
  updatedAt: string
  user: {
    id: string
    nickname: string
    profileImageUrl?: string
  }
  _count?: {
    likes: number
  }
  isLiked?: boolean
}

export interface PostsResponse {
  posts: Post[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterDto {
  email: string
  password: string
  nickname: string
  profileImageUrl?: string
  bio?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface CreatePostDto {
  title: string
  content: string
  imageUrls?: string[]
}

export interface UpdatePostDto {
  title?: string
  content?: string
  imageUrls?: string[]
}

export interface Plant {
  id: string
  userId: string
  name: string
  species?: string
  nickname?: string
  imageUrl?: string
  location?: string
  wateringInterval?: number
  lastWateredAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
  careRecords?: CareRecord[]
}

export interface CareRecord {
  id: string
  plantId: string
  type: string
  date: string
  notes?: string
  createdAt: string
}

export interface CreatePlantDto {
  name: string
  species?: string
  nickname?: string
  imageUrl?: string
  location?: string
  wateringInterval?: number
  notes?: string
}

export interface UpdatePlantDto {
  name?: string
  species?: string
  nickname?: string
  imageUrl?: string
  location?: string
  wateringInterval?: number
  notes?: string
}

export interface CreateCareRecordDto {
  plantId: string
  type: string
  date: string
  notes?: string
}
