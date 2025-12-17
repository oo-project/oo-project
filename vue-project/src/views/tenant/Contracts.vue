<template>
  <div class="page-container">
    <h2 class="section-title">租約管理</h2>
    
    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'pending' }" 
        @click="currentTab = 'pending'"
      >
        待簽訂合約
        <span class="badge" v-if="pendingContracts.length > 0">{{ pendingContracts.length }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'history' }" 
        @click="currentTab = 'history'"
      >
        簽約紀錄
      </button>
    </div>

    <div v-if="currentTab === 'pending'" class="contract-list">
      <div v-for="item in pendingContracts" :key="item.id" class="card highlight-card">
        <h3 class="rental-title">{{ item.rentalTitle }}</h3>
        <p class="status-text">⚠️ 等待您的簽署</p>
        
        <div class="info-grid">
          <div><span class="label">房東：</span>{{ item.landlordName }}</div>
          <div><span class="label">租期：</span>{{ item.period }}</div>
          <div><span class="label">租金：</span>{{ item.price }} / 月</div>
        </div>

        <button class="primary-btn" @click="signContract(item)">
          ✍️ 前往簽名
        </button>
      </div>
      <p v-if="pendingContracts.length === 0" class="empty-state">目前沒有待簽訂的合約。</p>
    </div>

    <div v-if="currentTab === 'history'" class="contract-list">
      <div v-for="item in historyContracts" :key="item.id" class="card">
        <div class="card-header">
          <h3 class="rental-title">{{ item.rentalTitle }}</h3>
          <span class="status-badge status-done">已完成</span>
        </div>
        <div class="info-row">
          <span class="label">合約期間：</span>{{ item.period }}
        </div>
        <div class="info-row">
          <span class="label">簽約日期：</span>{{ item.signedDate }}
        </div>
        <button class="text-btn" @click="viewContract(item)">查看合約詳情 ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentTab = ref('pending')

const pendingContracts = ref([
  {
    id: 101,
    rentalTitle: '火車站前全新大樓',
    landlordName: '林先生',
    period: '2026/01/01 - 2026/12/31',
    price: '8,500'
  }
])

const historyContracts = ref([
  {
    id: 201,
    rentalTitle: '斗六舊家雅房',
    period: '2024/06/01 - 2025/06/30',
    signedDate: '2024/05/20'
  }
])

const signContract = (item) => {
  alert(`進入「${item.rentalTitle}」的電子簽約頁面（示意）`)
  // 簽約完成後，可以把資料移到 historyContracts
}

const viewContract = (item) => {
  alert(`開啟合約 PDF 檔案（示意）`)
}
</script>

<style scoped>
.page-container { max-width: 800px; margin: 0 auto; }
.section-title { font-size: 20px; font-weight: 600; color: #2e2622; margin-bottom: 16px; }

/* Tabs 樣式 */
.tabs { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 16px; }
.tab-btn {
  flex: 1; padding: 12px; background: none; border: none; border-bottom: 2px solid transparent;
  color: #6b7280; font-size: 15px; cursor: pointer; transition: 0.2s; font-family: "Iansui", sans-serif;
}
.tab-btn.active { color: #4a2c21; border-bottom-color: #4a2c21; font-weight: 600; }
.badge { background: #ef4444; color: white; font-size: 11px; padding: 2px 6px; border-radius: 10px; margin-left: 4px; vertical-align: middle;}

/* 列表樣式 */
.card { background: #fffdf9; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.highlight-card { border: 1px solid #fca5a5; background: #fff1f2; }

.rental-title { font-size: 16px; font-weight: 600; color: #2e2622; }
.status-text { color: #be123c; font-size: 13px; margin: 4px 0 12px; font-weight: 600; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; margin-bottom: 16px; }
.info-row { font-size: 14px; margin-bottom: 6px; color: #374151; }
.label { color: #6b7280; margin-right: 4px; }

.status-badge.status-done { background: #e5e7eb; color: #374151; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }

.primary-btn {
  width: 100%; padding: 10px; background: #be123c; color: white; border: none; border-radius: 8px;
  font-size: 15px; cursor: pointer; font-family: "Iansui", sans-serif;
}
.text-btn { background: none; border: none; color: #4a2c21; font-size: 13px; cursor: pointer; margin-top: 8px; text-decoration: underline; font-family: "Iansui", sans-serif; }
.empty-state { text-align: center; color: #9ca3af; padding: 20px; }
</style>