<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">租件管理</h2>
        <p class="panel-hint">管理您的所有房源，可隨時編輯或上下架。</p>
      </div>
      <button class="primary-btn" @click="goToAddRental">
        ＋ 新增租件
      </button>
    </div>

    <div class="card-list">
      
      <div v-if="rentals.length === 0" class="empty-state">
        <span class="empty-icon">📂</span>
        <p>目前沒有租件，快去新增第一筆吧！</p>
      </div>

      <article v-for="item in rentals" :key="item.id" class="rental-card">
        
        <div class="card-left">
          <img 
            :src="item.images && item.images.length > 0 ? item.images[0] : defaultImage" 
            alt="房源縮圖" 
            class="rental-img"
          />
          <span class="status-tag" :class="item.isPublished ? 'active' : 'draft'">
            {{ item.isPublished ? '上架中' : '草稿' }}
          </span>
        </div>

        <div class="card-right">
          
          <div class="info-header">
            <h3 class="rental-title">{{ item.title }}</h3>
            <span class="rental-price">$ {{ Number(item.price).toLocaleString() }} <small>/月</small></span>
          </div>

          <div class="info-body">
             <p class="rental-detail">
               <span class="icon">📍</span> {{ item.address }}
             </p>
             <p class="rental-meta">
               {{ item.type }} · {{ item.roomType || '不限' }} · {{ item.area }} 坪 · {{ item.floor }}F
             </p>
          </div>

          <div class="info-footer">
            <button class="action-btn edit" @click="editRental(item.id)">
              ✏️ 編輯資料
            </button>
            <button class="action-btn delete" @click="deleteRental(item.id)">
              🗑️ 下架刪除
            </button>
          </div>

        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
// Script 部分維持原樣，不需要更動
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const defaultImage = 'https://cdn-icons-png.flaticon.com/512/609/609803.png'
const rentals = ref([])

onMounted(async () => {
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) { alert('請先登入'); router.push('/Login'); return; }
  const user = JSON.parse(userStr)

  try {
    const res = await fetch(`https://oo-project.zeabur.app/api/rentals/list?landlordId=${user.id}`)
    const json = await res.json()
    if (json.success) rentals.value = json.data
  } catch (e) { console.error(e) }
})

const goToAddRental = () => router.push('/LandlordHome/rent/new')
const editRental = (id) => router.push(`/LandlordHome/rent/edit/${id}`)
const deleteRental = async (id) => {
  if (!confirm('確定要刪除？')) return
  try {
    const res = await fetch('https://oo-project.zeabur.app/api/rentals/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const json = await res.json()
    if (json.success) {
      rentals.value = rentals.value.filter(r => r.id !== id)
      alert('已刪除')
    }
  } catch(e) { alert('錯誤') }
}
</script>

<style scoped>
.panel {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Iansui", sans-serif;
}

.panel-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
}
.panel-title { font-size: 24px; font-weight: 700; color: #4a2c21; }
.panel-hint { font-size: 14px; color: #6b7280; margin-top: 4px; }
.primary-btn {
  background: #4a2c21; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; transition: 0.2s;
}
.primary-btn:hover { background: #2e2622; }

/* 列表容器 */
.card-list { display: flex; flex-direction: column; gap: 20px; }

/* ✨ 卡片本體 (橫向 Flex) */
.rental-card {
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
  height: 200px; /* 固定高度讓排版整齊 */
}

.rental-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  border-color: #d1c7bf;
}

/* --- 左側：圖片區 (固定寬度 260px) --- */
.card-left {
  width: 260px;
  position: relative;
  background: #f3f4f6;
  flex-shrink: 0; /* 防止被壓縮 */
}

.rental-img {
  width: 100%; height: 100%; object-fit: cover;
}

.status-tag {
  position: absolute; top: 12px; left: 12px;
  padding: 6px 12px; border-radius: 6px;
  color: white; font-size: 13px; font-weight: 600;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.status-tag.active { background: #22c55e; }
.status-tag.draft { background: #6b7280; }

/* --- 右側：內容區 (Flex Column) --- */
.card-right {
  flex: 1; /* 佔滿剩餘寬度 */
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 內容上下撐開，按鈕在最底 */
}

/* 標題列 */
.info-header {
  display: flex; justify-content: space-between; align-items: flex-start;
}
.rental-title {
  font-size: 20px; font-weight: 700; color: #1f2937; margin: 0;
  /* 超出兩行顯示省略號 */
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.rental-price {
  font-size: 20px; font-weight: 700; color: #a18c7b; white-space: nowrap; margin-left: 16px;
}
.rental-price small { font-size: 14px; color: #9ca3af; font-weight: 400; }

/* 詳細資訊 */
.info-body { margin-top: 8px; color: #6b7280; }
.rental-detail { font-size: 15px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
.rental-meta { font-size: 14px; color: #9ca3af; background: #f9fafb; display: inline-block; padding: 4px 8px; border-radius: 4px; }

/* 底部按鈕區 */
.info-footer {
  display: flex; justify-content: flex-end; gap: 12px; margin-top: auto; /* auto 把按鈕推到底部 */
}

.action-btn {
  padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: 0.2s;
}
.action-btn.edit {
  background: #fdf6ed; color: #a18c7b; border-color: #f2e6dc;
}
.action-btn.edit:hover { background: #fcebd9; }

.action-btn.delete {
  background: white; color: #ef4444; border-color: #fee2e2;
}
.action-btn.delete:hover { background: #fef2f2; border-color: #fca5a5; }

/* ✨✨✨ 重點修改：手機版 RWD 設定 ✨✨✨ */
@media (max-width: 768px) {
  .panel { padding: 12px; }
  .card-list { gap: 12px; }

  /* 1. 維持橫向排列 (Row)，不要變直式 */
  .rental-card {
    flex-direction: row; 
    height: auto; /* 高度自動，依內容撐開 */
    min-height: 130px; /* 設定最小高度 */
  }

  /* 2. 縮小左側圖片寬度 */
  .card-left {
    width: 110px; /* 手機版圖片變窄 */
    height: auto;
  }
  
  /* 縮小圖片上的標籤 */
  .status-tag {
    top: 6px; left: 6px;
    padding: 2px 6px;
    font-size: 10px;
  }

  /* 3. 調整右側內距與字體 */
  .card-right {
    padding: 10px 12px; /* 縮小內距 */
  }

  .rental-title {
    font-size: 16px; /* 標題變小 */
    margin-bottom: 4px;
    -webkit-line-clamp: 1; /* 手機版標題只顯示一行，避免太擠 */
  }

  .rental-price {
    font-size: 16px; 
    margin-left: 0;
    display: block; /* 價格換行顯示，或視情況調整 */
    margin-top: 2px;
  }

  .info-body { margin-top: 4px; }
  .rental-detail { font-size: 12px; margin-bottom: 2px; }
  .rental-meta { 
    font-size: 11px; padding: 2px 6px; 
    /* 手機版若資訊太多，可以選擇隱藏這行，或者只顯示部分 */
    display: block; 
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }

  /* 4. 按鈕變小，並改成上下堆疊或擠在一起 */
  .info-footer {
    margin-top: 8px;
    gap: 8px;
  }
  .action-btn {
    padding: 4px 10px;
    font-size: 12px;
  }
}
</style>
