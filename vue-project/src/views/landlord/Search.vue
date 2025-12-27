<template>
  <section class="panel">
    <h2 class="panel-title">租屋搜尋</h2>
    <p class="panel-hint">
      房東也可以用租客視角搜尋房源，了解市場行情（以下為示意資料）。
    </p>

    <div class="search-bar">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="輸入地點或關鍵字，例如：雲科大、火車站…"
      />
    </div>

    <div class="card-list">
      <div v-if="isLoading" style="text-align:center; padding:20px; color:#666;">載入中...</div>
      <div v-else-if="filteredSearchListings.length === 0" style="text-align:center; padding:20px; color:#666;">找不到符合的租件</div>

      <article
        v-else
        v-for="item in filteredSearchListings"
        :key="item.id"
        class="card"
        @click="openDetail(item)" 
      >
        <div class="card-header">
          <div>
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-sub">
              {{ item.area }} · {{ item.roomType }} · 
              {{ item.price ? item.price.toLocaleString() : 0 }} 元/月
            </p>
          </div>
          
          <button
            class="favorite-small"
            :class="{ active: landlordFavorites.has(item.id) }"
            @click.stop="toggleFavorite(item.id)"
          >
            <span v-if="landlordFavorites.has(item.id)">♥ 收藏中</span>
            <span v-else>♡ 收藏</span>
          </button>
        </div>
        <p class="card-desc">{{ item.description }}</p>
      </article>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content">
        <button class="close-btn" @click="closeDetail">✕</button>
        
        <div class="modal-image-box">
          <img 
            v-if="selectedRental.image" 
            :src="selectedRental.image" 
            alt="房源照片"
            class="modal-img"
          >
          <div v-else class="modal-img-placeholder">房東未上傳照片</div>
        </div>

        <div class="modal-body">
          <div class="modal-header-row">
            <h2 class="modal-title">{{ selectedRental.title }}</h2>
            <span class="modal-price">$ {{ selectedRental.price.toLocaleString() }} /月</span>
          </div>

          <div class="modal-tags">
            <span class="tag">{{ selectedRental.area }}</span>
            <span class="tag">{{ selectedRental.roomType }}</span>
          </div>

          <hr class="divider">

          <h4 class="section-title">詳細描述</h4>
          <p class="modal-desc">{{ selectedRental.description }}</p>

          <h4 class="section-title">提供設備</h4>
          <div class="amenities-list">
            <span v-for="ami in (selectedRental.amenities || [])" :key="ami" class="ami-tag">
              {{ ami }}
            </span>
            <span v-if="!selectedRental.amenities || selectedRental.amenities.length === 0" style="color:#999; font-size:13px;">
              未標示設備
            </span>
          </div>

          <div class="modal-footer">
             <p class="contact-hint">
               💡 這是競爭對手的資料，僅供市場分析參考。
             </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
const searchKeyword = ref('')
const searchListings = ref([]) // 改成空陣列，等待後端資料填入
const isLoading = ref(false)   // 加一個讀取中的狀態
const selectedRental = ref({}) // 暫存被點選的那一筆資料

const landlordFavorites = ref(new Set())

// 1. 從後端抓取所有公開租件
const fetchPublicRentals = async () => {
  try {
    isLoading.value = true
    
    // 1. 先抓出目前登入的房東是誰
    const userStr = localStorage.getItem('currentUser')
    const currentUser = userStr ? JSON.parse(userStr) : null

    const response = await api.get('/api/rentals/public')
    const json = response.data

    if (json.success) {
      // 2.過濾掉自己的租件
      let rawData = json.data
      
      if (currentUser) {
        // 只保留「房東 ID」跟「我的 ID」不一樣的租件
        rawData = rawData.filter(item => item.landlordId !== currentUser.id)
      }

      // 3. 整理格式 (維持原樣)
      searchListings.value = rawData.map(item => ({
        ...item,
        price: Number(item.price), 
        area: item.area || item.address?.substring(0, 3) || '區域未詳',
        roomType: item.roomType || item.type || '獨立套房' 
      }))
    }
  } catch (error) {
    console.error('抓取市場行情失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 2. 搜尋過濾邏輯
const filteredSearchListings = computed(() => {
  if (!searchKeyword.value) return searchListings.value
  const kw = searchKeyword.value.toLowerCase()
  return searchListings.value.filter((item) => {
    const content = (
      (item.title || '') + 
      (item.area || '') + 
      (item.description || '') + 
      (item.address || '')
    ).toLowerCase()
    return content.includes(kw)
  })
})

// 3. 收藏功能
const toggleFavorite = (id) => {
  const set = landlordFavorites.value
  if (set.has(id)) set.delete(id)
  else set.add(id)
  landlordFavorites.value = new Set(set)
}

const openDetail = (item) => {
  selectedRental.value = item
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeDetail = () => {
  showModal.value = false
  document.body.style.overflow = ''
}

// 4. 一進入頁面就抓資料
onMounted(() => {
  fetchPublicRentals()
})
</script>

<style scoped>
/* 1. 外框容器 (Panel)*/
.panel {
  max-width: 1100px;
  margin: 0 auto;
  background: #fffdf9;
  border-radius: 16px;
  padding: 16px 18px 18px;
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12);
  border: 1px solid rgba(242, 230, 220, 0.9);
  position: relative; /* 為了可能的定位需求 */
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #2e2622;
}

.panel-hint {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/*2. 搜尋列 (Search Bar)*/
.search-bar {
  margin-top: 10px;
  margin-bottom: 8px;
}

.search-bar input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid #d1c7bf;
  font-size: 14px;
  outline: none;
  font-family: "Iansui", sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar input:focus {
  border-color: #a18c7b;
  box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4);
}


/* 3. 租件卡片列表 (Card List)*/
.card-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  padding: 10px 12px 10px;
  border-radius: 12px;
  background: #fefbf7;
  border: 1px solid #e1d4c8;
  box-shadow: 0 2px 8px rgba(46, 38, 34, 0.08);
  /* 互動效果 */
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 38, 34, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2e2622;
  margin: 0;
}

.card-sub {
  font-size: 13px;
  color: #6b7280;
  margin: 2px 0 0 0;
}

.card-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #4b5563;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 4. 小元件：收藏按鈕 */
.favorite-small {
  border: none;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  cursor: pointer;
  background: #f2e6dc;
  color: #4a2c21;
  transition: all 0.2s;
  flex-shrink: 0; /* 防止被擠壓 */
}

.favorite-small:hover {
  background: #e6d0c0;
}

.favorite-small.active {
  background: #4a2c21;
  color: #f2e6dc;
}

/* 5. 彈跳視窗 (Modal) - 詳情頁 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 半透明黑底 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(2px); /* 背景模糊效果 */
  padding: 20px; /* 避免手機版貼邊 */
}

.modal-content {
  background: #fff;
  width: 100%;
  max-width: 600px; /* 電腦版最大寬度 */
  max-height: 90vh; /* 最高佔螢幕 90% */
  overflow-y: auto; /* 內容太長出現捲軸 */
  border-radius: 16px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: popIn 0.3s ease-out; /* 進場動畫 */
}

/* 彈窗進場動畫 */
@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 關閉按鈕 (X) */
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  color: #555;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 圖片區塊 */
.modal-image-box {
  width: 100%;
  height: 250px;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-img-placeholder {
  color: #999;
  font-size: 14px;
}

/* 內容區塊 */
.modal-body {
  padding: 20px 24px 30px;
}

.modal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 10px;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #2e2622;
  margin: 0;
  line-height: 1.3;
}

.modal-price {
  font-size: 20px;
  font-weight: 600;
  color: #b45309;
  white-space: nowrap; /* 防止價格換行 */
}

/* 標籤區 */
.modal-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tag {
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: #4b5563;
}

/* 分隔線與區塊標題 */
.divider {
  border: 0;
  border-top: 1px solid #eee;
  margin: 20px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2e2622;
  margin-bottom: 8px;
  margin-top: 0;
}

.modal-desc {
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
  white-space: pre-line; /* 保留換行符號 */
}

/* 設備列表 */
.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.ami-tag {
  border: 1px solid #e5e7eb;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #4b5563;
  background: #fff;
}

/* 底部提示 */
.modal-footer {
  margin-top: 30px;
}

.contact-hint {
  background: #fffbeb;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
  text-align: center;
  margin: 0;
}
</style>