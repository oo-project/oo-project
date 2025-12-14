<template>
  <div class="detail-page">
    <div class="nav-header">
      <button class="back-btn" @click="goBack">
        ← 返回
      </button>
      <span class="page-title">房源詳情</span>
      <div style="width: 32px;"></div>
    </div>

    <div class="image-gallery">
      <img 
        v-for="(img, index) in rental.images" 
        :key="index"
        :src="img" 
        class="gallery-img"
        alt="Room Photo"
      />
      <div class="image-counter">1 / {{ rental.images.length }}</div>
    </div>

    <div class="content-container">
      <div class="main-info">
        <h1 class="title">{{ rental.title }}</h1>
        <p class="price">{{ rental.price.toLocaleString() }} 元/月</p>
        <div class="tags">
          <span class="tag">{{ rental.area }}</span>
          <span class="tag">{{ rental.roomType }}</span>
          <span class="tag">{{ rental.size }} 坪</span>
          <span class="tag">樓層 {{ rental.floor }}F</span>
        </div>
      </div>

      <hr class="divider" />

      <section class="section">
        <h3 class="section-title">屋況簡介</h3>
        <p class="description">
          {{ rental.description }}
        </p>
      </section>

      <hr class="divider" />

      <section class="section">
        <h3 class="section-title">提供設備</h3>
        <div class="amenities-grid">
          <div 
            v-for="item in rental.amenities" 
            :key="item" 
            class="amenity-item"
          >
            <span class="check-icon">✓</span> {{ item }}
          </div>
        </div>
      </section>

      <hr class="divider" />

      <section class="section">
        <h3 class="section-title">租屋規則 & 禁止事項</h3>
        <ul class="rules-list">
          <li v-for="rule in rental.rules" :key="rule" class="rule-item">
            🚫 {{ rule }}
          </li>
        </ul>
      </section>
      
      <div style="height: 80px;"></div>
    </div>

    <div class="bottom-action-bar">
      <div class="action-buttons-left">
        <button class="icon-btn" @click="toggleFavorite">
          <span class="icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
          <span class="icon-text">{{ isFavorite ? '已收藏' : '收藏' }}</span>
        </button>
        
        <button class="icon-btn" @click="shareLink">
          <span class="icon">🔗</span>
          <span class="icon-text">分享</span>
        </button>
      </div>

      <button class="contact-btn" @click="contactLandlord">
        聯絡房東
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 模擬資料 (實際開發會用 route.params.id 去跟後端抓資料)
const rental = ref({
  id: 1,
  title: '雲科大旁溫馨套房',
  price: 5500,
  area: '雲科大周邊',
  roomType: '套房',
  size: 6,
  floor: 3,
  description: '步行 5 分鐘可達雲科大，附近生活機能極佳，有便利商店、全聯。房間採光良好，通風佳，適合學生或上班族。',
  amenities: ['冷氣', '冰箱', '洗衣機 (共用)', '雙人床', '書桌椅', '衣櫃', '網路', '第四台'],
  rules: ['不可養寵物', '室內全面禁菸', '不可開伙 (無明火)', '禁喧嘩'],
  landlordName: '王先生',
  // 使用假圖
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  ]
})

const isFavorite = ref(false)

// 根據網址 ID 初始化 (示意)
onMounted(() => {
  console.log('目前查看的房源 ID:', route.params.id)
})

const goBack = () => {
  router.back()
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  // 這裡之後可以呼叫 Pinia 或 API 更新收藏狀態
}

const shareLink = () => {
  // 複製當前網址
  navigator.clipboard.writeText(window.location.href)
    .then(() => alert('連結已複製到剪貼簿！'))
    .catch(() => alert('分享功能暫不支援此瀏覽器'))
}

const contactLandlord = () => {
  alert(`正在開啟與房東 ${rental.value.landlordName} 的對話視窗...`)
}
</script>

<style scoped>
.detail-page {
  /* 蓋過原本 TenantHome 的 padding，讓圖片滿版 */
  position: relative;
  background: #fffdf9;
  min-height: 100vh;
  /* 為了讓 Header 固定在上面 */
  padding-top: 50px; 
}

/* 1. 頂部導覽列 (只在這頁顯示) */
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  font-size: 15px;
  color: #4a2c21;
  font-weight: 600;
  cursor: pointer;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #2e2622;
}

/* 2. 圖片輪播 */
.image-gallery {
  position: relative;
  width: 100%;
  height: 250px;
  display: flex;
  overflow-x: auto; /* 水平滑動 */
  scroll-snap-type: x mandatory; /* 滑動對齊 */
  background: #eee;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
  scroll-snap-align: center;
}

.image-counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

/* 3. 內容區 */
.content-container {
  padding: 20px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #2e2622;
  margin-bottom: 8px;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #a18c7b; /* 品牌色 */
  margin-bottom: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #f2e6dc;
  color: #4a2c21;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.divider {
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 24px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2e2622;
  margin-bottom: 12px;
}

.description {
  font-size: 15px;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-line; /* 支援換行 */
}

.amenities-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.amenity-item {
  font-size: 14px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.check-icon {
  color: #10b981; /* 綠色勾勾 */
  font-weight: bold;
}

.rules-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-item {
  font-size: 14px;
  color: #be123c; /* 紅色警示 */
  background: #fff1f2;
  padding: 8px 12px;
  border-radius: 8px;
}

/* 4. 底部操作列 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 16px;
  justify-content: space-between;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 90;
}

.action-buttons-left {
  display: flex;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.icon { font-size: 20px; }
.icon-text { font-size: 11px; color: #6b7280; }

.contact-btn {
  background: #4a2c21;
  color: #f2e6dc;
  border: none;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  flex: 1; /* 讓按鈕佔據剩餘空間 */
  margin-left: 20px;
  box-shadow: 0 4px 10px rgba(74, 44, 33, 0.2);
}

.contact-btn:active {
  transform: scale(0.98);
}
</style>