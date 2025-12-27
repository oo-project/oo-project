<template>
  <div class="page-container">
    <h2 class="page-title">預約管理中心</h2>
    
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-btn"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>載入預約資料中...</p>
    </div>

    <div v-else class="appointment-list">
      <div v-if="filteredList.length === 0" class="empty-state">
        目前沒有{{ currentTab === 'all' ? '' : '此分類的' }}預約紀錄
      </div>

      <div 
        v-for="item in filteredList" 
        :key="item.id" 
        class="apt-card"
        :class="item.status"
      >
        <div class="card-header">
          <span class="status-badge" :class="item.status">
            {{ getStatusText(item.status) }}
          </span>
          <span class="time-ago">申請於：{{ formatDate(item.createdAt) }}</span>
        </div>

        <div class="card-body">
          <h3 class="rental-title">{{ item.rentalTitle }}</h3>
          
          <div class="info-grid">
            <div class="info-row">
              <span class="icon">👤</span> 
              <span class="label">房客：</span>
              <span class="value">{{ item.tenantName }}</span>
            </div>
            
            <div class="info-row highlight">
              <span class="icon">📅</span> 
              <span class="label">目前預約：</span>
              <span class="value">{{ item.date }} {{ item.time }}</span>
            </div>

            <div class="info-row" v-if="item.message && (!item.history || item.history.length === 0)">
              <span class="icon">📝</span>
              <span class="label">初始留言：</span>
              <span class="value">{{ item.message }}</span>
            </div>
          </div>
        </div>

        <div class="chat-section" v-if="(item.history && item.history.length > 0) || ['pending', 'negotiating'].includes(item.status)">
          
          <div class="chat-box" v-if="item.history && item.history.length > 0">
            <div 
              v-for="(msg, idx) in item.history" 
              :key="idx" 
              class="chat-bubble"
              :class="msg.role === 'landlord' ? 'me' : 'other'"
            >
              <div class="bubble-content">
                <strong>{{ msg.role === 'landlord' ? '我' : '房客' }}</strong>
                <p>{{ msg.content }}</p>
                <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="input-area" v-if="['pending', 'negotiating'].includes(item.status)">
            <input 
              v-model="inputMap[item.id]" 
              placeholder="輸入訊息跟房客協調..." 
              @keyup.enter="sendMessage(item.id)"
            />
            <button class="send-btn" @click="sendMessage(item.id)">傳送</button>
          </div>
        </div>

        <div class="confirm-section" v-if="['pending', 'negotiating'].includes(item.status)">
          <div class="divider-text">▼ 設定最終成交時間 ▼</div>
          
          <div class="date-time-picker">
            <div class="field">
              <label>日期</label>
              <input type="date" v-model="confirmDataMap[item.id].date">
            </div>
            <div class="field">
              <label>時間</label>
              <input type="time" v-model="confirmDataMap[item.id].time">
            </div>
          </div>
        </div>

        <div class="card-actions" v-if="['pending', 'negotiating'].includes(item.status)">
          <button class="btn reject" @click="updateStatus(item.id, 'rejected')">婉拒預約</button>
          
          <button class="btn accept" @click="updateStatus(item.id, 'confirmed')">
            確認並接受
          </button>
        </div>
        
        <div class="card-footer" v-else>
           <p v-if="item.status === 'confirmed'" class="hint success">
             ✅ 已接受預約 ({{ item.date }} {{ item.time }})
           </p>
           <p v-else-if="item.status === 'rejected'" class="hint error">❌ 已婉拒此預約</p>
           <p v-else-if="item.status === 'cancelled'" class="hint gray">🚫 房客已取消</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

const appointments = ref([])
const isLoading = ref(true)
const currentTab = ref('pending') // 預設顯示待處理
const inputMap = ref({})       // 暫存聊天輸入框的內容
const confirmDataMap = ref({}) // 暫存每張卡片的「最終設定時間」

const tabs = [
  { label: '待處理', value: 'pending' }, // 包含 pending 和 negotiating
  { label: '已安排', value: 'confirmed' },
  { label: '全部', value: 'all' }
]

// --- 1. 抓取資料 ---
const fetchAppointments = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) return

    const response = await api.get(`/api/appointments/landlord/${user.id}`)
    const json = response.data

    if (json.success) {
      appointments.value = json.data
      
      json.data.forEach(item => {
        confirmDataMap.value[item.id] = {
          date: item.date || '',
          time: item.time || ''
        }
      })
    }
  } catch (error) {
    console.error('載入失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// --- 2. 發送對話訊息 ---
const sendMessage = async (id) => {
  const msg = inputMap.value[id]
  if (!msg) return alert('請輸入內容')

  try {
    // 呼叫 addMessage API
    const response = await api.post(`/api/appointments/${id}/message`, {
      role: 'landlord',
      message: msg
    })

    if (response.data.success) {
      // 成功後直接更新前端畫面，體驗比較順暢
      const target = appointments.value.find(i => i.id === id)
      if (target) {
        if (!target.history) target.history = []
        target.history.push({ 
          role: 'landlord', 
          content: msg, 
          createdAt: new Date().toISOString() 
        })
        target.status = 'negotiating' // 只要說話了狀態就變協調中
      }
      inputMap.value[id] = '' // 清空輸入框
    }
  } catch (e) {
    alert('訊息發送失敗')
  }
}

// --- 3. 更新狀態 (接受/拒絕) ---
const updateStatus = async (id, status) => {
  let payload = { status }

  if (status === 'confirmed') {
    const finalData = confirmDataMap.value[id]
    
    if (!finalData || !finalData.date || !finalData.time) {
      return alert('請在上方設定「最終成交時間」才能接受預約！')
    }
    
    payload.finalDate = finalData.date
    payload.finalTime = finalData.time

    if (!confirm(`確定要將時間定在 ${finalData.date} ${finalData.time} 並接受預約嗎？`)) return
  } else {
    // 如果是婉拒
    if (!confirm('確定要婉拒嗎？')) return
  }

  try {
    const response = await api.post(`/api/appointments/${id}/status`, payload)

    if (response.data.success) {
      const target = appointments.value.find(i => i.id === id)
      if (target) {
        target.status = status
        if (status === 'confirmed') {
          target.date = payload.finalDate
          target.time = payload.finalTime
        }
      }
      alert(status === 'confirmed' ? '已接受並更新預約時間！' : '已婉拒預約')
    }
  } catch (e) { 
    console.error(e)
    alert('操作失敗') 
  }
}

// --- 4. 輔助函式 ---
const filteredList = computed(() => {
  if (currentTab.value === 'all') return appointments.value
  if (currentTab.value === 'pending') {
    return appointments.value.filter(i => ['pending', 'negotiating'].includes(i.status))
  }
  return appointments.value.filter(i => i.status === currentTab.value)
})

const getStatusText = (s) => {
  const map = { pending: '待確認', confirmed: '已安排', rejected: '已婉拒', negotiating: '協調中', cancelled: '已取消' }
  return map[s] || s
}
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString() : ''
const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''

onMounted(() => fetchAppointments())
</script>

<style scoped>
.page-container { padding: 20px; max-width: 800px; margin: 0 auto; padding-bottom: 60px; }
.page-title { font-size: 24px; color: #4a2c21; margin-bottom: 20px; font-weight: 700; }

/* Tabs */
.tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
.tab-btn { background: none; border: none; padding: 8px 16px; font-size: 15px; color: #666; cursor: pointer; border-radius: 20px; transition: 0.2s; }
.tab-btn.active { background: #4a2c21; color: white; font-weight: 600; }

/* 卡片樣式 */
.appointment-list { display: flex; flex-direction: column; gap: 16px; }
.apt-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

.card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.status-badge { font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: 600; background: #eee; }
.status-badge.pending { background: #fff7ed; color: #c2410c; }
.status-badge.negotiating { background: #fefce8; color: #b45309; border: 1px solid #fde047; }
.status-badge.confirmed { background: #ecfdf5; color: #047857; }
.status-badge.cancelled { background: #f3f4f6; color: #9ca3af; }
.time-ago { font-size: 12px; color: #999; }

.rental-title { font-size: 18px; color: #2e2622; margin: 0 0 10px 0; font-weight: 700; }
.info-grid { display: grid; gap: 6px; }
.info-row { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #4b5563; }
.info-row.highlight { color: #a18c7b; font-weight: 600; }
.icon { width: 20px; text-align: center; }

/* 對話區 */
.chat-section { margin-top: 16px; background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #f0f0f0; }
.chat-box { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; padding-right: 4px; }
.chat-bubble { max-width: 80%; padding: 8px 12px; border-radius: 12px; font-size: 13px; line-height: 1.4; position: relative; }
.chat-bubble strong { display: block; font-size: 11px; margin-bottom: 2px; opacity: 0.8; }
.chat-bubble p { margin: 0; word-break: break-all; }
.msg-time { font-size: 10px; opacity: 0.6; display: block; text-align: right; margin-top: 4px; }

/* 我 (房東) 靠右 */
.chat-bubble.me { align-self: flex-end; background: #4a2c21; color: white; border-bottom-right-radius: 2px; }
.chat-bubble.me .msg-time { color: #e5e7eb; }
/* 對方 (房客) 靠左 */
.chat-bubble.other { align-self: flex-start; background: #e5e7eb; color: #1f2937; border-bottom-left-radius: 2px; }

.input-area { display: flex; gap: 8px; }
.input-area input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.send-btn { background: #4a2c21; color: white; border: none; padding: 0 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }

/* 最終確認區 */
.confirm-section { margin-top: 12px; background: #fffbeb; padding: 12px; border-radius: 8px; border: 1px dashed #fcd34d; }
.divider-text { font-size: 12px; color: #b45309; font-weight: 600; text-align: center; margin-bottom: 8px; }
.date-time-picker { display: flex; gap: 12px; }
.field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 11px; color: #666; font-weight: 600; }
.field input { padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit; color: #4a2c21; font-weight: 600; }

/* 按鈕區 */
.card-actions { display: flex; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.btn { flex: 1; padding: 12px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 14px; }
.btn.accept { background: #15803d; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.btn.accept:hover { background: #166534; }
.btn.reject { background: #fee2e2; color: #dc2626; }
.btn.reject:hover { background: #fecaca; }

.card-footer { margin-top: 16px; text-align: center; font-size: 13px; font-weight: 600; border-top: 1px solid #eee; padding-top: 12px; }
.hint.success { color: #047857; }
.hint.error { color: #dc2626; }
.hint.gray { color: #9ca3af; }

/* Loading & Empty */
.loading-state, .empty-state { text-align: center; padding: 40px; color: #888; }
.spinner { width: 30px; height: 30px; border: 3px solid #eee; border-top-color: #4a2c21; border-radius: 50%; animation: spin 1s infinite linear; margin: 0 auto 10px; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>