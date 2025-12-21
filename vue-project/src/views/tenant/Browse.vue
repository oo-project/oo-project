<template>
  <div class="browse-container">
    
    <section class="control-panel">
      
      <div class="search-top">
        <div class="search-input-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="filters.keyword" 
            type="text" 
            placeholder="輸入區域、捷運或關鍵字..." 
          />
          <button class="clear-btn" v-if="filters.keyword" @click="filters.keyword=''">✕</button>
        </div>
        
        <button class="toggle-filter-btn" @click="showAdvanced = !showAdvanced" :class="{ active: showAdvanced }">
          <span class="icon">⚙️</span> 進階篩選
        </button>
      </div>

      <transition name="slide-fade">
        <div v-if="showAdvanced" class="advanced-options">
          
          <div class="filter-row">
            <div class="filter-group">
              <label>房屋類型</label>
              <div class="type-buttons">
                <button 
                  v-for="type in ['全部', '獨立套房', '分租套房', '雅房', '整層住家']"
                  :key="type"
                  class="type-btn"
                  :class="{ active: filters.type === (type === '全部' ? '' : type) }"
                  @click="filters.type = (type === '全部' ? '' : type)"
                >
                  {{ type }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <label>排序方式</label>
              <select v-model="filters.sortBy" class="custom-select">
                <option value="newest">📅 最新上架</option>
                <option value="price_asc">💰 價格：低 → 高</option>
                <option value="price_desc">💎 價格：高 → 低</option>
              </select>
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-group">
              <label>租金範圍 (元)</label>
              <div class="price-inputs">
                <input v-model.number="filters.minPrice" type="number" placeholder="最低" />
                <span class="divider">~</span>
                <input v-model.number="filters.maxPrice" type="number" placeholder="最高" />
              </div>
            </div>
            
            <div class="filter-group end">
              <button class="reset-btn" @click="resetFilters">↺ 清除條件</button>
            </div>
          </div>

        </div>
      </transition>

      <div class="result-count">
        共找到 <b>{{ filteredRentals.length }}</b> 筆房源
      </div>
    </section>

    <section class="rentals-list">
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div> 資料載入中...
      </div>

      <div v-else-if="filteredRentals.length === 0" class="empty-state">
        <span class="empty-icon">🧐</span>
        <p>沒有符合條件的房子，試著放寬篩選條件看看？</p>
        <button class="retry-btn" @click="resetFilters">顯示所有房源</button>
      </div>

      <article 
        v-for="item in filteredRentals" 
        :key="item.id" 
        class="rental-card"
        @click="goToDetail(item.id)"
      >
        <div class="card-left">
          <img 
            :src="item.images && item.images.length > 0 ? item.images[0] : defaultImage" 
            alt="房源照片" 
            class="rental-img"
          />
          <span class="type-tag">{{ item.type }}</span>
        </div>

        <div class="card-right">
          <div class="info-top">
            <h3 class="card-title">{{ item.title }}</h3>
            <div class="price-box">
              <span class="price-val">$ {{ Number(item.price).toLocaleString() }}</span>
              <span class="price-unit">/月</span>
            </div>
          </div>

          <div class="info-middle">
            <p class="address-row">📍 {{ item.address }}</p>
            <p class="meta-row">
              {{ item.area }} 坪 · {{ item.floor }}F · {{ item.roomType || '不限' }}
            </p>
          </div>
          
          <div class="info-bottom">
            <div class="amenities-row">
              <span v-for="(am, idx) in item.amenities.slice(0, 3)" :key="idx" class="mini-tag">
                {{ am }}
              </span>
              <span v-if="item.amenities.length > 3" class="mini-tag">+{{ item.amenities.length - 3 }}</span>
            </div>
          </div>
        </div>
      </article>

    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const rentals = ref([])
const loading = ref(true)
const defaultImage = 'https://cdn-icons-png.flaticon.com/512/609/609803.png'

// ✨ 控制進階選單顯示
const showAdvanced = ref(false)

// ✨ 整合所有的篩選條件
const filters = reactive({
  keyword: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'newest' // 預設最新
})

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/rentals/public')
    const json = await res.json()
    if (json.success) {
      rentals.value = json.data
    }
  } catch (e) {
    console.error('載入失敗', e)
  } finally {
    loading.value = false
  }
})

// ✨ 重設所有篩選
const resetFilters = () => {
  filters.keyword = ''
  filters.type = ''
  filters.minPrice = ''
  filters.maxPrice = ''
  filters.sortBy = 'newest'
}

// ✨✨✨ 核心篩選邏輯 ✨✨✨
const filteredRentals = computed(() => {
  // 1. 複製一份原始資料
  let result = [...rentals.value]

  // 2. 關鍵字過濾
  if (filters.keyword) {
    const k = filters.keyword.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(k) || 
      item.address.toLowerCase().includes(k)
    )
  }

  // 3. 房型過濾
  if (filters.type) {
    result = result.filter(item => item.type === filters.type)
  }

  // 4. 價格範圍過濾
  if (filters.minPrice) {
    result = result.filter(item => Number(item.price) >= Number(filters.minPrice))
  }
  if (filters.maxPrice) {
    result = result.filter(item => Number(item.price) <= Number(filters.maxPrice))
  }

  // 5. 排序邏輯
  if (filters.sortBy === 'price_asc') {
    result.sort((a, b) => Number(a.price) - Number(b.price)) // 便宜的在前面
  } else if (filters.sortBy === 'price_desc') {
    result.sort((a, b) => Number(b.price) - Number(a.price)) // 貴的在前面
  } else {
    // 預設 newest (假設後端有給 createdAt，字串比對即可，或是依陣列順序)
    // 這裡如果不確定 createdAt 格式，可以先不動，因為後端撈出來預設就是新的在前面
  }

  return result
})

const goToDetail = (id) => {
  router.push(`/TenantHome/rental/${id}`)
}
</script>

<style scoped>
.browse-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Iansui", sans-serif;
  padding-bottom: 80px;
}

/* --- 控制面板樣式 --- */
.control-panel {
  background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 24px; overflow: hidden;
}

.search-top {
  display: flex; gap: 12px; padding: 16px; align-items: center;
}
.search-input-box {
  flex: 1; display: flex; align-items: center; background: #f3f4f6;
  padding: 10px 16px; border-radius: 50px; border: 1px solid transparent; transition: 0.2s;
}
.search-input-box:focus-within { background: white; border-color: #a18c7b; box-shadow: 0 0 0 3px rgba(161, 140, 123, 0.1); }
.search-input-box input { border: none; background: transparent; width: 100%; margin-left: 8px; outline: none; font-size: 15px; }
.clear-btn { border: none; background: transparent; color: #999; cursor: pointer; font-size: 14px; }

.toggle-filter-btn {
  white-space: nowrap; padding: 10px 16px; border-radius: 50px; border: 1px solid #e5e7eb;
  background: white; cursor: pointer; font-weight: 600; color: #4b5563; transition: 0.2s; display: flex; align-items: center; gap: 6px;
}
.toggle-filter-btn:hover, .toggle-filter-btn.active { background: #fdf6ed; border-color: #a18c7b; color: #a18c7b; }

/* 進階選項區 */
.advanced-options {
  background: #fafafa; border-top: 1px solid #eee; padding: 20px;
}
.filter-row { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 16px; }
.filter-row:last-child { margin-bottom: 0; }

.filter-group { display: flex; flex-direction: column; gap: 8px; }
.filter-group label { font-size: 13px; font-weight: 600; color: #6b7280; }
.filter-group.end { margin-left: auto; justify-content: flex-end; }

/* 房型按鈕 */
.type-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.type-btn {
  padding: 6px 12px; border: 1px solid #d1c7bf; background: white; border-radius: 6px;
  cursor: pointer; font-size: 13px; color: #555; transition: 0.2s;
}
.type-btn.active { background: #a18c7b; color: white; border-color: #a18c7b; }

/* Select & Inputs */
.custom-select, .price-inputs input {
  padding: 8px 12px; border: 1px solid #d1c7bf; border-radius: 6px; outline: none; font-size: 14px; background: white;
}
.price-inputs { display: flex; align-items: center; gap: 8px; }
.price-inputs input { width: 100px; }
.divider { color: #888; }

.reset-btn {
  background: transparent; border: none; color: #ef4444; font-size: 14px; cursor: pointer; text-decoration: underline;
}

.result-count {
  padding: 10px 20px; background: #fffdf9; border-top: 1px solid #eee; font-size: 13px; color: #888; text-align: right;
}

/* 動畫 */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; max-height: 300px; opacity: 1; }
.slide-fade-enter-from, .slide-fade-leave-to { max-height: 0; opacity: 0; overflow: hidden; }

/* --- 列表與卡片樣式 (與上一版相同) --- */
.rentals-list { display: flex; flex-direction: column; gap: 16px; }
.loading-state, .empty-state { text-align: center; padding: 40px; color: #888; }
.retry-btn { margin-top: 12px; padding: 8px 16px; background: #4a2c21; color: white; border: none; border-radius: 6px; cursor: pointer; }

.rental-card {
  display: flex; background: white; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04); border: 1px solid #f0f0f0; cursor: pointer; height: 140px; transition: transform 0.2s;
}
.rental-card:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.08); }

.card-left { width: 150px; position: relative; background: #eee; flex-shrink: 0; }
.rental-img { width: 100%; height: 100%; object-fit: cover; }
.type-tag { position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.6); color: white; font-size: 11px; padding: 2px 6px; border-radius: 4px; }

.card-right { flex: 1; padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
.info-top { display: flex; justify-content: space-between; align-items: flex-start; }
.card-title { font-size: 16px; font-weight: 700; color: #2e2622; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; margin-right: 8px; }
.price-box { text-align: right; white-space: nowrap; }
.price-val { font-size: 18px; font-weight: 700; color: #a18c7b; }
.price-unit { font-size: 12px; color: #9ca3af; }
.info-middle { font-size: 13px; color: #6b7280; margin-top: 4px; }
.info-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.amenities-row { display: flex; gap: 4px; }
.mini-tag { font-size: 11px; background: #f3f4f6; color: #6b7280; padding: 2px 6px; border-radius: 4px; }

/* RWD */
@media (max-width: 768px) {
  .browse-container { padding: 12px; }
  .search-top { flex-wrap: wrap; }
  .toggle-filter-btn { width: 100%; justify-content: center; }
  .filter-row { gap: 16px; }
  .price-inputs input { width: 80px; }
  
  .rental-card { height: 120px; }
  .card-left { width: 110px; }
  .card-right { padding: 10px; }
  .card-title { font-size: 15px; -webkit-line-clamp: 1; }
  .price-val { font-size: 16px; }
}
</style>