<template>
  <div class="map-search-container">
    
    <div class="search-bar-wrapper">
      <div class="search-input-group">
        <span class="search-icon">🔍</span>
        <input 
          v-model="keyword" 
          type="text" 
          placeholder="輸入關鍵字..." 
        />
      </div>
      <div class="result-count">
        <span v-if="isLoading">載入中...</span>
        <span v-else>找到 <b>{{ filteredRentals.length }}</b> 間房源</span>
      </div>
    </div>

    <div class="content-layout">
      
      <div class="list-panel">
        <div class="cards-wrapper">
          
          <div v-if="isLoading" class="loading-text">資料載入中...</div>
          
          <div v-else-if="filteredRentals.length === 0" class="no-data-text">
            沒有符合的房源
          </div>

          <div 
            v-else
            v-for="item in filteredRentals" 
            :key="item.id"
            class="rental-card"
            :class="{ 'active': selectedId === item.id }"
            @click="focusOnRental(item)"
          >
            <div class="card-image">
              <img 
                :src="item.images && item.images.length > 0 ? item.images[0] : defaultImage" 
                class="real-img"
              />
              <span class="card-tag">{{ item.type }}</span>
            </div>

            <div class="card-content">
              <h3 class="card-title">{{ item.title }}</h3>
              
              <div class="card-details">
                <span class="detail-item">📍 {{ item.address }}</span>
                <span class="detail-item"> · {{ item.area }} 坪</span>
              </div>

              <div class="card-bottom">
                <span class="card-price">$ {{ Number(item.price).toLocaleString() }}</span>
                <span class="price-unit">/月</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="map-panel">
        <div id="tenant-map" class="map-canvas"></div>
        
        <div v-if="!isApiLoaded" class="api-warning">
          <p>⚠️ 地圖載入中或 API Key 未設定</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const rentals = ref([]) // 存放後端抓回來的資料
const keyword = ref('')
const selectedId = ref(null)
const isApiLoaded = ref(false)
const isLoading = ref(true)
const defaultImage = 'https://cdn-icons-png.flaticon.com/512/609/609803.png'

const map = shallowRef(null)
const markers = shallowRef([])

// 🟢 1. 從後端撈資料
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/rentals/public')
    const json = await res.json()

    if (json.success) {
      // ✨ 資料處理：幫沒有經緯度的資料加上「隨機座標」(模擬在斗六)
      // 未來您可以在後端存入真實的 lat/lng
      rentals.value = json.data.map(item => ({
        ...item,
        // 如果資料庫有 lat 就用，沒有的話就隨機產生在 23.70, 120.43 附近
        lat: item.lat || (23.705 + (Math.random() - 0.5) * 0.03),
        lng: item.lng || (120.430 + (Math.random() - 0.5) * 0.03)
      }))
    }
  } catch (e) {
    console.error('載入失敗', e)
  } finally {
    isLoading.value = false
    initMap() // 資料抓完後初始化地圖
  }
})

// 🟢 2. 前端篩選邏輯
const filteredRentals = computed(() => {
  if (!keyword.value) return rentals.value
  const k = keyword.value.toLowerCase()
  return rentals.value.filter(item => 
    item.title.toLowerCase().includes(k) || 
    item.address.toLowerCase().includes(k)
  )
})

// 🟢 3. 監聽篩選結果，即時更新地圖標記
watch(filteredRentals, () => {
  updateMarkers()
})

// 🟢 4. 初始化 Google Map
const initMap = () => {
  const el = document.getElementById('tenant-map')
  if (!el) return
  if (!window.google || !window.google.maps) {
    // 若沒抓到 API，稍後再試 (簡單的重試機制)
    setTimeout(initMap, 500) 
    return
  }
  
  isApiLoaded.value = true
  map.value = new window.google.maps.Map(el, {
    center: { lat: 23.705, lng: 120.430 }, // 預設中心 (斗六)
    zoom: 14,
    disableDefaultUI: false,
    clickableIcons: false
  })
  
  updateMarkers()
}

// 🟢 5. 更新地圖上的標記 (Markers)
const updateMarkers = () => {
  if (!map.value) return

  // 清除舊標記
  markers.value.forEach(m => m.setMap(null))
  markers.value = []

  filteredRentals.value.forEach(rental => {
    const marker = new window.google.maps.Marker({
      position: { lat: rental.lat, lng: rental.lng },
      map: map.value,
      title: rental.title
    })

    // 點擊標記時
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding:4px; min-width:150px;">
          <h4 style="margin:0 0 4px;">${rental.title}</h4>
          <span style="color:#a18c7b; font-weight:bold;">$${rental.price}</span>
        </div>
      `
    })

    marker.addListener('click', () => {
      infoWindow.open(map.value, marker)
      selectedId.value = rental.id
      // 選用：點擊地圖標記時，跳轉到詳情頁
      // router.push(`/TenantHome/rental/${rental.id}`)
    })

    markers.value.push(marker)
  })
}

// 🟢 6. 點擊列表卡片，地圖移動
const focusOnRental = (rental) => {
  selectedId.value = rental.id
  if (map.value) {
    map.value.panTo({ lat: rental.lat, lng: rental.lng })
    map.value.setZoom(16)
  }
  // 點擊卡片也跳轉詳情 (可選)
  router.push(`/TenantHome/rental/${rental.id}`)
}

const handleSearch = () => { 
  // v-model 已自動觸發 computed，這裡可以留空或做其他處理 
}
</script>

<style scoped>
/* 容器 */
.map-search-container {
  height: calc(100vh - 80px); /* 扣掉 Header 高度 */
  display: flex; flex-direction: column; background: #fdfdfd;
}

/* 搜尋列 */
.search-bar-wrapper {
  padding: 12px 20px; background: #fff; border-bottom: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02); z-index: 10;
}
.search-input-group {
  display: flex; align-items: center; background: #f3f4f6; padding: 8px 16px;
  border-radius: 99px; width: 300px; border: 1px solid transparent; transition: 0.2s;
}
.search-input-group:focus-within {
  border-color: #a18c7b; background: #fff; box-shadow: 0 0 0 3px rgba(161, 140, 123, 0.1);
}
.search-input-group input { border: none; background: transparent; outline: none; margin-left: 8px; width: 100%; font-size: 14px; }
.result-count { font-size: 14px; color: #6b7280; }

/* 版面 */
.content-layout { flex: 1; display: flex; overflow: hidden; }

/* 左側列表 */
.list-panel {
  width: 420px; overflow-y: auto; border-right: 1px solid #e5e7eb;
  background: #f2e6dc; padding: 16px;
}
.cards-wrapper { display: flex; flex-direction: column; gap: 16px; }
.loading-text, .no-data-text { text-align: center; color: #888; margin-top: 20px; }

/* 卡片設計 */
.rental-card {
  display: flex; background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.2s ease;
  border: 2px solid transparent; height: 110px;
}
.rental-card:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }
.rental-card.active { border-color: #a18c7b; background: #fffdf9; }

/* 圖片區 */
.card-image {
  width: 120px; background-color: #eee; position: relative; flex-shrink: 0;
}
.real-img { width: 100%; height: 100%; object-fit: cover; }
.card-tag {
  position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.6); color: #fff;
  font-size: 10px; padding: 2px 6px; border-radius: 4px;
}

/* 內容區 */
.card-content { flex: 1; padding: 10px; display: flex; flex-direction: column; justify-content: space-between; }
.card-title { font-size: 15px; font-weight: 700; color: #2e2622; margin: 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-details { font-size: 12px; color: #6b7280; }
.card-bottom { display: flex; align-items: baseline; justify-content: flex-end; }
.card-price { font-size: 18px; font-weight: 700; color: #a18c7b; }
.price-unit { font-size: 12px; color: #9ca3af; margin-left: 2px; }

/* 右側地圖 */
.map-panel { flex: 1; position: relative; background: #fdfaf6; padding: 24px; }
.map-canvas {
  width: 100%; height: 100%; border-radius: 20px; border: 4px solid #a18c7b;
  outline: 6px solid rgba(255, 255, 255, 0.8); outline-offset: -10px;
  box-shadow: 0 10px 30px rgba(74, 44, 33, 0.15); overflow: hidden;
}
.api-warning { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ef4444; }

/* RWD */
@media (max-width: 768px) {
  .content-layout { flex-direction: column-reverse; }
  .map-panel { flex: 1; padding: 0; }
  .map-canvas { border-radius: 0; border: none; border-top: 4px solid #a18c7b; outline: none; }
  .list-panel { width: 100%; height: 45%; padding: 12px; }
  .search-input-group { width: 200px; }
}
</style>