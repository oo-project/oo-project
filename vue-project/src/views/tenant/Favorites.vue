<template>
  <div class="favorites-page">
    <h2 class="section-title">我的收藏</h2>
    <p class="section-subtitle">這裡顯示您收藏的房源（示意資料）。</p>
    
    <div class="listing-grid">
       <article class="listing-card">
          <div class="listing-header">
             <h3 class="listing-title">雲科大旁溫馨雅房</h3>
             <button class="favorite-btn active">♥ 已收藏</button>
          </div>
          <p class="listing-price">5,500 元/月</p>
          <div class="listing-footer">
             <button class="secondary-btn">查看詳情</button>
          </div>
       </article>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  max-width: 1000px;
  margin: 0 auto; /* 置中 */
}
/* 引用相同的 listing card 樣式 */
</style>