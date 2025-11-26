<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
  authStore.initializeAuth()
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div id="app">
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-left">
          <router-link to="/" class="logo">
            🌿 Leaf Log
          </router-link>
          <div class="nav-links">
            <router-link to="/board">게시판</router-link>
            <router-link to="/plants">내 식물</router-link>
          </div>
        </div>

        <div class="nav-right">
          <template v-if="authStore.isAuthenticated">
            <div class="user-info">
              <div v-if="authStore.user?.profileImageUrl" class="user-avatar">
                <img :src="authStore.user.profileImageUrl" :alt="authStore.user?.nickname" />
              </div>
              <div v-else class="user-avatar-placeholder">{{ authStore.user?.nickname?.charAt(0) || '?' }}</div>
              <span class="user-nickname">{{ authStore.user?.nickname }}</span>
            </div>
            <button @click="handleLogout" class="btn-logout">
              로그아웃
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-nav">로그인</router-link>
            <router-link to="/register" class="btn-nav btn-primary">회원가입</router-link>
          </template>
        </div>
      </div>
    </nav>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  background: #f5f7fa;
  color: #2c3e50;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #667eea;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-placeholder {
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

.user-nickname {
  font-weight: 500;
  color: #333;
}

.btn-nav {
  padding: 8px 16px;
  color: #555;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-nav:hover {
  background: #f5f5f5;
}

.btn-nav.btn-primary {
  background: #667eea;
  color: white;
}

.btn-nav.btn-primary:hover {
  background: #5568d3;
}

.btn-logout {
  padding: 8px 16px;
  background: #f5f5f5;
  color: #555;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: #e0e0e0;
}

.app-main {
  flex: 1;
}
</style>
