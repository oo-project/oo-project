<template>
  <section class="panel">
    <div class="panel-header">
      <h2 class="panel-title">租件管理</h2>
      <button class="primary-btn" @click="openRentalModal">
        ＋ 新增租件
      </button>
    </div>
    <p class="panel-hint">在這裡可以刊登、修改、下架你的租件。</p>

    <div class="card-list">
      <article v-for="item in rentals" :key="item.id" class="card">
        <div class="card-header">
              <div>
                <h3 class="card-title">
                  {{ item.title }}
                  <span v-if="item.status === 'active'" class="status-badge active">上架中</span>
                  <span v-else class="status-badge inactive">已下架</span>
                </h3>
                <p class="card-sub">{{ item.area }} · {{ item.roomType }} · {{ item.price }} 元/月</p>
              </div>
         </div>
         <p class="card-desc">{{ item.description }}</p>
         <div class="card-actions">
             <button class="small-btn" @click="editRental(item)">編輯</button>
             <button class="small-btn danger" @click="deleteRental(item.id)">刪除</button>
         </div>
      </article>
    </div>

    <div v-if="showRentalModal" class="modal-backdrop">
       <div class="modal-card">
          <h2 class="modal-title">{{ editingRental ? '編輯租件' : '新增租件' }}</h2>
           <form class="modal-form" @submit.prevent="submitRentalForm">
               <div class="modal-buttons">
                  <button type="button" class="secondary-btn" @click="closeRentalModal">取消</button>
                  <button type="submit" class="btn-primary">儲存</button>
               </div>
           </form>
       </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

// 搬運原本關於 rentals 的資料與函式
const rentals = ref([
  { id: 1, title: '雲科大旁溫馨套房', area: '雲科大周邊', price: 6500, roomType: '套房', status: 'active', tags: [], description: '...' },
  // ...
])

const showRentalModal = ref(false)
const editingRental = ref(null)
const rentalForm = ref({ title: '', area: '', roomType: '', price: 0, description: '', tagsText: '' })

// 搬運 openRentalModal, editRental, submitRentalForm, deleteRental 等函式...
const openRentalModal = () => {
    showRentalModal.value = true
    editingRental.value = null
    // ...重置表單
}
const closeRentalModal = () => { showRentalModal.value = false }
const submitRentalForm = () => { /* ... */ showRentalModal.value = false }
const editRental = (item) => { /* ... */ showRentalModal.value = true }
const deleteRental = (id) => { /* ... */ }
</script>

<style scoped>
/* 搬運原本 .panel, .card, .btn 等相關的 CSS */
/* 建議將共用的 CSS (如 panel, btn) 放到 assets/main.css 全域引用，不然每個子頁面都要貼一次 */
.panel {
  max-width: 1100px;
  margin: 0 auto;
  background: #fffdf9;
  border-radius: 16px;
  padding: 16px 18px 18px;
  /* ... */
}
/* ... 其他樣式 ... */
</style>