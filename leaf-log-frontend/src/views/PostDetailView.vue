<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi } from '../api/posts'
import { useAuthStore } from '../stores/auth'
import type { Post } from '../types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const post = ref<Post | null>(null)
const loading = ref(false)

async function fetchPost() {
  try {
    loading.value = true
    const postId = route.params.id as string
    post.value = await postsApi.getOne(postId)
  } catch (error) {
    console.error('Failed to fetch post:', error)
    router.push('/board')
  } finally {
    loading.value = false
  }
}

async function toggleLike() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (!post.value) return

  try {
    await postsApi.toggleLike(post.value.id)
    await fetchPost()
  } catch (error) {
    console.error('Failed to toggle like:', error)
  }
}

function goBack() {
  router.push('/board')
}

onMounted(() => {
  fetchPost()
})
</script>

<template>
  <div class="post-detail-container">
    <div v-if="loading" class="loading">로딩 중...</div>

    <div v-else-if="post" class="post-detail">
      <button class="btn-back" @click="goBack">← 목록으로</button>

      <div class="post-header">
        <h1>{{ post.title }}</h1>
        <div class="post-meta">
          <div class="author-info">
            <div v-if="post.user.profileImageUrl" class="author-avatar">
              <img :src="post.user.profileImageUrl" :alt="post.user.nickname" />
            </div>
            <div v-else class="author-avatar-placeholder">{{ post.user.nickname?.charAt(0) || '?' }}</div>
            <div>
              <div class="author-name">{{ post.user.nickname }}</div>
              <div class="post-date">
                {{ new Date(post.createdAt).toLocaleString('ko-KR') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="post-content">
        {{ post.content }}
      </div>

      <div v-if="post.imageUrls.length > 0" class="post-images">
        <img
          v-for="(url, index) in post.imageUrls"
          :key="index"
          :src="url"
          :alt="`Image ${index + 1}`"
        />
      </div>

      <div class="post-actions">
        <button
          class="btn-like"
          :class="{ liked: post.isLiked }"
          @click="toggleLike"
        >
          {{ post.isLiked ? '❤️' : '🤍' }} {{ post._count?.likes || 0 }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.btn-back {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 20px;
}

.post-detail {
  background: white;
  border-radius: 8px;
  padding: 30px;
}

.post-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

h1 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 28px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.author-name {
  font-weight: 600;
  color: #333;
}

.post-date {
  color: #999;
  font-size: 14px;
}

.post-content {
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 30px;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 30px;
}

.post-images img {
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.post-actions {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-like {
  padding: 10px 20px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-like.liked {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.btn-like:hover {
  transform: scale(1.05);
}
</style>
