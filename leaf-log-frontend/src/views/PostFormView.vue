<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { postsApi } from '../api/posts'

const router = useRouter()

const title = ref('')
const content = ref('')
const submitting = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!title.value || !content.value) {
    error.value = '제목과 내용을 모두 입력해주세요'
    return
  }

  try {
    submitting.value = true
    error.value = ''

    await postsApi.create({
      title: title.value,
      content: content.value,
    })

    router.push('/board')
  } catch (err: any) {
    error.value = err.response?.data?.message || '게시글 작성에 실패했습니다'
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  router.push('/board')
}
</script>

<template>
  <div class="post-form-container">
    <div class="post-form">
      <h1>새 게시글 작성</h1>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">제목</label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            placeholder="제목을 입력하세요"
          />
        </div>

        <div class="form-group">
          <label for="content">내용</label>
          <textarea
            id="content"
            v-model="content"
            required
            rows="15"
            placeholder="내용을 입력하세요"
          ></textarea>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn-cancel"
            @click="handleCancel"
          >
            취소
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="submitting"
          >
            {{ submitting ? '작성 중...' : '작성 완료' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.post-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
}

h1 {
  margin: 0 0 30px 0;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
  line-height: 1.6;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-cancel:hover {
  background: #e0e0e0;
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

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
