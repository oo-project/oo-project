<template>
  <div class="tenant-page">
    <!-- Header -->
    <header class="top-bar">
      <button class="menu-btn" @click="toggleMenu">
        <span class="menu-icon">☰</span>
      </button>

      <div class="logo-area">
        <span class="logo-text">E動式神租牌</span>
        <span class="logo-text">房東後台</span>
      </div>

      <div class="header-placeholder"></div>
    </header>

    <transition name="slide">
      <nav v-if="isMenuOpen" class="side-drawer">
        <div class="drawer-header">
          <div class="avatar-circle">
            <img 
              v-if="landlordAvatar" 
              :src="landlordAvatar" 
              class="avatar-img" 
              alt="房東頭貼"
            />
            <span v-else>
              {{ landlordName.charAt(0).toUpperCase() }}
            </span>
          </div>

          <p class="drawer-username">房東，{{ landlordName }}</p>
          <button class="close-btn" @click="toggleMenu">✕</button>
        </div>

        <div class="drawer-links">
          <router-link to="/LandlordHome/rent" class="drawer-item" @click="toggleMenu">
            <span class="icon">🔑</span> 租件管理
          </router-link>
          <router-link to="/LandlordHome/lease" class="drawer-item" @click="toggleMenu">
            <span class="icon">📄</span> 租約管理
          </router-link>
          <router-link to="/LandlordHome/tenant" class="drawer-item" @click="toggleMenu">
            <span class="icon">👥</span> 房客管理
          </router-link>
          <router-link to="/LandlordHome/appointments" class="drawer-item" @click="toggleMenu">
            <span class="icon">📅</span> 預約管理
          </router-link>
          <router-link to="/LandlordHome/search" class="drawer-item" @click="toggleMenu">
            <span class="icon">🔍</span> 租屋搜尋
          </router-link>
          <!-- <router-link to="/LandlordHome/map" class="drawer-item" @click="toggleMenu">
            <span class="icon">🗺️</span> 地圖視覺
          </router-link> -->
          <router-link to="/LandlordHome/profile" class="drawer-item" @click="toggleMenu">
            <span class="icon">👤</span> 個人專區
          </router-link>
        </div>

        <div class="drawer-footer">
          <button class="drawer-logout" @click="handleLogout">
            登出帳號
          </button>
        </div>
      </nav>
    </transition>

    <transition name="fade">
      <div v-if="isMenuOpen" class="overlay" @click="toggleMenu"></div>
    </transition>

    <main class="main-container">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()

// 狀態變數
const landlordName = ref('房東')
const landlordAvatar = ref('')
const isMenuOpen = ref(false)

// 初始化：讀取 localStorage 資料
onMounted(() => {
  const userStr = localStorage.getItem('currentUser')
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      landlordName.value = user.name || '房東'
      landlordAvatar.value = user.avatar || ''
    } catch (e) {
      console.error('解析使用者資料失敗:', e)
    }
  }
})

// 選單控制
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 登出邏輯
const handleLogout = () => {
  if (confirm('確定要登出嗎？')) {
    localStorage.removeItem('currentUser')
    router.push('/Login')
  }
}
</script>

<style scoped>
/* 版面基礎設定 */
.landlord-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2e6dc;
  font-family: "Iansui", sans-serif;
  overflow-x: hidden; 
}

/* --- Top Bar --- */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #4a2c21;
  color: #f2e6dc;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  width: 100%;
  box-sizing: border-box;
}

.menu-btn {
  background: transparent;
  border: none;
  color: #f2e6dc;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 6px;
}
.logo-icon { font-size: 20px; }
.logo-text { font-size: 18px; font-weight: 600; letter-spacing: 1px; }

.header-placeholder { width: 32px; }

/* --- 側邊選單 (Drawer) --- */
.side-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: #fffdf9;
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 15px rgba(0,0,0,0.1);
}

.drawer-header {
  background: #4a2c21;
  color: #f2e6dc;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

/* 頭貼樣式 */
.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f2e6dc;
  color: #4a2c21;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  overflow: hidden; /* 裁切圖片 */
  border: 2px solid rgba(255,255,255,0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drawer-username {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 20px;
  cursor: pointer;
}

/* 連結列表 */
.drawer-links {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.drawer-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  color: #4a2c21;
  text-decoration: none;
  font-size: 16px;
  transition: 0.2s;
  border-left: 4px solid transparent;
}

.drawer-item .icon {
  margin-right: 12px;
  font-size: 18px;
}

.drawer-item:hover {
  background: #fdf6ed;
}

/* 當前頁面高亮樣式 */
.router-link-active {
  background: #fdf6ed;
  color: #a18c7b;
  border-left-color: #a18c7b;
  font-weight: 600;
}

/* 登出按鈕區 */
.drawer-footer {
  padding: 20px;
  border-top: 1px solid #eee;
}

.drawer-logout {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #ef4444;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  font-family: "Iansui", sans-serif;
  transition: 0.2s;
}

.drawer-logout:hover {
  background: #fef2f2;
}

/* --- 遮罩與動畫 --- */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 90;
  backdrop-filter: blur(2px);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- 主內容區 --- */
.main-container {
  flex: 1;
  padding: 16px 12px;
  width: 100%;
  box-sizing: border-box;
}
</style>
