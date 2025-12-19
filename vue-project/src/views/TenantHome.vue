<template>
  <div class="tenant-page">
    <header class="top-bar">
      <button class="menu-btn" @click="toggleMenu">
        <span class="menu-icon">☰</span>
      </button>

      <div class="logo-area">
        <span class="logo-icon">🏡</span>
        <span class="logo-text">CocoRoom</span>
      </div>

      <div class="header-placeholder"></div>
    </header>

    <transition name="slide">
      <nav v-if="isMenuOpen" class="side-drawer">
        <div class="drawer-header">
          <div class="avatar-circle">
            {{ tenantName.charAt(0).toUpperCase() }}
          </div>
          <p class="drawer-username">嗨，{{ tenantName }}</p>
          <button class="close-btn" @click="toggleMenu">✕</button>
        </div>

        <div class="drawer-links">
          <router-link to="/TenantHome/browse" class="drawer-item" @click="toggleMenu">
            <span class="icon">🔍</span> 找房去
          </router-link>
          <router-link to="/TenantHome/favorites" class="drawer-item" @click="toggleMenu">
            <span class="icon">❤️</span> 我的收藏
          </router-link>
          <router-link to="/TenantHome/reservations" class="drawer-item" @click="toggleMenu">
            <span class="icon">📅</span> 看房預約
          </router-link>
          <router-link to="/TenantHome/contracts" class="drawer-item" @click="toggleMenu">
            <span class="icon">✍️</span> 租約簽訂
          </router-link>
          <router-link to="/TenantHome/profile" class="drawer-item" @click="toggleMenu">
            <span class="icon">👤</span> 個人資料
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
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tenantName = ref('User')

// 控制選單開關
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = () => {
  if (confirm('確定要登出嗎？')) {
    // 1. 清除 localStorage
    localStorage.removeItem('currentUser')
    
    // 2. 跳回登入頁
    router.push('/Login')
  }
}
</script>

<style scoped>
.tenant-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2e6dc;
  font-family: "Iansui", sans-serif;
  /* 防止側邊選單打開時背景滾動 (簡單處理) */
  overflow-x: hidden; 
}

/* --- App Header --- */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右分散 */
  padding: 12px 16px;
  background: #4a2c21;
  color: #f2e6dc;
  position: sticky; /* 固定在頂部 */
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  width: 100%;
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

/* 佔位用，讓 Logo 視覺上置中 */
.header-placeholder { width: 32px; }

/* --- 側邊選單 (Drawer) --- */
.side-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px; /* 選單寬度 */
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

.drawer-links {
  flex: 1; /* 佔據中間剩餘空間 */
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
  border-left: 4px solid transparent; /* 預設左邊框透明 */
}

.drawer-item .icon {
  margin-right: 12px;
  font-size: 18px;
}

.drawer-item:hover {
  background: #fdf6ed;
}

/* 當前選中的頁面樣式 */
.router-link-active {
  background: #fdf6ed;
  color: #a18c7b;
  border-left-color: #a18c7b; /* 亮起左邊框 */
  font-weight: 600;
}

.drawer-footer {
  padding: 20px;
  border-top: 1px solid #eee;
}

.drawer-logout {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #ef4444; /* 紅色文字 */
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  font-family: "Iansui", sans-serif;
  transition: 0.2s;
}

.drawer-logout:hover {
  background: #fef2f2;
}

/* --- 遮罩層 (Overlay) --- */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 90;
  backdrop-filter: blur(2px); /* 模糊背景效果 */
}

/* --- Vue Transition 動畫 --- */
/* 滑入滑出動畫 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%); /* 往左移出畫面 */
}

/* 淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 主內容 */
.main-container {
  flex: 1;
  padding: 16px 12px;
  width: 100%;
  box-sizing: border-box;
  /* 手機版通常邊距會小一點 */
}

</style>