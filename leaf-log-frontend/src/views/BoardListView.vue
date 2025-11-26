<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postsApi } from '../api/posts'
import { useAuthStore } from '../stores/auth'
import type { Post } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const posts = ref<Post[]>([])
const loading = ref(false)
const search = ref('')
const currentPage = ref(1)
const totalPages = ref(1)

async function fetchPosts() {
  try {
    loading.value = true
    const response = await postsApi.getAll(currentPage.value, 20, search.value || undefined)
    posts.value = response.posts
    totalPages.value = response.meta.totalPages
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchPosts()
}

function goToPost(id: string) {
  router.push(`/board/${id}`)
}

function goToNewPost() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  router.push('/board/new')
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="board-container">
    <div class="board-header">
      <h1>커뮤니티 게시판</h1>
      <button class="btn-primary" @click="goToNewPost">
        글쓰기
      </button>
    </div>

    <div class="search-bar">
      <input
        v-model="search"
        type="text"
        placeholder="제목이나 내용으로 검색..."
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch">검색</button>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>

    <div v-else-if="posts.length === 0" class="empty-state">
      게시글이 없습니다
    </div>

    <div v-else class="posts-list">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
        @click="goToPost(post.id)"
      >
        <div class="post-header">
          <div class="post-author">
            <div v-if="post.user.profileImageUrl" class="author-avatar">
              <img :src="post.user.profileImageUrl" :alt="post.user.nickname" />
            </div>
            <div v-else class="author-avatar-placeholder">{{ post.user.nickname?.charAt(0) || '?' }}</div>
            <span>{{ post.user.nickname }}</span>
          </div>
          <div class="post-date">
            {{ new Date(post.createdAt).toLocaleDateString('ko-KR') }}
          </div>
        </div>

        <h2 class="post-title">{{ post.title }}</h2>
        <p class="post-preview">{{ post.content.substring(0, 100) }}...</p>

        <div class="post-footer">
          <div class="post-stats">
            <span>❤️ {{ post._count?.likes || 0 }}</span>
          </div>
          <div v-if="post.imageUrls.length > 0" class="post-images-count">
            📷 {{ post.imageUrls.length }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="currentPage--; fetchPosts()"
      >
        이전
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        @click="currentPage++; fetchPosts()"
      >
        다음
      </button>
    </div>
  </div>
</template>

<style scoped>
.board-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  margin: 0;
  color: #333;
}

.btn-primary {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #5568d3;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-bar button {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.post-date {
  color: #999;
  font-size: 14px;
}

.post-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.post-preview {
  color: #666;
  line-height: 1.5;
  margin: 0 0 15px 0;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-stats {
  color: #666;
  font-size: 14px;
}

.post-images-count {
  color: #999;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
