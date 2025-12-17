<template>
  <div class="browse-layout">
    <button class="mobile-filter-toggle" @click="isFilterOpen = !isFilterOpen">
      {{ isFilterOpen ? '▲ 收起篩選條件' : '▼ 開啟篩選條件' }}
    </button>

    <section class="filters" :class="{ 'mobile-hidden': !isFilterOpen }">
      <h2 class="section-title">條件篩選</h2>

      <div class="filter-group">
        <label class="filter-label">關鍵字</label>
        <input v-model="filters.keyword" type="text" placeholder="輸入地點、房源名稱..." />
      </div>

      <div class="filter-group">
        <label class="filter-label">地區</label>
        <select v-model="filters.area">
          <option value="">不限</option>
          <option value="雲科大周邊">雲科大周邊</option>
          <option value="斗六市區">斗六市區</option>
          <option value="火車站附近">火車站附近</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">房型</label>
        <select v-model="filters.roomType">
          <option value="">不限</option>
          <option value="雅房">雅房</option>
          <option value="套房">套房</option>
          <option value="整層">整層</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">價格範圍</label>
        <select v-model="filters.priceRange">
          <option value="">不限</option>
          <option value="low">5000 以下</option>
          <option value="mid">5000 - 8000</option>
          <option value="high">8000 以上</option>
        </select>
      </div>

      <div class="filter-group">
        <span class="filter-label">設備需求</span>
        <label class="checkbox">
          <input type="checkbox" v-model="filters.withInternet" /> 有網路
        </label>
        <label class="checkbox">
          <input type="checkbox" v-model="filters.withWasher" /> 有洗衣機
        </label>
        <label class="checkbox">
          <input type="checkbox" v-model="filters.withAC" /> 有冷氣
        </label>
      </div>

      <button class="reset-btn" @click="resetFilters">清除條件</button>
    </section>

    <section class="listing-section">
      <h2 class="section-title">推薦房源 ({{ filteredListings.length }})</h2>
      
      <div class="listing-grid">
        <article v-for="house in filteredListings" :key="house.id" class="listing-card">
          <div class="listing-header">
            <h3 class="listing-title">{{ house.title }}</h3>
            <button class="favorite-btn" :class="{ active: isFavorite(house.id) }" @click="toggleFavorite(house.id)">
              {{ isFavorite(house.id) ? '♥' : '♡' }}
            </button>
          </div>

          <p class="listing-price">{{ house.price.toLocaleString() }} 元/月</p>
          <p class="listing-meta">
            {{ house.area }} · {{ house.roomType }} · 約 {{ house.distance }} 分
          </p>

          <div class="tags">
            <span v-for="tag in house.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <div class="listing-footer">
            <button class="secondary-btn" @click="showDetail(house)">詳情</button>
            <button class="primary-outline-btn" @click="contactLandlord(house)">聯絡</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// ✨ 控制手機版篩選區是否展開 (預設 false 收起)
const isFilterOpen = ref(false)
const router = useRouter()
// ... (以下資料和邏輯保持不變，不用動) ...
const listings = ref([
  { id: 1, title: '雲科大旁溫馨雅房', area: '雲科大周邊', price: 5500, roomType: '雅房', distance: 5, tags: ['含水費', '含網路', '有冷氣'], landlordName: '王先生', landlordPhone: '0912-345-678' },
  { id: 2, title: '斗六市區採光套房', area: '斗六市區', price: 7000, roomType: '套房', distance: 10, tags: ['獨立衛浴', '近公車站', '有洗衣機'], landlordName: '陳小姐', landlordPhone: '0987-111-222' },
  { id: 3, title: '火車站附近電梯大樓套房', area: '火車站附近', price: 8500, roomType: '套房', distance: 8, tags: ['電梯大樓', '可機車位', '含管理費'], landlordName: '林先生', landlordPhone: '0933-222-333' },
  { id: 4, title: '雲科大旁學生友善整層出租', area: '雲科大周邊', price: 12000, roomType: '整層', distance: 6, tags: ['適合多人合租', '可開伙', '近學餐'], landlordName: '張先生', landlordPhone: '0955-444-555' }
])

const favoriteIds = ref(new Set())
const filters = ref({ keyword: '', area: '', roomType: '', priceRange: '', withInternet: false, withWasher: false, withAC: false })

const isFavorite = (id) => favoriteIds.value.has(id)
const toggleFavorite = (id) => {
  const set = favoriteIds.value
  if (set.has(id)) set.delete(id)
  else set.add(id)
  favoriteIds.value = new Set(set)
}

const filteredListings = computed(() => {
  return listings.value.filter((house) => {
    if (filters.value.keyword) {
      const kw = filters.value.keyword.toLowerCase()
      const text = (house.title + house.area).toLowerCase()
      if (!text.includes(kw)) return false
    }
    if (filters.value.area && house.area !== filters.value.area) return false
    if (filters.value.roomType && house.roomType !== filters.value.roomType) return false
    if (filters.value.priceRange === 'low' && house.price >= 5000) return false
    if (filters.value.priceRange === 'mid' && (house.price < 5000 || house.price > 8000)) return false
    if (filters.value.priceRange === 'high' && house.price <= 8000) return false
    if (filters.value.withInternet && !house.tags.includes('含網路')) return false
    if (filters.value.withWasher && !house.tags.includes('有洗衣機')) return false
    if (filters.value.withAC && !house.tags.includes('有冷氣')) return false
    return true
  })
})

const resetFilters = () => {
  filters.value = { keyword: '', area: '', roomType: '', priceRange: '', withInternet: false, withWasher: false, withAC: false }
}
const showDetail = (house) =>{
  console.log(house.id)
  router.push({
    name: 'RentalDetail',
    params: { id: house.id }
  })
}
const contactLandlord = (house) => alert(`房東：${house.landlordName}`)
</script>

<style scoped>
/* --- 共用樣式 --- */
.browse-layout {
  display: grid;
  grid-template-columns: 270px 1fr; /* 電腦版：左側固定，右側自適應 */
  gap: 16px;
  align-items: start;
}

.mobile-filter-toggle {
  display: none; /* 電腦版隱藏這顆按鈕 */
}

/* 篩選區塊 */
.filters {
  background: #fffaf5;
  border-radius: 16px;
  padding: 16px;
  height: fit-content;
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12);
}

.section-title { font-size: 18px; font-weight: 600; color: #2e2622; margin-bottom: 10px; }
.filter-group { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
.filter-label { font-size: 13px; color: #4a2c21; }
.filters input[type="text"], .filters select { width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #d1c7bf; box-sizing: border-box; }
.checkbox { display: flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: 4px; }
.reset-btn { width: 100%; padding: 8px; border-radius: 999px; border: none; background: #e1d4c8; color: #4a2c21; cursor: pointer; }

/* 列表區塊 */
.listing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.listing-card { background: #fffdf9; border-radius: 12px; padding: 14px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); border: 1px solid rgba(242, 230, 220, 0.9); }
.listing-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
.listing-title { font-size: 16px; font-weight: 600; color: #2e2622; margin: 0; }
.listing-price { font-size: 18px; font-weight: 700; color: #a18c7b; margin: 4px 0; }
.listing-meta { font-size: 13px; color: #6b7280; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
.tag { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #f2e6dc; color: #4a2c21; }
.listing-footer { display: flex; gap: 8px; margin-top: 10px; }
.secondary-btn, .primary-outline-btn { flex: 1; padding: 6px 0; border-radius: 999px; font-size: 13px; cursor: pointer; }
.secondary-btn { border: none; background: #e1d4c8; color: #2e2622; }
.primary-outline-btn { border: 1px solid #a18c7b; background: transparent; color: #4a2c21; }
.favorite-btn { border: none; background: transparent; font-size: 16px; cursor: pointer; color: #a18c7b; }

/* --- 📱 手機版 RWD 設定 (寬度小於 768px 時生效) --- */
@media (max-width: 768px) {
  .browse-layout {
    display: flex;       /* 改成垂直排列 */
    flex-direction: column;
    gap: 10px;
  }

  /* 顯示切換按鈕 */
  .mobile-filter-toggle {
    display: block;
    width: 100%;
    padding: 10px;
    background: #4a2c21;
    color: #f2e6dc;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 10px;
  }

  /* 預設隱藏篩選區 (透過 class 控制) */
  .mobile-hidden {
    display: none;
  }

  /* 篩選區展開時的樣式 */
  .filters {
    width: 100%;       /* 滿寬 */
    box-sizing: border-box;
  }

  /* 調整列表 Grid 為一欄 */
  .listing-grid {
    display: grid;
    grid-template-columns: 1fr; /* 1fr 代表佔滿剩餘空間 */
    gap: 16px; /* 卡片之間的垂直間距 */
    width: 100%;
  }
  .listing-card {
    width: 100%;
    box-sizing: border-box;
    /* 如果覺得卡片圓角太大，可以在手機版稍微修小一點 */
    border-radius: 12px; 
  }
}
</style>