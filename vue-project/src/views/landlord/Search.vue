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
      <article
        v-for="item in filteredSearchListings"
        :key="item.id"
        class="card"
      >
        <div class="card-header">
          <div>
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-sub">
              {{ item.area }} · {{ item.roomType }} ·
              {{ item.price.toLocaleString() }} 元/月
            </p>
          </div>
          <button
            class="favorite-small"
            :class="{ active: landlordFavorites.has(item.id) }"
            @click="toggleFavorite(item.id)"
          >
            <span v-if="landlordFavorites.has(item.id)">♥ 收藏中</span>
            <span v-else>♡ 收藏</span>
          </button>
        </div>
        <p class="card-desc">{{ item.description }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchKeyword = ref('')
const searchListings = ref([
  { id: 101, title: '雲科大旁學生套房', area: '雲科大周邊', price: 6800, roomType: '套房', description: '市場上常見的學生套房範例。' },
  { id: 102, title: '斗六市區頂樓加蓋雅房', area: '斗六市區', price: 5200, roomType: '雅房', description: '競品參考用。' },
  { id: 103, title: '火車站旁電梯大樓套房', area: '火車站附近', price: 9000, roomType: '套房', description: '設備新穎，含管理費。' }
])

const landlordFavorites = ref(new Set())

const filteredSearchListings = computed(() => {
  if (!searchKeyword.value) return searchListings.value
  const kw = searchKeyword.value.toLowerCase()
  return searchListings.value.filter((item) => {
    return (item.title + item.area + item.description).toLowerCase().includes(kw)
  })
})

const toggleFavorite = (id) => {
  const set = landlordFavorites.value
  if (set.has(id)) set.delete(id)
  else set.add(id)
  landlordFavorites.value = new Set(set)
}
</script>

<style scoped>
/* 特有樣式 */
.search-bar { margin-top: 10px; margin-bottom: 8px; }
.search-bar input { width: 100%; padding: 8px 10px; border-radius: 999px; border: 1px solid #d1c7bf; font-size: 14px; outline: none; font-family: "Iansui", sans-serif; }
.search-bar input:focus { border-color: #a18c7b; box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4); }
.favorite-small { border: none; padding: 3px 8px; border-radius: 999px; font-size: 11px; cursor: pointer; background: #f2e6dc; color: #4a2c21; }
.favorite-small.active { background: #4a2c21; color: #f2e6dc; }

/* 共用樣式 */
.panel { max-width: 1100px; margin: 0 auto; background: #fffdf9; border-radius: 16px; padding: 16px 18px 18px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); border: 1px solid rgba(242, 230, 220, 0.9); }
.panel-title { font-size: 20px; font-weight: 600; color: #2e2622; }
.panel-hint { font-size: 13px; color: #6b7280; margin-top: 4px; }
.card-list { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
.card { padding: 10px 12px 10px; border-radius: 12px; background: #fefbf7; border: 1px solid #e1d4c8; box-shadow: 0 2px 8px rgba(46, 38, 34, 0.08); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.card-title { font-size: 16px; font-weight: 600; color: #2e2622; }
.card-sub { font-size: 13px; color: #6b7280; }
.card-desc { margin-top: 4px; font-size: 13px; color: #4b5563; }
</style>