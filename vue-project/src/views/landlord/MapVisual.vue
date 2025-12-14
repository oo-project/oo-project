<template>
  <section class="panel">
    <h2 class="panel-title">地圖視覺</h2>
    <p class="panel-hint">
      已接上 Google Maps（示意），可根據租件座標顯示地標。
    </p>

    <div class="map-layout">
      <div class="map-box">
        <div id="landlord-map" class="map-canvas"></div>
      </div>

      <div class="map-side-list">
        <h3 class="sub-title">你的租件列表</h3>
        <ul class="map-list">
          <li
            v-for="item in rentals"
            :key="item.id"
            @click="focusOnRental(item)"
            class="map-list-item"
          >
            <span class="map-item-title">{{ item.title }}</span>
            <span class="map-item-sub">
              {{ item.area }} · {{ item.price.toLocaleString() }} 元/月
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref,shallowRef, onMounted } from 'vue'

// 因為沒有使用 Pinia，這裡放一份假資料供地圖使用
const rentals = ref([
  { id: 1, title: '雲科大旁溫馨套房', area: '雲科大周邊', price: 6500, lat: 23.7075, lng: 120.4305, roomType: '套房' },
  { id: 2, title: '斗六市區採光雅房', area: '斗六市區', price: 5500, lat: 23.707, lng: 120.429, roomType: '雅房' },
  { id: 3, title: '火車站附近電梯大樓套房', area: '火車站附近', price: 8000, lat: 23.709, lng: 120.4255, roomType: '套房' }
])

const map = shallowRef(null)
const markers = shallowRef([])

const initMap = () => {
  const el = document.getElementById('landlord-map')
  if (!el) return

  // 檢查 Google Maps API 是否載入
  if (!window.google || !window.google.maps) {
    console.warn('Google Maps API 未載入，地圖無法顯示。')
    el.innerHTML = '<div style="padding:20px;text-align:center;color:#666;">Google Maps API 未載入 (請確認 index.html 有引入 script)</div>'
    return
  }

  map.value = new window.google.maps.Map(el, {
    center: { lat: 23.708, lng: 120.429 },
    zoom: 14,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: window.google.maps.ControlPosition.TOP_RIGHT
    }
  })

  updateMarkers()
}

const updateMarkers = () => {
  if (!map.value || !window.google) return

  markers.value.forEach(m => m.setMap(null))
  markers.value = []

  rentals.value.forEach(rental => {
    if (!rental.lat || !rental.lng) return
    const marker = new window.google.maps.Marker({
      position: { lat: rental.lat, lng: rental.lng },
      map: map.value,
      title: rental.title
    })

    const info = new window.google.maps.InfoWindow({
      content: `<div style="font-size:13px;"><b>${rental.title}</b><br>${rental.price}元</div>`
    })

    marker.addListener('click', () => info.open(map.value, marker))
    markers.value.push(marker)
  })
}

const focusOnRental = (rental) => {
  if (!map.value) return
  map.value.panTo({ lat: rental.lat, lng: rental.lng })
  map.value.setZoom(16)
}

// ✨ 重點：使用 onMounted，只要一進入這個分頁就會初始化地圖
onMounted(() => {
  initMap()
})
</script>

<style scoped>
.map-layout { margin-top: 12px; display: flex; flex-direction: column; gap: 12px; }
.map-box { border-radius: 16px; padding: 0; background: #fef3c7; border: 1px solid #facc15; height: 400px; }
.map-canvas { width: 100%; height: 100%; border-radius: 14px; }
.map-side-list { border-radius: 16px; padding: 10px 12px; background: #fefbf7; border: 1px solid #e1d4c8; }
.map-list { list-style: none; padding: 0; margin: 6px 0 0; }
.map-list li { padding: 4px 0; border-bottom: 1px dashed #e5e7eb; cursor: pointer; }
.map-list li:hover { background-color: #f3f4f6; }
.map-item-title { display: block; font-size: 13px; color: #2e2622; font-weight: 600; }
.map-item-sub { display: block; font-size: 12px; color: #6b7280; }
.sub-title { font-size: 16px; font-weight: 600; color: #2e2622; }

/* 共用樣式 */
.panel { max-width: 1100px; margin: 0 auto; background: #fffdf9; border-radius: 16px; padding: 16px 18px 18px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); border: 1px solid rgba(242, 230, 220, 0.9); }
.panel-title { font-size: 20px; font-weight: 600; color: #2e2622; }
.panel-hint { font-size: 13px; color: #6b7280; margin-top: 4px; }
</style>