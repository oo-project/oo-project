<template>
  <div class="tenant-page">
    <header class="top-bar">
      <button class="menu-btn" @click="toggleMenu">
        <span class="menu-icon">☰</span>
      </button>
      
      <div class="logo-area">
        <span class="logo-text">E動式神租派</span>
      </div>

      <div class="notification-wrapper">
        <div class="bell-container" @click="toggleNotif">
          <span class="bell-icon">🔔</span>
          <span v-if="pendingCount > 0" class="notif-badge">{{ pendingCount }}</span>
        </div>

        <transition name="fade">
          <div v-if="isNotifOpen" class="notif-dropdown">
            <div class="notif-header">
              <h4>通知專區</h4>
              <button class="close-dropdown" @click="isNotifOpen = false">✕</button>
            </div>
            <div class="notif-list">
              <div v-if="reminders.length === 0" class="notif-empty">
                目前沒有新的提醒事項
              </div>
              <div v-for="item in reminders" :key="item.id" class="notif-item">
                <div class="notif-content">
                  <p class="notif-title">{{ item.title }}</p>
                  <p class="notif-time">{{ formatTime(item.remindTime) }}</p>
                </div>
                <button class="done-btn" @click="markAsDone(item.id)" title="標記已完成">
                  ✓
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </header>

    <transition name="slide">
      <nav v-if="isMenuOpen" class="side-drawer">
        <div class="drawer-header">
          <div class="avatar-circle">
            <img v-if="tenantAvatar" :src="tenantAvatar" class="avatar-img" />
            <span v-else>{{ tenantName.charAt(0).toUpperCase() }}</span>
          </div>
          <p class="drawer-username">嗨，{{ tenantName }}</p>
          <button class="close-btn" @click="toggleMenu">✕</button>
        </div>
        <div class="drawer-links">
          <router-link to="/TenantHome/browse" class="drawer-item" @click="toggleMenu"><span class="icon">🔍</span> 列表找房</router-link>
          <router-link to="/TenantHome/map" class="drawer-item" @click="toggleMenu"><span class="icon">🗺️</span> 地圖找房</router-link>
          <router-link to="/TenantHome/favorites" class="drawer-item" @click="toggleMenu"><span class="icon">❤️</span> 我的收藏</router-link>
          <router-link to="/TenantHome/reservations" class="drawer-item" @click="toggleMenu"><span class="icon">📅</span> 看房預約</router-link>
          <router-link to="/TenantHome/contracts" class="drawer-item" @click="toggleMenu"><span class="icon">✍️</span> 租約簽訂</router-link>
          <router-link to="/TenantHome/living" class="drawer-item" @click="toggleMenu"><span class="icon">🏠</span> 我的租屋</router-link>
          <router-link to="/TenantHome/profile" class="drawer-item" @click="toggleMenu"><span class="icon">👤</span> 個人資料</router-link>
        </div>
        <div class="drawer-footer">
          <button class="drawer-logout" @click="handleLogout">登出帳號</button>
        </div>
      </nav>
    </transition>

    <transition name="fade">
      <div v-if="isMenuOpen" class="overlay" @click="toggleMenu"></div>
    </transition>

    <main class="main-container">
      <router-view />
    </main>

    <AiChatBot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/firebaseConfig' 
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import AiChatBot from '@/components/AiChatBot.vue'

const router = useRouter()
const tenantName = ref('User')
const tenantAvatar = ref('')
const isMenuOpen = ref(false)

// 通知狀態
const isNotifOpen = ref(false)
const reminders = ref([])
const pendingCount = computed(() => reminders.value.length)

// ✨ 用來存放取消監聽的函式
let unsubscribe = null

onMounted(() => {
  const userStr = localStorage.getItem('currentUser')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      tenantName.value = user.name
      
      // ✨ 啟動即時監聽 (onSnapshot)
      const q = query(
        collection(db, "reminders"), 
        where("status", "==", "pending"),
        where("userId", "==", user.uid || user.id)
      )

      unsubscribe = onSnapshot(q, (snapshot) => {
        reminders.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log("🔔 收到即時提醒更新:", reminders.value.length)
      }, (error) => {
        console.error("即時監聽失敗:", error)
      })

    } catch (e) {
      console.error(e)
    }
  }
})

// ✨ 當元件銷毀時，斷開連接節省效能
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value }
const toggleNotif = () => { isNotifOpen.value = !isNotifOpen.value }

const formatTime = (t) => {
  if (!t) return ''
  if (t.includes('T')) {
    const datePart = t.split('T')[0]
    const timePart = t.split('T')[1]
    return `${datePart.slice(4,6)}/${datePart.slice(6,8)} ${timePart.slice(0,2)}:${timePart.slice(2,4)}`
  }
  return t
}

const markAsDone = async (id) => {
  try {
    const docRef = doc(db, "reminders", id)
    await updateDoc(docRef, { status: 'completed' })
    // 注意：因為有 onSnapshot，所以這裡不用手動 filter，列表會自動消失
  } catch (e) {
    console.error("更新失敗:", e)
  }
}

const handleLogout = () => {
  if (confirm('確定要登出嗎？')) {
    if (unsubscribe) unsubscribe() // 登出也要記得斷開監聽
    localStorage.removeItem('currentUser')
    router.push('/Login')
  }
}
</script>

<style scoped>
/* Style 部分維持原樣 */
.tenant-page { min-height: 100vh; display: flex; flex-direction: column; background: #f2e6dc; font-family: "Iansui", sans-serif; overflow-x: hidden; }
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: #4a2c21; color: #f2e6dc; position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 8px rgba(0,0,0,0.15); width: 100%; box-sizing: border-box; }
.menu-btn { background: transparent; border: none; color: #f2e6dc; font-size: 24px; cursor: pointer; padding: 4px; }
.logo-area { display: flex; align-items: center; gap: 6px; flex: 1; margin-left: 10px; }
.logo-text { font-size: 18px; font-weight: 600; letter-spacing: 1px; }
.notification-wrapper { position: relative; display: flex; align-items: center; }
.bell-container { font-size: 22px; cursor: pointer; position: relative; padding: 4px; }
.notif-badge { position: absolute; top: 0; right: 0; background: #ef4444; color: white; font-size: 10px; min-width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #4a2c21; font-weight: bold; }
.notif-dropdown { position: absolute; top: 45px; right: -5px; width: 280px; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 100; color: #333; overflow: hidden; }
.notif-header { background: #fdf6ed; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
.notif-header h4 { margin: 0; font-size: 15px; color: #4a2c21; }
.close-dropdown { background: transparent; border: none; color: #999; cursor: pointer; font-size: 16px; }
.notif-list { max-height: 320px; overflow-y: auto; }
.notif-empty { padding: 40px 20px; text-align: center; color: #999; font-size: 14px; }
.notif-item { padding: 12px 16px; border-bottom: 1px solid #f5f5f5; display: flex; justify-content: space-between; align-items: center; }
.notif-title { margin: 0; font-size: 14px; font-weight: 600; color: #4a2c21; }
.notif-time { margin: 2px 0 0; font-size: 12px; color: #888; }
.done-btn { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #eee; background: white; color: #10b981; cursor: pointer; transition: 0.2s; }
.done-btn:hover { background: #10b981; color: white; }
.side-drawer { position: fixed; top: 0; left: 0; width: 280px; height: 100vh; background: #fffdf9; z-index: 100; display: flex; flex-direction: column; box-shadow: 4px 0 15px rgba(0,0,0,0.1); }
.drawer-header { background: #4a2c21; color: #f2e6dc; padding: 30px 20px; display: flex; align-items: center; gap: 12px; position: relative; }
.avatar-circle { width: 48px; height: 48px; border-radius: 50%; background: #f2e6dc; color: #4a2c21; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; overflow: hidden; border: 2px solid rgba(255,255,255,0.2); }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.drawer-username { font-size: 18px; font-weight: 600; }
.close-btn { position: absolute; top: 10px; right: 10px; background: transparent; border: none; color: rgba(255,255,255,0.6); font-size: 20px; cursor: pointer; }
.drawer-links { flex: 1; padding: 10px 0; display: flex; flex-direction: column; }
.drawer-item { display: flex; align-items: center; padding: 16px 24px; color: #4a2c21; text-decoration: none; font-size: 16px; transition: 0.2s; border-left: 4px solid transparent; }
.drawer-item .icon { margin-right: 12px; font-size: 18px; }
.drawer-item:hover { background: #fdf6ed; }
.router-link-active { background: #fdf6ed; color: #a18c7b; border-left-color: #a18c7b; font-weight: 600; }
.drawer-footer { padding: 20px; border-top: 1px solid #eee; }
.drawer-logout { width: 100%; padding: 12px; border: 1px solid #e5e7eb; background: #fff; color: #ef4444; border-radius: 8px; font-size: 15px; cursor: pointer; transition: 0.2s; }
.drawer-logout:hover { background: #fef2f2; }
.overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 90; backdrop-filter: blur(2px); }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.main-container { flex: 1; padding: 16px 12px; width: 100%; box-sizing: border-box; }
</style>