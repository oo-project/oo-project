<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2 class="section-title">我的資料</h2>

      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img 
            :src="profile.avatar || defaultAvatar" 
            class="avatar-preview" 
            alt="使用者頭貼"
          />
        </div>
        
        <label class="upload-btn">
          📷 更換頭貼
          <input 
            type="file" 
            accept="image/*" 
            @change="handleFileChange" 
            style="display: none;" 
          />
        </label>
        <p class="hint-text">支援 jpg/png，建議大小 500KB 以內</p>
      </div>

      <hr class="divider" />

      <ProfileInfo 
        v-model:name="profile.name"
        :email="profile.email"
      />

      <hr class="divider" />

      <div class="form-section">
        <h3 class="sub-title">帳號安全</h3>
        <button class="action-link-btn" @click="goToChangePassword">
          🔑 修改密碼
        </button>
      </div>

      <hr class="divider" />

      <div class="form-section">
        <h3 class="sub-title">我的收藏</h3>
        <p class="hint">您目前收藏了 {{ favoriteCount }} 個房源。</p>
        <button class="favorite-link-btn" @click="goToFavorites">
          ❤️ 前往查看我的收藏清單
        </button>
      </div>

      <div class="action-buttons">
        <button class="save-btn" @click="handleSave">儲存所有變更</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 請確認此路徑是否正確指向您的 ProfileInfo 組件
import ProfileInfo from './components/ProfileInfo.vue'

const router = useRouter()

// 預設頭貼 (如果使用者沒設頭貼，就顯示這張)
const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/847/847969.png'

const profile = ref({
  name: '',
  email: '',
  avatar: '' // 儲存 Base64 圖片字串
})

const favoriteCount = ref(0)

// 🟢 初始化：從 localStorage 讀取目前使用者資料
onMounted(() => {
  const userStr = localStorage.getItem('currentUser')
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      profile.value.name = user.name || ''
      profile.value.email = user.email || user.phone || '' // 如果沒有 email 就顯示電話
      profile.value.avatar = user.avatar || ''             // 讀取已儲存的頭貼
    } catch (e) {
      console.error('解析使用者資料失敗', e)
    }
  } else {
    // 如果沒有登入資料，踢回登入頁
    alert('請先登入')
    router.push('/Login')
  }
})

// 📸 處理圖片選擇與轉檔
const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 限制檔案大小 (500KB = 500 * 1024 bytes)
  // 因為 Firestore 存太大字串會變很慢，且有 1MB 限制
  const MAX_SIZE = 500 * 1024 
  if (file.size > MAX_SIZE) {
    alert('圖片檔案太大囉！請選擇 500KB 以下的圖片。')
    return
  }

  // 使用 FileReader 將圖片轉為 Base64 字串
  const reader = new FileReader()
  reader.readAsDataURL(file)
  
  reader.onload = (e) => {
    // 讀取完成，把結果 (很長的字串) 存入變數，畫面會自動更新預覽
    profile.value.avatar = e.target.result
  }
  
  reader.onerror = () => {
    alert('讀取圖片失敗，請重試')
  }
}

// 💾 儲存資料到後端
const handleSave = async () => {
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return

  const user = JSON.parse(userStr)

  // 準備傳送給後端的資料包
  const payload = {
    userId: user.id,
    role: user.role,
    name: profile.value.name,
    email: profile.value.email,
    avatar: profile.value.avatar // 包含圖片字串
  }

  try {
    const response = await fetch('https://oo-project.zeabur.app/api/update-profile', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success) {
      alert('✅ 資料與頭貼已成功更新！')

      // ✨ 重要：同步更新 localStorage，這樣重新整理網頁後資料才不會變回舊的
      user.name = profile.value.name
      user.email = profile.value.email
      user.avatar = profile.value.avatar
      localStorage.setItem('currentUser', JSON.stringify(user))
      
    } else {
      alert('更新失敗：' + data.message)
    }

  } catch (error) {
    console.error('API Error:', error)
    alert('無法連線到伺服器。若有上傳圖片，請確認後端已設定 body-parser limit。')
  }
}

// 導航功能
const goToChangePassword = () => {
  router.push('/TenantHome/change-password')
}

const goToFavorites = () => {
  router.push('/TenantHome/favorites')
}
</script>

<style scoped>
/* 頁面容器 */
.profile-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  /* background: #fcfcfc; */
}

/* 卡片樣式 */
.profile-card {
  width: 100%;
  max-width: 500px;
  background: #fffdf9;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(46, 38, 34, 0.08);
  border: 1px solid rgba(161, 140, 123, 0.2);
}

.section-title {
  text-align: center;
  font-size: 24px;
  color: #4a2c21;
  margin-bottom: 24px;
  font-weight: 700;
}

/* 📸 頭貼樣式 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid #a18c7b;
  padding: 3px; /* 創造雙圈效果 */
  background: white;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f2e6dc;
}

.upload-btn {
  font-size: 14px;
  color: #4a2c21;
  border: 1px solid #d1c7bf;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  background: white;
  transition: all 0.2s ease;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.upload-btn:hover {
  background: #f2e6dc;
  border-color: #a18c7b;
  transform: translateY(-1px);
}

.hint-text {
  font-size: 12px;
  color: #9ca3af;
}

/* 分隔線 */
.divider {
  border: none;
  border-top: 1px dashed #e5e7eb;
  margin: 24px 0;
}

/* 子標題 */
.sub-title {
  font-size: 16px;
  color: #2e2622;
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background: #a18c7b;
  border-radius: 2px;
}

/* 連結按鈕樣式 */
.action-link-btn, .favorite-link-btn {
  width: 100%;
  text-align: left;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 12px 16px;
  border-radius: 10px;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
}

.action-link-btn:hover, .favorite-link-btn:hover {
  background: #f9fafb;
  border-color: #a18c7b;
  color: #a18c7b;
}

.hint {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

/* 儲存按鈕 */
.action-buttons {
  margin-top: 32px;
}

.save-btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: #4a2c21;
  color: #fffdf9;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 4px 10px rgba(74, 44, 33, 0.2);
}

.save-btn:hover {
  background: #2e2622;
  transform: translateY(-1px);
}

.save-btn:active {
  transform: translateY(0);
}
</style>