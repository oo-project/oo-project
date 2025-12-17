<template>
  <div class="landlord-page">
    <header class="top-bar">
      <div class="logo-area">
        <span class="logo-icon">🏠</span>
        <span class="logo-text">CocoRoom 房東後台</span>
      </div>

      <nav class="nav-links">
        <router-link to="/LandlordHome/rent" class="nav-btn">租件管理</router-link>
        <router-link to="/LandlordHome/lease" class="nav-btn">租約管理</router-link>
        <router-link to="/LandlordHome/tenant" class="nav-btn">房客管理</router-link>
        <router-link to="/LandlordHome/search" class="nav-btn">租屋搜尋</router-link>
        <router-link to="/LandlordHome/map" class="nav-btn">地圖視覺</router-link>
        <router-link to="/LandlordHome/profile" class="nav-btn">個人專區</router-link>
      </nav>

      <div class="user-area">
        <span class="user-name">房東 {{ landlordName }} 👋</span>
        <button class="logout-btn" @click="handleLogout">登出</button>
      </div>
    </header>

    <main class="content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const landlordName = ref('小房東') // 若要跨頁面共享這個名稱，建議之後用 Pinia

const handleLogout = () => {
  // 清除登入狀態邏輯...
  router.push('/Login')
}
</script>

<style scoped>
/* 只保留版面佈局的 CSS */
.landlord-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2e6dc;
  font-family: "Iansui", sans-serif;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #4a2c21;
  color: #f2e6dc;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-icon { font-size: 22px; }
.logo-text { font-size: 18px; font-weight: 600; }

.nav-links { display: flex; gap: 8px; }

/* ✨ router-link 的樣式 */
.nav-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: transparent;
  color: #f2e6dc;
  text-decoration: none; /* 移除底線 */
  font-size: 14px;
  transition: 0.2s ease;
}

.nav-btn:hover { background: rgba(242, 230, 220, 0.18); }

/* ✨ Vue Router 自動加上的 class，代表當前選中 */
.router-link-active {
  background: #f2e6dc;
  color: #4a2c21;
}

.user-area { display: flex; align-items: center; gap: 10px; font-size: 14px; }

.logout-btn {
  border: 1px solid #f2e6dc;
  background: transparent;
  color: #f2e6dc;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s ease;
}
.logout-btn:hover { background: #f2e6dc; color: #4a2c21; }

.content { padding: 18px 24px 24px; }
</style>