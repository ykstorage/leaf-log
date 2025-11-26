<template>
  <div class="plant-container">
    <h1>내 식물들 🌱</h1>

    <div v-if="loading" class="loading">로딩중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="plant-grid">
      <div v-for="plant in plants" :key="plant.id" class="plant-card">
        <div v-if="plant.imageUrl" class="plant-image-wrapper">
          <img
            :src="plant.imageUrl"
            :alt="plant.name"
            @error="handleImageError"
          />
        </div>
        <div v-else class="plant-image-placeholder">🌱</div>
        <h3>{{ plant.name }}</h3>
        <p class="species">{{ plant.species || '미지정' }}</p>
        <p class="location">📍 {{ plant.location || '미지정' }}</p>
        <p class="last-water">💧 마지막 물주기: {{ getLastWatering(plant) }}</p>

        <div class="actions">
          <button @click="addWatering(plant.id)" class="btn-water">💧 물주기</button>
          <button @click="showDetail(plant.id)" class="btn-detail">상세보기</button>
        </div>
      </div>
    </div>

    <button class="fab" @click="showAddPlantModal = true">+</button>

    <div v-if="showAddPlantModal" class="modal" @click.self="showAddPlantModal = false">
      <div class="modal-content">
        <h2>새 식물 등록</h2>
        <form @submit.prevent="handleAddPlant">
          <div class="form-group">
            <label>이름 *</label>
            <input v-model="newPlant.name" type="text" required />
          </div>
          <div class="form-group">
            <label>종류</label>
            <input v-model="newPlant.species" type="text" />
          </div>
          <div class="form-group">
            <label>위치</label>
            <input v-model="newPlant.location" type="text" />
          </div>
          <div class="form-group">
            <label>메모</label>
            <textarea v-model="newPlant.notes" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>이미지</label>
            <input type="file" accept="image/*" @change="handleImageSelect" />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" />
            </div>
            <div v-if="uploading" class="uploading">이미지 업로드 중...</div>
          </div>
          <div class="form-actions">
            <button type="button" @click="showAddPlantModal = false" class="btn-cancel">
              취소
            </button>
            <button type="submit" class="btn-submit">등록</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'
import { plantsApi } from '../api/plants'
import { careRecordsApi } from '../api/careRecords'
import { useImageUpload } from '../composables/useImageUpload'
import type { Plant, CreatePlantDto } from '../types'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const router = useRouter()
const plants = ref<Plant[]>([])
const loading = ref(true)
const error = ref('')
const showAddPlantModal = ref(false)
const newPlant = ref<CreatePlantDto>({
  name: '',
  species: '',
  location: '',
  notes: '',
})
const selectedImage = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const { uploading, uploadImage } = useImageUpload()

onMounted(async () => {
  await loadPlants()
})

const loadPlants = async () => {
  try {
    loading.value = true
    error.value = ''
    plants.value = await plantsApi.getAll()
  } catch (err: any) {
    error.value = err.response?.data?.message || '식물 목록을 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const getLastWatering = (plant: Plant) => {
  if (!plant.careRecords || plant.careRecords.length === 0) {
    return '기록 없음'
  }

  const lastWater = plant.careRecords
    .filter((r) => r.type === 'WATER')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  return lastWater ? dayjs(lastWater.date).fromNow() : '기록 없음'
}

const addWatering = async (plantId: string) => {
  try {
    await careRecordsApi.create({
      plantId,
      type: 'WATER',
      date: new Date().toISOString(),
    })

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('물주기 완료! 💧', {
        body: '물주기가 기록되었습니다.',
        icon: '/icon-192.png',
      })
    }

    await loadPlants()
  } catch (err: any) {
    alert('물주기 기록에 실패했습니다.')
  }
}

const showDetail = (plantId: string) => {
  router.push(`/plant/${plantId}`)
}

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    selectedImage.value = file

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleAddPlant = async () => {
  if (!newPlant.value.name.trim()) {
    alert('식물 이름을 입력해주세요.')
    return
  }

  try {
    // Upload image if selected
    if (selectedImage.value) {
      const imageUrl = await uploadImage(selectedImage.value)
      if (imageUrl) {
        newPlant.value.imageUrl = imageUrl
      }
    }

    await plantsApi.create(newPlant.value)
    showAddPlantModal.value = false
    newPlant.value = { name: '', species: '', location: '', notes: '' }
    selectedImage.value = null
    imagePreview.value = null
    await loadPlants()
  } catch (err: any) {
    alert('식물 등록에 실패했습니다.')
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

<style scoped>
.plant-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

h1 {
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #e74c3c;
}

.plant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.plant-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.plant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.plant-image-wrapper img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f0f0f0;
}

.plant-image-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 64px;
}

.plant-card h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 20px;
}

.species,
.location,
.last-water {
  margin: 4px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-water,
.btn-detail {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-water {
  background: #4dba87;
  color: white;
}

.btn-water:hover {
  opacity: 0.9;
}

.btn-detail {
  background: #f0f0f0;
  color: #333;
}

.btn-detail:hover {
  background: #e0e0e0;
}

.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4dba87;
  color: white;
  border: none;
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(77, 186, 135, 0.4);
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 10;
}

.fab:hover {
  transform: scale(1.1);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4dba87;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.btn-cancel {
  background: #e0e0e0;
  color: #333;
}

.btn-submit {
  background: #4dba87;
  color: white;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.btn-submit:hover {
  opacity: 0.9;
}

.image-preview {
  margin-top: 12px;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.uploading {
  margin-top: 8px;
  color: #4dba87;
  font-size: 14px;
  text-align: center;
}
</style>
