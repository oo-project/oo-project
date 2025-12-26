<template>
  <div class="favorites-page">
    <h2 class="section-title">我的收藏</h2>
    <p class="section-subtitle">這裡顯示您收藏的房源。</p>
    
    <div v-if="loading" class="loading-state">載入收藏中...</div>

    <div v-else-if="favorites.length === 0" class="empty-state">
      <p>您目前還沒有收藏任何房源喔！🏠</p>
      <router-link to="/TenantHome/browse" class="go-btn">去逛逛房源</router-link>
    </div>

    <div v-else class="listing-grid">
       <article v-for="item in favorites" :key="item.id" class="listing-card">
          <div class="img-container" v-if="item.images && item.images.length > 0">
             <img :src="item.images[0]" alt="房源圖片" class="cover-img">
          </div>
          <div class="card-content">
             <div class="listing-header">
                <h3 class="listing-title">{{ item.title }}</h3>
                <button class="favorite-btn active" @click="handleRemove(item)">
                  ♥ 已收藏
                </button>
             </div>
             <p class="listing-price">{{ item.price }} 元/月</p>
             <p class="listing-addr">{{ item.city }}{{ item.district }}</p>
             <div class="listing-footer">
                <button class="secondary-btn" @click="goToDetail(item.id)">查看詳情</button>
             </div>
          </div>
       </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()
const favorites = ref([])
const loading = ref(true)

// 1. 取得當前使用者
const getCurrentUserId = () => {
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return null
  const user = JSON.parse(userStr)
  // ✨ 修改這裡：因為你的資料表沒有 uid，我們改抓 id (Firestore Document ID)
  // 為了保險，我們寫成 user.id || user.uid，看後端回傳哪個欄位
  return user.id || user.uid
}

const userId = getCurrentUserId()

const fetchFavorites = async () => {
  if (!userId) {
    alert('請先登入')
    router.push('/login')
    return
  }

  try {
    loading.value = true
    // 把 userId 傳給後端 (後端雖然參數叫 uid，但我們傳 document ID 給它是一樣的意思)
    const res = await api.get(`/api/favorites?uid=${userId}`)
    if (res.data.success) {
      favorites.value = res.data.data
    }
  } catch (error) {
    console.error('載入失敗', error)
  } finally {
    loading.value = false
  }
}

const handleRemove = async (item) => {
  if (!confirm(`確定取消收藏「${item.title}」？`)) return

  try {
    await api.delete(`/api/favorites/${item.favDocId}`)
    favorites.value = favorites.value.filter(f => f.id !== item.id)
  } catch (error) {
    console.error('移除失敗', error)
    alert('操作失敗')
  }
}

const goToDetail = (id) => {
  router.push(`/rentals/${id}`)
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
/* 樣式保持不變 */
.favorites-page { max-width: 1000px; margin: 0 auto; padding: 20px; }
.section-title { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 8px; }
.section-subtitle { color: #666; margin-bottom: 24px; }
.loading-state, .empty-state { text-align: center; padding: 40px; color: #888; font-size: 16px; background: #f9f9f9; border-radius: 8px; }
.go-btn { display: inline-block; margin-top: 10px; color: #a18c7b; text-decoration: underline; }
.listing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.listing-card { border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden; background: #fff; transition: transform 0.2s; display: flex; flex-direction: column; }
.listing-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.img-container { height: 180px; overflow: hidden; background: #eee; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.card-content { padding: 16px; flex: 1; display: flex; flex-direction: column; }
.listing-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.listing-title { font-size: 18px; font-weight: bold; margin: 0; color: #333; line-height: 1.4; flex: 1; margin-right: 8px;}
.favorite-btn { border: none; background: none; cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 4px; transition: 0.2s; white-space: nowrap; }
.favorite-btn.active { background: #ffebeb; color: #ff4757; }
.favorite-btn:hover { background: #ffd1d1; }
.listing-price { font-size: 18px; color: #a18c7b; font-weight: bold; margin: 8px 0 4px; }
.listing-addr { font-size: 13px; color: #888; margin-bottom: 12px; }
.listing-footer { margin-top: auto; text-align: right; }
.secondary-btn { background: #fff; border: 1px solid #a18c7b; color: #a18c7b; padding: 6px 16px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.secondary-btn:hover { background: #a18c7b; color: #fff; }
</style>