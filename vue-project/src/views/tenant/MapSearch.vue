<template>
  <div class="map-search-container">
    <div class="search-bar-wrapper">
      <div class="search-input-group">
        <span class="search-icon">🔍</span>
        <input 
          v-model="keyword" 
          type="text" 
          placeholder="輸入區域、捷運站或關鍵字..." 
          @input="handleSearch"
        />
      </div>
      <div class="result-count">
        找到 <b>{{ filteredRentals.length }}</b> 間房源
      </div>
    </div>

    <div class="content-layout">
      
      <div class="list-panel">
        <div class="cards-wrapper">
          <div 
            v-for="item in filteredRentals" 
            :key="item.id"
            class="rental-card"
            :class="{ 'active': selectedId === item.id }"
            @click="focusOnRental(item)"
          >
            <div class="card-image" :style="{ backgroundColor: item.color }">
              <span class="placeholder-emoji">🏠</span>
              <span class="card-tag">{{ item.type }}</span>
            </div>

            <div class="card-content">
              <h3 class="card-title">{{ item.title }}</h3>
              
              <div class="card-details">
                <span class="detail-item">📍 {{ item.area }}</span>
              </div>

              <div class="card-bottom">
                <span class="card-price">$ {{ item.price.toLocaleString() }}</span>
                <span class="price-unit">/月</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="map-panel">
        <div id="tenant-map" class="map-canvas"></div>
        <div v-if="!isApiLoaded" class="api-warning">
          <p>⚠️ 地圖無法載入</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// Script 部分完全不用動，維持原本的邏輯即可
import { ref, shallowRef, computed, onMounted } from 'vue'

const allRentals = [
  { id: 1, title: '雲科大溫馨獨立套房', area: '斗六市', type: '獨立套房', price: 6500, lat: 23.7075, lng: 120.4305, color: '#e2e8f0' },
  { id: 2, title: '火車站前採光雅房', area: '斗六車站', type: '雅房', price: 4500, lat: 23.7120, lng: 120.4400, color: '#fed7aa' },
  { id: 3, title: '人文公園景觀兩房', area: '人文公園', type: '整層住家', price: 12000, lat: 23.6980, lng: 120.4250, color: '#bbf7d0' },
  { id: 4, title: '棒球場旁全新裝潢', area: '斗六市', type: '分租套房', price: 7200, lat: 23.7010, lng: 120.4190, color: '#bfdbfe' },
  { id: 5, title: '鎮南路便利生活圈', area: '鎮南路', type: '獨立套房', price: 5800, lat: 23.6950, lng: 120.4350, color: '#ddd6fe' },
]

const keyword = ref('')
const selectedId = ref(null)
const isApiLoaded = ref(false)

const filteredRentals = computed(() => {
  if (!keyword.value) return allRentals
  const k = keyword.value.toLowerCase()
  return allRentals.filter(item => 
    item.title.toLowerCase().includes(k) || 
    item.area.toLowerCase().includes(k)
  )
})

const map = shallowRef(null)
const markers = shallowRef([])

const initMap = () => {
  const el = document.getElementById('tenant-map')
  if (!el) return
  if (!window.google || !window.google.maps) {
    isApiLoaded.value = false
    return
  }
  isApiLoaded.value = true
  map.value = new window.google.maps.Map(el, {
    center: { lat: 23.705, lng: 120.430 },
    zoom: 14,
    disableDefaultUI: false,
    clickableIcons: false
  })
  updateMarkers()
}

const updateMarkers = () => {
  if (!map.value || !isApiLoaded.value) return
  markers.value.forEach(m => m.setMap(null))
  markers.value = []
  filteredRentals.value.forEach(rental => {
    const marker = new window.google.maps.Marker({
      position: { lat: rental.lat, lng: rental.lng },
      map: map.value,
      title: rental.title
    })
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="padding:4px;"><h4 style="margin:0;">${rental.title}</h4></div>`
    })
    marker.addListener('click', () => {
      infoWindow.open(map.value, marker)
      selectedId.value = rental.id
      // 這裡可以做捲動到卡片的邏輯
    })
    markers.value.push(marker)
  })
}

const focusOnRental = (rental) => {
  selectedId.value = rental.id
  if (map.value && isApiLoaded.value) {
    map.value.panTo({ lat: rental.lat, lng: rental.lng })
    map.value.setZoom(16)
  }
}

const handleSearch = () => { updateMarkers() }
onMounted(() => { initMap() })
</script>

<style scoped>
/* 容器設定 */
.map-search-container {
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  background: #fdfdfd;
}

/* 搜尋列 */
.search-bar-wrapper {
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  z-index: 10;
}
.search-input-group {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  padding: 8px 16px;
  border-radius: 99px;
  width: 300px;
  border: 1px solid transparent;
  transition: 0.2s;
}
.search-input-group:focus-within {
  border-color: #a18c7b;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(161, 140, 123, 0.1);
}
.search-input-group input { border: none; background: transparent; outline: none; margin-left: 8px; width: 100%; font-size: 14px; }
.result-count { font-size: 14px; color: #6b7280; }

/* 版面佈局 */
.content-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ✨✨ 左側列表區 (卡片化重點) ✨✨ */
.list-panel {
  width: 420px; /* 稍微加寬一點，讓卡片更好看 */
  overflow-y: auto;
  border-right: 1px solid #e5e7eb;
  /* 背景改成米色/淺灰，讓白色卡片浮出來 */
  background: #f2e6dc; 
  padding: 16px; /* 增加內距 */
}

.cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 卡片之間的距離 */
}

/* 卡片本體 */
.rental-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden; /* 讓圖片圓角不破版 */
  box-shadow: 0 2px 6px rgba(0,0,0,0.06); /* 基礎陰影 */
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent; /* 預留邊框位置 */
}

/* 滑鼠移過的效果 */
.rental-card:hover {
  transform: translateY(-3px); /* 微微浮起 */
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

/* 選中狀態 */
.rental-card.active {
  border-color: #a18c7b; /* 咖啡色邊框 */
  background: #fffdf9;
}

/* 卡片圖片區 */
.card-image {
  width: 120px; /* 固定寬度 */
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.placeholder-emoji { font-size: 32px; }

/* 左上角標籤 */
.card-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 卡片內容區 */
.card-content {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #2e2622;
  margin: 0 0 6px;
  line-height: 1.3;
}

.card-details {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.card-bottom {
  display: flex;
  align-items: baseline;
  justify-content: flex-end; /* 價格靠右 */
}

.card-price {
  font-size: 18px;
  font-weight: 700;
  color: #a18c7b;
}

.price-unit {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 2px;
}

/* 右側地圖區容器 */
.map-panel {
  flex: 1;
  position: relative;
  /* 背景改成很淺的暖色，襯托地圖 */
  background: #fdfaf6; 
  /* 增加內距，讓地圖跟周圍有呼吸空間 */
  padding: 24px; 
}

/* 地圖本體 */
.map-canvas {
  width: 100%;
  height: 100%;
  
  /* ✨ 1. 圓角 */
  border-radius: 20px; 
  
  /* ✨ 2. 邊框重點：加粗成 4px，使用您的主題咖啡色 */
  border: 4px solid #a18c7b; 
  
  /* ✨ 3. 雙層邊框效果 (選用)：加上白色內框，讓它更有層次 */
  outline: 6px solid rgba(255, 255, 255, 0.8);
  outline-offset: -10px; /* 讓白色線條往內縮 */

  /* ✨ 4. 陰影：加強立體感 */
  box-shadow: 0 10px 30px rgba(74, 44, 33, 0.15);
  
  overflow: hidden;
}

/* 手機版 RWD 調整 */
@media (max-width: 768px) {
  .map-panel {
    padding: 0; /* 手機版拿掉留白 */
  }
  
  .map-canvas {
    border-radius: 0;
    border: none;
    border-top: 4px solid #a18c7b; /* 手機版只留上方邊框 */
    box-shadow: none;
    outline: none;
  }
}

.api-warning {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ef4444;
}

/* RWD: 手機版 */
@media (max-width: 768px) {
  .content-layout {
    flex-direction: column-reverse;
  }
  .map-panel {
    flex: 1;
    padding: 0; /* 手機版地圖滿版 */
  }
  .map-canvas {
    border-radius: 0;
    border: none;
    border-top: 1px solid #d1c7bf;
  }
  .list-panel {
    width: 100%;
    height: 45%;
    padding: 12px; /* 手機版內距小一點 */
  }
}
</style>