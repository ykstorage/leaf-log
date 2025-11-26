<template>
  <div class="plant-detail-container">
    <button @click="goBack" class="btn-back">← 뒤로</button>

    <div v-if="loading" class="loading">로딩중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="plant" class="plant-detail">
      <div class="plant-header">
        <div v-if="plant.imageUrl" class="plant-image-wrapper">
          <img :src="plant.imageUrl" :alt="plant.name" class="plant-image" />
        </div>
        <div v-else class="plant-image-placeholder">🌱</div>
        <div class="plant-info">
          <h1>{{ plant.name }}</h1>
          <p v-if="plant.species" class="species">🌿 {{ plant.species }}</p>
          <p v-if="plant.location" class="location">📍 {{ plant.location }}</p>
          <p v-if="plant.notes" class="notes">{{ plant.notes }}</p>
          <div class="button-group">
            <button @click="showEditModal = true" class="btn-edit">수정</button>
            <button @click="handleDelete" class="btn-delete">삭제</button>
          </div>
        </div>
      </div>

      <div class="care-section">
        <h2>관리 기록</h2>
        <div class="care-actions">
          <button @click="addCareRecord('WATER')" class="btn-care water">💧 물주기</button>
          <button @click="addCareRecord('FERTILIZER')" class="btn-care fertilizer">
            🌱 비료
          </button>
          <button @click="addCareRecord('REPOT')" class="btn-care repot">🪴 분갈이</button>
          <button @click="addCareRecord('PRUNE')" class="btn-care prune">✂️ 가지치기</button>
        </div>

        <div v-if="plant.careRecords && plant.careRecords.length > 0" class="care-records">
          <div v-for="(record, index) in plant.careRecords" :key="record.id" class="care-record">
            <div class="record-icon">{{ getCareIcon(record.type) }}</div>
            <div class="record-info">
              <div class="record-header">
                <div class="record-type">{{ getCareTypeName(record.type) }}</div>
                <div class="record-dday" :class="getDdayClass(record.date)">
                  {{ getDday(record.date) }}
                </div>
              </div>
              <div class="record-date">{{ formatDate(record.date) }}</div>
              <div v-if="record.notes" class="record-notes">{{ record.notes }}</div>
              <div v-if="getDaysSincePrevious(index, record.type)" class="record-interval">
                이전 {{ getCareTypeName(record.type) }}로부터 {{ getDaysSincePrevious(index, record.type) }}일 후
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-records">아직 관리 기록이 없습니다.</div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal" @click.self="showEditModal = false">
      <div class="modal-content">
        <h2>식물 정보 수정</h2>
        <form @submit.prevent="handleEdit">
          <div class="form-group">
            <label>이름 *</label>
            <input v-model="editForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>종류</label>
            <input v-model="editForm.species" type="text" />
          </div>
          <div class="form-group">
            <label>위치</label>
            <input v-model="editForm.location" type="text" />
          </div>
          <div class="form-group">
            <label>메모</label>
            <textarea v-model="editForm.notes" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="showEditModal = false" class="btn-cancel">
              취소
            </button>
            <button type="submit" class="btn-submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'
import { plantsApi } from '../api/plants'
import { careRecordsApi } from '../api/careRecords'
import type { Plant, UpdatePlantDto } from '../types'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const router = useRouter()
const route = useRoute()
const plant = ref<Plant | null>(null)
const loading = ref(true)
const error = ref('')
const showEditModal = ref(false)
const editForm = ref<UpdatePlantDto>({})

onMounted(async () => {
  await loadPlant()
})

const loadPlant = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await plantsApi.getOne(route.params.id as string)
    plant.value = data
    editForm.value = {
      name: data.name,
      species: data.species,
      location: data.location,
      notes: data.notes,
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '식물 정보를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/')
}

const handleEdit = async () => {
  if (!plant.value) return

  try {
    await plantsApi.update(plant.value.id, editForm.value)
    showEditModal.value = false
    await loadPlant()
  } catch (err: any) {
    alert('식물 정보 수정에 실패했습니다.')
  }
}

const handleDelete = async () => {
  if (!plant.value) return

  if (!confirm(`"${plant.value.name}"을(를) 정말 삭제하시겠습니까?`)) {
    return
  }

  try {
    await plantsApi.delete(plant.value.id)
    router.push('/')
  } catch (err: any) {
    alert('식물 삭제에 실패했습니다.')
  }
}

const addCareRecord = async (type: string) => {
  if (!plant.value) return

  try {
    await careRecordsApi.create({
      plantId: plant.value.id,
      type: type,
      date: new Date().toISOString(),
    })

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${getCareTypeName(type)} 완료!`, {
        body: '관리 기록이 저장되었습니다.',
        icon: '/icon-192.png',
      })
    }

    await loadPlant()
  } catch (err: any) {
    alert('관리 기록 추가에 실패했습니다.')
  }
}

const getCareIcon = (type: string) => {
  const icons: Record<string, string> = {
    WATER: '💧',
    FERTILIZER: '🌱',
    REPOT: '🪴',
    PRUNE: '✂️',
  }
  return icons[type] || '📝'
}

const getCareTypeName = (type: string) => {
  const names: Record<string, string> = {
    WATER: '물주기',
    FERTILIZER: '비료',
    REPOT: '분갈이',
    PRUNE: '가지치기',
  }
  return names[type] || type
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY년 MM월 DD일 HH:mm')
}

const getDday = (date: string) => {
  const today = dayjs().startOf('day')
  const recordDate = dayjs(date).startOf('day')
  const diff = today.diff(recordDate, 'day')

  if (diff === 0) return 'D-Day'
  if (diff > 0) return `D+${diff}`
  return `D${diff}`
}

const getDdayClass = (date: string) => {
  const today = dayjs().startOf('day')
  const recordDate = dayjs(date).startOf('day')
  const diff = today.diff(recordDate, 'day')

  if (diff === 0) return 'today'
  if (diff <= 3) return 'recent'
  if (diff <= 7) return 'week'
  return 'old'
}

const getDaysSincePrevious = (currentIndex: number, type: string) => {
  if (!plant.value?.careRecords) return null

  // 같은 타입의 이전 기록 찾기 (현재 인덱스보다 뒤에 있는 것 = 더 오래된 기록)
  const records = plant.value.careRecords
  for (let i = currentIndex + 1; i < records.length; i++) {
    if (records[i].type === type) {
      const currentDate = dayjs(records[currentIndex].date)
      const previousDate = dayjs(records[i].date)
      const diff = currentDate.diff(previousDate, 'day')
      return diff > 0 ? diff : null
    }
  }
  return null
}
</script>

<style scoped>
.plant-detail-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.btn-back {
  padding: 10px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

.btn-back:hover {
  background: #e0e0e0;
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

.plant-detail {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.plant-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .plant-header {
    grid-template-columns: 1fr;
  }
}

.plant-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.plant-image-placeholder {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 8px;
  font-size: 80px;
}

.plant-info h1 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.species,
.location,
.notes {
  margin: 8px 0;
  color: #7f8c8d;
  line-height: 1.6;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-edit,
.btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-edit {
  background: #4dba87;
  color: white;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  opacity: 0.9;
}

.care-section {
  margin-top: 32px;
}

.care-section h2 {
  margin-bottom: 16px;
  color: #2c3e50;
}

.care-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.btn-care {
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.btn-care.water {
  background: #3498db;
}
.btn-care.fertilizer {
  background: #27ae60;
}
.btn-care.repot {
  background: #e67e22;
}
.btn-care.prune {
  background: #9b59b6;
}

.btn-care:hover {
  opacity: 0.9;
}

.care-records {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.care-record {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.record-icon {
  font-size: 32px;
}

.record-info {
  flex: 1;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.record-type {
  font-weight: 600;
  color: #2c3e50;
}

.record-dday {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.record-dday.today {
  background: #e8f5e9;
  color: #2e7d32;
}

.record-dday.recent {
  background: #e3f2fd;
  color: #1565c0;
}

.record-dday.week {
  background: #fff3e0;
  color: #ef6c00;
}

.record-dday.old {
  background: #f5f5f5;
  color: #757575;
}

.record-date {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.record-notes {
  font-size: 14px;
  color: #555;
  margin-top: 8px;
}

.record-interval {
  font-size: 12px;
  color: #9b59b6;
  margin-top: 6px;
  padding: 4px 8px;
  background: #f5f0ff;
  border-radius: 4px;
  display: inline-block;
}

.no-records {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
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
</style>
