<template>
  <div class="page-container">
    <h2 class="page-title">看房預約紀錄 (對話模式)</h2>

    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.value" class="tab-btn"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value">{{ tab.label }}</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div><p>載入中...</p>
    </div>

    <div v-else class="list-container">
      <div v-if="filteredList.length === 0" class="empty-state">尚無紀錄</div>

      <div v-for="item in filteredList" :key="item.id" class="card" :class="item.status">
        <div class="card-header">
          <span class="rental-name">{{ item.rentalTitle }}</span>
          <span class="status-badge" :class="item.status">{{ getStatusText(item.status) }}</span>
        </div>

        <div class="card-body">
          <div class="info-row"><span class="icon">📅</span> {{ item.date }} {{ item.time }}</div>
          <div class="info-row" v-if="item.message && (!item.history || item.history.length === 0)">
            <span class="icon">📝</span> 備註：{{ item.message }}
          </div>

          <div class="chat-section" v-if="item.history && item.history.length > 0">
            <div class="chat-box">
              <div 
                v-for="(msg, idx) in item.history" 
                :key="idx" 
                class="chat-bubble"
                :class="msg.role === 'tenant' ? 'me' : 'other'"
              >
                <div class="bubble-content">
                  <strong>{{ msg.role === 'tenant' ? '我' : '房東' }}</strong>
                  <p>{{ msg.content }}</p>
                  <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="input-area" v-if="['pending', 'negotiating'].includes(item.status)">
            <input 
              v-model="inputMap[item.id]" 
              placeholder="回覆房東..." 
              @keyup.enter="sendReply(item.id)"
            />
            <button class="reply-btn" @click="sendReply(item.id)">回覆</button>
          </div>
        </div>

        <div class="card-footer" v-if="['pending', 'negotiating'].includes(item.status)">
          <button class="cancel-btn" @click="cancelAppoint(item.id)">取消預約</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const appointments = ref([])
const isLoading = ref(true)
const currentTab = ref('active')
const inputMap = ref({})

const tabs = [
  { label: '進行中', value: 'active' },
  { label: '歷史紀錄', value: 'history' }
]

const fetchMyReservations = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) return
    const res = await fetch(`https://oo-project.zeabur.app/api/appointments/tenant/${user.id}`)
    const json = await res.json()
    if (json.success) appointments.value = json.data
  } catch (e) { console.error(e) } finally { isLoading.value = false }
}

const sendReply = async (id) => {
  const msg = inputMap.value[id]
  if (!msg) return alert('請輸入內容')

  try {
    const res = await fetch(`https://oo-project.zeabur.app/api/appointments/${id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'tenant', message: msg }) // 👈 身份是房客
    })

    if (res.ok) {
      const target = appointments.value.find(i => i.id === id)
      if (target) {
        if (!target.history) target.history = []
        target.history.push({ role: 'tenant', content: msg, createdAt: new Date().toISOString() })
        target.status = 'negotiating'
      }
      inputMap.value[id] = ''
    }
  } catch (e) { alert('發送失敗') }
}

const cancelAppoint = async (id) => {
  if (!confirm('確定取消？')) return
  try {
    const res = await fetch(`https://oo-project.zeabur.app/api/appointments/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    })
    if (res.ok) {
      const target = appointments.value.find(i => i.id === id)
      if (target) target.status = 'cancelled'
    }
  } catch (e) { alert('操作失敗') }
}

const filteredList = computed(() => {
  if (currentTab.value === 'active') return appointments.value.filter(i => ['pending', 'negotiating', 'confirmed'].includes(i.status))
  return appointments.value.filter(i => ['rejected', 'cancelled'].includes(i.status))
})

const getStatusText = (s) => ({ pending: '待確認', confirmed: '預約成功', rejected: '已婉拒', negotiating: '協調中', cancelled: '已取消' }[s] || s)
const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''

onMounted(() => fetchMyReservations())
</script>

<style scoped>
.page-container { padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 80px; }
.tabs { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #ddd; }
.tab-btn { background: none; border: none; padding: 10px 4px; color: #888; cursor: pointer; border-bottom: 3px solid transparent; }
.tab-btn.active { color: #4a2c21; font-weight: 600; border-bottom-color: #4a2c21; }
.card { background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
.card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.status-badge { font-size: 12px; padding: 4px 8px; border-radius: 6px; font-weight: 600; background: #eee; }
.status-badge.confirmed { background: #ecfdf5; color: #047857; }
.status-badge.negotiating { background: #fefce8; color: #b45309; }

/* 對話樣式 */
.chat-section { margin-top: 10px; padding: 10px; background: #f9f9f9; border-radius: 8px; }
.chat-box { max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.chat-bubble { max-width: 85%; padding: 6px 10px; border-radius: 10px; font-size: 13px; }
.chat-bubble strong { display: block; font-size: 10px; margin-bottom: 2px; }
.chat-bubble p { margin: 0; }
.msg-time { font-size: 10px; opacity: 0.6; display: block; text-align: right; }

/* 我 (房客) 靠右 */
.chat-bubble.me { align-self: flex-end; background: #4a2c21; color: white; }
.chat-bubble.me .msg-time { color: #ddd; }
/* 對方 (房東) 靠左 */
.chat-bubble.other { align-self: flex-start; background: #e5e7eb; color: #333; }

.input-area { display: flex; gap: 8px; margin-top: 10px; }
.input-area input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
.reply-btn { background: #4a2c21; color: white; border: none; padding: 0 12px; border-radius: 6px; cursor: pointer; }

.card-footer { margin-top: 16px; border-top: 1px solid #f9fafb; padding-top: 12px; text-align: right; }
.cancel-btn { background: white; border: 1px solid #ddd; padding: 6px 12px; border-radius: 6px; color: #666; cursor: pointer; font-size: 13px; }
.cancel-btn:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
</style>