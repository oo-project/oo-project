<template>
  <div class="detail-page">
    
    <div class="nav-header">
      <button class="back-btn" @click="goBack">
        <span class="icon">‹</span>
      </button>
      <span class="page-title">{{ rental.title || '房源詳情' }}</span>
      <button class="share-btn-top" @click="shareLink">🔗</button>
    </div>

    <div v-if="isLoading" class="state-container">
      <div class="spinner"></div>
      <p>正在載入房源資訊...</p>
    </div>
    
    <div v-else-if="error" class="state-container">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="goBack">返回列表</button>
    </div>

    <div v-else class="main-content">
      
      <div class="image-gallery">
        <template v-if="rental.images && rental.images.length > 0">
          <img 
            v-for="(img, index) in rental.images" 
            :key="index"
            :src="img" 
            class="gallery-img"
            alt="Room Photo"
          />
          <div class="image-counter">1 / {{ rental.images.length }}</div>
        </template>
        <template v-else>
          <img :src="defaultImage" class="gallery-img" alt="Default" />
        </template>
      </div>

      <div class="content-container">
        
        <div class="header-section">
          <h1 class="main-title">{{ rental.title }}</h1>
          <div class="price-row">
            <span class="price">{{ Number(rental.price).toLocaleString() }}</span>
            <span class="unit">元/月</span>
          </div>
          
          <div class="address-row" @click="openGoogleMap">
            <span class="location-icon">📍</span>
            <span class="address-text">{{ rental.address }}</span>
            <span class="map-hint">導航 ></span>
          </div>
        </div>

        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">類型</span>
            <span class="spec-value">{{ rental.type }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">坪數</span>
            <span class="spec-value">{{ rental.area }} 坪</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">樓層</span>
            <span class="spec-value">{{ rental.floor }}F</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">押金</span>
            <span class="spec-value">{{ rental.deposit ? rental.deposit + '元' : '面議' }}</span>
          </div>
        </div>

        <hr class="divider" />

        <section class="section">
          <h3 class="section-title">提供設備</h3>
          <div class="amenities-wrap" v-if="rental.amenities && rental.amenities.length">
            <div v-for="item in rental.amenities" :key="item" class="amenity-chip">
              {{ item }}
            </div>
          </div>
          <p v-else class="no-data">未標示設備</p>
        </section>

        <hr class="divider" />

        <section class="section">
          <h3 class="section-title">房源描述 & 規則</h3>
          <p class="description">{{ rental.description || '房東未提供詳細描述。' }}</p>
        </section>

        <div style="height: 100px;"></div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bar-left">
        <button class="icon-btn" @click="toggleFavorite">
          <span class="icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
          <span class="text">{{ isFavorite ? '已收藏' : '收藏' }}</span>
        </button>
        
        <button class="icon-btn" @click="openLandlordModal">
          <span class="icon">👨‍💼</span>
          <span class="text">房東</span>
        </button>
      </div>
      
      <button class="contact-btn" @click="contactLandlord">
        立即預約
      </button>
    </div>

    <div v-if="showLandlordModal" class="modal-overlay" @click.self="showLandlordModal = false">
      <div class="modal-card">
        <button class="close-modal" @click="showLandlordModal = false">✕</button>
        
        <div class="landlord-header">
          <div class="avatar-wrapper">
            <img 
              :src="landlordInfo.avatar || 'https://cdn-icons-png.flaticon.com/512/236/236832.png'" 
              class="landlord-avatar"
            />
          </div>
          <div>
            <h3 class="landlord-name">{{ landlordInfo.name || '房東' }}</h3>
            <p class="landlord-role">認證房東</p>
          </div>
        </div>
        
        <hr class="modal-divider">
        
        <div class="landlord-bio">
          <h4 class="bio-title">關於我</h4>
          <p class="bio-content">
            {{ landlordInfo.bio || '這位房東很害羞，還沒寫自我介紹。' }}
          </p>
        </div>

        <button class="chat-btn" @click="contactLandlord">
          與房東聊聊
        </button>
      </div>
    </div>

    <BookingModal 
      v-if="showBookingModal" 
      :rental="rental" 
      :user="currentUser"
      @close="showBookingModal = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 👇 請確保已建立此元件
import BookingModal from './components/BookingModal.vue'

const route = useRoute()
const router = useRouter()

// 資料狀態
const rental = ref({})
const isLoading = ref(true)
const error = ref('')
const isFavorite = ref(false)
const defaultImage = 'https://cdn-icons-png.flaticon.com/512/609/609803.png'

// 房東資訊相關
const showLandlordModal = ref(false)
const landlordInfo = ref({})

// 預約相關
const showBookingModal = ref(false)
const currentUser = ref(null)

// 🚀 初始化：抓取房源資料
onMounted(async () => {
  const rentalId = route.params.id
  try {
    const res = await fetch(`https://oo-project.zeabur.app/api/rentals/${rentalId}`)
    const json = await res.json()
    if (json.success) {
      rental.value = json.data
    } else {
      error.value = '找不到房源'
    }
  } catch (e) {
    console.error(e)
    error.value = '連線錯誤，無法載入資料'
  } finally {
    isLoading.value = false
  }
})

// 🔙 返回
const goBack = () => router.back()

// 🔗 分享網址
const shareLink = () => {
  navigator.clipboard.writeText(window.location.href)
    .then(() => alert('網址已複製！'))
    .catch(() => alert('請手動複製網址'))
}

// ❤️ 收藏
const toggleFavorite = () => { isFavorite.value = !isFavorite.value }

// 🗺️ 開啟 Google Maps
const openGoogleMap = () => {
  if (rental.value.address) {
    window.open(`http://maps.google.com/?q=${encodeURIComponent(rental.value.address)}`, '_blank')
  }
}

// 👨‍💼 打開房東 Modal
const openLandlordModal = async () => {
  if (landlordInfo.value.id) {
    showLandlordModal.value = true
    return
  }

  const landlordId = rental.value.landlordId
  if (!landlordId) {
    alert('此房源未關聯房東資料')
    return
  }

  try {
    const res = await fetch(`https://oo-project.zeabur.app/api/user/${landlordId}`)
    const json = await res.json()
    
    if (json.success) {
      landlordInfo.value = json.data
      landlordInfo.value.id = landlordId
      showLandlordModal.value = true
    } else {
      alert('無法取得房東資料')
    }
  } catch (e) {
    console.error(e)
    alert('連線失敗')
  }
}

// 📅 點擊「立即預約」按鈕
const contactLandlord = () => {
  // 1. 檢查是否登入
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) {
    alert('請先登入才能預約看房喔！')
    router.push('/login') // 假設您有 Login 頁面
    return
  }
  
  // 2. 設定當前使用者並打開預約 Modal
  currentUser.value = JSON.parse(userStr)
  showBookingModal.value = true
  
  // 如果原本打開著房東資訊卡，也把它關掉，體驗較好
  showLandlordModal.value = false
}
</script>

<style scoped>
/* 全頁面設定 */
.detail-page {
  background: #fff; min-height: 100vh; padding-top: 50px; font-family: "Iansui", sans-serif;
  max-width: 600px; margin: 0 auto; box-shadow: 0 0 20px rgba(0,0,0,0.05); position: relative;
}

/* 導覽列 */
.nav-header {
  position: fixed; top: 0; left: 0; right: 0; height: 50px;
  background: rgba(255,255,255,0.98); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 12px; z-index: 100; border-bottom: 1px solid #f0f0f0;
  max-width: 600px; margin: 0 auto;
}
.back-btn, .share-btn-top { background: none; border: none; font-size: 28px; cursor: pointer; color: #4a2c21; padding: 0 8px; display: flex; align-items: center; }
.share-btn-top { font-size: 20px; }
.page-title { font-size: 16px; font-weight: 600; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 60%; color: #2e2622; }

/* 載入狀態 */
.state-container { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #888; }
.spinner { width: 30px; height: 30px; border: 3px solid #eee; border-top-color: #a18c7b; border-radius: 50%; animation: spin 1s infinite linear; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.retry-btn { padding: 8px 16px; background: #4a2c21; color: white; border-radius: 6px; border: none; cursor: pointer; }

/* 圖片輪播 */
.image-gallery { position: relative; width: 100%; height: 280px; background: #f0f0f0; display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.gallery-img { width: 100%; height: 100%; object-fit: cover; flex-shrink: 0; scroll-snap-align: center; }
.image-counter { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; }

/* 內容區 */
.content-container { padding: 20px; }

.header-section { margin-bottom: 24px; }
.main-title { font-size: 22px; font-weight: 700; color: #2e2622; margin: 0 0 8px 0; line-height: 1.4; }
.price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 16px; }
.price { font-size: 26px; font-weight: 700; color: #a18c7b; }
.unit { font-size: 14px; color: #666; }

.address-row {
  display: flex; align-items: center; gap: 8px; color: #4b5563; font-size: 14px;
  background: #f9fafb; padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: 0.2s; border: 1px solid #f0f0f0;
}
.address-row:active { background: #f0f0f0; transform: scale(0.99); }
.map-hint { margin-left: auto; font-size: 12px; color: #a18c7b; font-weight: 600; }

/* 規格 Grid */
.specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
.spec-item {
  background: #fffdf9; border: 1px solid #f2e6dc; border-radius: 12px;
  padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
}
.spec-label { font-size: 12px; color: #8b7e74; }
.spec-value { font-size: 16px; font-weight: 600; color: #4a2c21; }

.divider { border: none; border-top: 1px solid #eee; margin: 24px 0; }
.section-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #2e2622; border-left: 4px solid #a18c7b; padding-left: 10px; }

/* 設施 Chips */
.amenities-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.amenity-chip { font-size: 13px; color: #555; background: #f3f4f6; padding: 6px 12px; border-radius: 20px; }
.description { font-size: 15px; line-height: 1.8; color: #444; white-space: pre-line; text-align: justify; }
.no-data { font-style: italic; color: #aaa; }

/* 底部操作列 */
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; height: 76px;
  background: white; border-top: 1px solid #eee; display: flex; align-items: center; padding: 0 20px;
  max-width: 600px; margin: 0 auto; z-index: 90; justify-content: space-between;
}
.bar-left { display: flex; gap: 20px; }
.icon-btn { background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #666; cursor: pointer; min-width: 40px; }
.icon-btn .icon { font-size: 20px; }
.icon-btn .text { font-size: 10px; font-weight: 500; }

.contact-btn {
  flex: 1; height: 48px; background: #4a2c21; color: white; border: none; border-radius: 12px;
  font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.2s; margin-left: 20px;
  box-shadow: 0 4px 12px rgba(74, 44, 33, 0.2);
}
.contact-btn:active { transform: scale(0.98); }

/* ✨ Modal 樣式 (房東資訊卡專用) ✨ */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 200;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); padding: 20px;
}
.modal-card {
  background: white; width: 100%; max-width: 360px;
  border-radius: 20px; padding: 24px; position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.close-modal { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 20px; cursor: pointer; color: #ccc; padding: 4px; }
.close-modal:hover { color: #666; }

.landlord-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.avatar-wrapper { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #a18c7b; padding: 2px; flex-shrink: 0; }
.landlord-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.landlord-name { font-size: 20px; font-weight: 700; color: #2e2622; margin: 0 0 4px; }
.landlord-role { font-size: 12px; color: #a18c7b; background: #fdf6ed; display: inline-block; padding: 2px 8px; border-radius: 6px; font-weight: 600; }

.modal-divider { border: none; border-top: 1px solid #eee; margin: 0 0 20px; }
.bio-title { font-size: 15px; font-weight: 600; color: #4b5563; margin-bottom: 8px; }
.bio-content { font-size: 14px; line-height: 1.6; color: #4b5563; white-space: pre-line; max-height: 200px; overflow-y: auto; }

.chat-btn {
  width: 100%; background: #4a2c21; color: white; border: none; padding: 12px;
  border-radius: 12px; font-size: 16px; margin-top: 24px; cursor: pointer; font-weight: 600;
}

/* 房東編輯模式：圖片縮小 */
.image-gallery.edit-mode {
  height: 140px;          /* 原本 250px → 改小 */
}

/* 編輯模式下圖片不要太壓迫 */
.image-gallery.edit-mode .gallery-img {
  object-fit: cover;
}
</style>
