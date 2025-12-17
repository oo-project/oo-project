<template>
  <div class="page-container">
    <h2 class="section-title">看房預約</h2>
    <p class="subtitle">您預約的租件看房進度如下。</p>

    <div class="reservation-list">
      <div 
        v-for="item in reservations" 
        :key="item.id" 
        class="card"
      >
        <div class="card-header">
          <h3 class="rental-title">{{ item.rentalTitle }}</h3>
          <span 
            class="status-badge"
            :class="item.status === 'confirmed' ? 'status-success' : 'status-pending'"
          >
            {{ item.status === 'confirmed' ? '🎉 預約成功' : '⏳ 房東確認中' }}
          </span>
        </div>

        <div class="info-row">
          <span class="label">看房時間：</span>
          <span class="value">{{ item.time }}</span>
        </div>
        <div class="info-row">
          <span class="label">房東：</span>
          <span class="value">{{ item.landlordName }}</span>
        </div>
        <div class="info-row" v-if="item.note">
          <span class="label">備註：</span>
          <span class="value">{{ item.note }}</span>
        </div>

        <div class="card-footer">
          <button class="outline-btn" @click="contactLandlord(item)">
            聯絡房東
          </button>
          <button 
            v-if="item.status === 'pending'" 
            class="cancel-btn" 
            @click="cancelReservation(item.id)"
          >
            取消預約
          </button>
        </div>
      </div>

      <div v-if="reservations.length === 0" class="empty-state">
        目前沒有任何預約，快去「找房」看看吧！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const reservations = ref([
  {
    id: 1,
    rentalTitle: '雲科大旁溫馨套房',
    landlordName: '王先生',
    time: '2025/12/20 (六) 14:00',
    status: 'pending', // 待確認
    note: '希望能看頂樓曬衣場'
  },
  {
    id: 2,
    rentalTitle: '斗六市區採光雅房',
    landlordName: '陳小姐',
    time: '2025/12/22 (一) 10:30',
    status: 'confirmed', // 預約成功
    note: ''
  }
])

const contactLandlord = (item) => {
  alert(`開啟與 ${item.landlordName} 的聊天室...`)
}

const cancelReservation = (id) => {
  if (confirm('確定要取消這個預約嗎？')) {
    reservations.value = reservations.value.filter(r => r.id !== id)
  }
}
</script>

<style scoped>
.page-container {
  max-width: 800px;
  margin: 0 auto;
}

.section-title { font-size: 20px; font-weight: 600; color: #2e2622; margin-bottom: 4px; }
.subtitle { font-size: 13px; color: #6b7280; margin-bottom: 16px; }

.card {
  background: #fffdf9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e5e7eb;
}

.rental-title { font-size: 16px; font-weight: 600; color: #4a2c21; }

.status-badge { font-size: 12px; padding: 4px 10px; border-radius: 20px; font-weight: 500; }
.status-pending { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
.status-success { background: #ecfdf5; color: #047857; border: 1px solid #d1fae5; }

.info-row { display: flex; font-size: 14px; margin-bottom: 6px; }
.label { color: #6b7280; min-width: 70px; }
.value { color: #374151; }

.card-footer { margin-top: 16px; display: flex; gap: 8px; justify-content: flex-end; }

.outline-btn {
  border: 1px solid #a18c7b; background: white; color: #4a2c21;
  padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer;
}
.cancel-btn {
  border: 1px solid #fee2e2; background: #fff1f2; color: #be123c;
  padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer;
}

.empty-state { text-align: center; color: #9ca3af; padding: 40px; }
</style>