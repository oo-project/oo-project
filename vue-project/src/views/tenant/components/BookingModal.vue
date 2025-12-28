<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card booking-card">
      <button class="close-modal" @click="$emit('close')">✕</button>
      
      <h3 class="modal-title">📅 預約看房</h3>
      <p class="modal-subtitle">請填寫您方便的時間，房東會再與您確認。</p>

      <div class="form-group">
        <label>日期</label>
        <input type="date" v-model="bookingForm.date" :min="minDate" class="form-input" />
      </div>

      <div class="form-group">
        <label>時段/時間</label>
        <input type="time" v-model="bookingForm.time" class="form-input" />
      </div>

      <div class="form-group">
        <label>給房東的話</label>
        <textarea 
          v-model="bookingForm.message" 
          placeholder="你好，我是大三學生，想預約看這間房..." 
          class="form-input textarea"
        ></textarea>
      </div>

      <button 
        class="submit-btn" 
        @click="submitBooking"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? '傳送中...' : '確認送出' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/utils/api'
// 接收父元件傳來的資料
const props = defineProps({
  rental: Object, // 房源資訊 (包含 id, title, landlordId)
  user: Object    // 目前登入的房客資訊
})

// 定義可以發送給父元件的事件
const emit = defineEmits(['close'])

const isSubmitting = ref(false)
const bookingForm = ref({ date: '', time: '', message: '' })
const minDate = new Date().toISOString().split('T')[0]


const submitBooking = async () => {
  if (!bookingForm.value.date || !bookingForm.value.time) {
    alert('請填寫日期與時間！')
    return
  }

  try {
    isSubmitting.value = true
    
    // 呼叫後端 API
    const response = await api.post('/api/appointments/create', {
    rentalId: props.rental.id,
    rentalTitle: props.rental.title,
    landlordId: props.rental.landlordId,
    tenantId: props.user.id,
    tenantName: props.user.name || props.user.email,
    ...bookingForm.value // 把表單資料展開放進去
  })

    const json = await response.data

    if (json.success) {
      alert('✅ 預約請求已發送！請等待房東確認。')
      emit('close') // 成功後通知父元件關閉視窗
    } else {
      alert('❌ 發送失敗：' + json.message)
    }
  } catch (error) {
    console.error(error)
    alert('伺服器連線錯誤')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* 把跟表單有關的樣式都搬來這裡 */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 200;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); padding: 20px;
}
.modal-card {
  background: white; width: 100%; border-radius: 20px; padding: 24px; position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.booking-card { max-width: 400px; }
.close-modal { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 20px; cursor: pointer; color: #ccc; }
.modal-title { font-size: 20px; font-weight: 700; color: #2e2622; margin: 0 0 6px; text-align: center; }
.modal-subtitle { font-size: 13px; color: #666; text-align: center; margin-bottom: 24px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #4a2c21; margin-bottom: 6px; }
.form-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.form-input:focus { border-color: #a18c7b; }
.textarea { height: 80px; resize: none; }
.submit-btn { width: 100%; background: #a18c7b; color: white; border: none; padding: 12px; border-radius: 12px; font-size: 16px; font-weight: 600; margin-top: 10px; cursor: pointer; }
.submit-btn:disabled { background: #ccc; }
</style>