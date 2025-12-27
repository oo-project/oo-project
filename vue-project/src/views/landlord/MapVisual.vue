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
import { ref, shallowRef, onMounted } from 'vue'

const rentals = ref([])
const map = shallowRef(null)
const markers = shallowRef([])

const initMap = () => {
  const el = document.getElementById('landlord-map')
  if (!el) return

  if (!window.google || !window.google.maps) {
    el.innerHTML = '<div style="padding:20px;text-align:center;">Google Maps API 未載入</div>'
    return
  }

  map.value = new window.google.maps.Map(el, {
    center: { lat: 23.709, lng: 120.430 },
    zoom: 13,
    mapTypeControl: true,
  })
}

const fetchMyRentals = async () => {
  try {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) return
    const user = JSON.parse(userStr)
    console.log('👤 [Debug] 當前登入 ID:', user.id)

    const res = await fetch(`/api/rentals/list?landlordId=${user.id}`)
    const json = await res.json()

    if (json.success) {
      const allRentals = json.data
      console.log(`📦 [Debug] API 總共回傳了 ${allRentals.length} 筆資料`)
      
      if (allRentals.length > 0) {
        console.log('🔍 [Debug] 第一筆資料長這樣 (請檢查欄位名稱):', allRentals[0])
      }

      // 1. 檢查 ID 篩選
      const myRentals = allRentals.filter(item => {
        return String(item.landlordId) === String(user.id)
      })
      console.log(`bust [Debug] ID 符合的資料有: ${myRentals.length} 筆`)

      if (myRentals.length === 0 && allRentals.length > 0) {
         console.warn('⚠️ 警告：找不到您的租件！請檢查資料庫裡的 landlordId 是否跟上面的「當前登入 ID」一樣？')
      }

      // 2. 檢查座標篩選
      const validRentals = myRentals.filter(item => {
        const hasLat = item.lat !== undefined && item.lat !== null && item.lat !== ''
        const hasLng = item.lng !== undefined && item.lng !== null && item.lng !== ''
        if (!hasLat || !hasLng) {
            console.log(`❌ [剔除] 這筆資料缺少座標: ${item.title}`, item)
        }
        return hasLat && hasLng
      })

      console.log(`📍 [Debug] 最終有座標的資料: ${validRentals.length} 筆`)

      // 賦值
      rentals.value = validRentals.map(item => ({
        ...item,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lng),
        area: item.area || item.address
      }))

      updateMarkers()
    }
  } catch (error) {
    console.error('API Error:', error)
  }
}

const updateMarkers = () => {
  if (!map.value || !window.google) return

  // 清除舊標記
  markers.value.forEach(m => m.setMap(null))
  markers.value = []

  rentals.value.forEach(rental => {
    // 建立地標
    const marker = new window.google.maps.Marker({
      position: { lat: rental.lat, lng: rental.lng },
      map: map.value,
      title: rental.title,
      animation: window.google.maps.Animation.DROP
    })

    // 建立資訊視窗
    const info = new window.google.maps.InfoWindow({
      content: `<div style="padding:5px; color:#2e2622;"><b>${rental.title}</b><br>$${Number(rental.price).toLocaleString()}/月</div>`
    })

    marker.addListener('click', () => info.open(map.value, marker))
    markers.value.push(marker)
  })

  // 自動調整視野
  if (markers.value.length > 0) {
    const bounds = new window.google.maps.LatLngBounds()
    markers.value.forEach(m => bounds.extend(m.getPosition()))
    map.value.fitBounds(bounds)
  }
}

const focusOnRental = (rental) => {
  if (map.value && rental.lat && rental.lng) {
    map.value.panTo({ lat: rental.lat, lng: rental.lng })
    map.value.setZoom(16)
  }
}

onMounted(async () => {
  initMap()
  await fetchMyRentals()
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