<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const nickname = ref('')
const bio = ref('')
const passwordMismatch = ref(false)

async function handleRegister() {
  if (password.value !== passwordConfirm.value) {
    passwordMismatch.value = true
    return
  }

  passwordMismatch.value = false

  const success = await authStore.register({
    email: email.value,
    password: password.value,
    nickname: nickname.value,
    bio: bio.value || undefined,
  })

  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>회원가입</h1>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">이메일 *</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div class="form-group">
          <label for="nickname">닉네임 *</label>
          <input
            id="nickname"
            v-model="nickname"
            type="text"
            required
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호 *</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="비밀번호 (최소 6자)"
          />
        </div>

        <div class="form-group">
          <label for="passwordConfirm">비밀번호 확인 *</label>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
            type="password"
            required
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>

        <div class="form-group">
          <label for="bio">자기소개</label>
          <textarea
            id="bio"
            v-model="bio"
            rows="3"
            placeholder="자기소개를 입력하세요 (선택사항)"
          ></textarea>
        </div>

        <div v-if="passwordMismatch" class="error-message">
          비밀번호가 일치하지 않습니다
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="authStore.loading">
          {{ authStore.loading ? '가입 중...' : '회원가입' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>이미 계정이 있으신가요? <router-link to="/login">로그인</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  margin: 0 0 30px 0;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
  font-family: inherit;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.auth-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
