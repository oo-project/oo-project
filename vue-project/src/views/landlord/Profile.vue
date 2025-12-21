<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2 class="section-title">房東個人專區</h2>
      <p class="panel-hint">在這裡管理您的顯示名稱、自我介紹與帳號安全。</p>

      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img 
            :src="profile.avatar || defaultAvatar" 
            class="avatar-preview" 
            alt="房東頭貼"
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
        <p class="hint-text">建議大小 500KB 以內</p>
      </div>

      <hr class="divider" />

      <div class="form-section">
        <h3 class="sub-title">基本資料</h3>
        
        <div class="input-group">
          <label>顯示名稱 (房客會看到的稱呼)</label>
          <input 
            v-model="profile.name" 
            type="text" 
            placeholder="例如：王先生、快樂房東" 
            class="custom-input"
          />
        </div>

        <div class="input-group">
          <label>自我介紹 (這會顯示在房客的「認識房東」視窗中)</label>
          <textarea 
            v-model="profile.bio" 
            rows="5" 
            placeholder="例如：您好，我是專職房東，平時喜歡園藝。我的房子都由我自己整理，希望能找到愛惜房子的租客..."
            class="custom-input textarea-resize"
          ></textarea>
        </div>

        <div class="input-group">
          <label>聯絡 Email</label>
          <input 
            v-model="profile.email" 
            type="email" 
            placeholder="請輸入 Email" 
            class="custom-input"
          />
        </div>

        <div class="input-group">
          <label>手機號碼 (帳號)</label>
          <input 
            v-model="profile.phone" 
            type="text" 
            class="custom-input readonly" 
            readonly
          />
        </div>
      </div>

      <hr class="divider" />

      <div class="form-section">
        <h3 class="sub-title">帳號安全</h3>
        <button class="action-link-btn" @click="goToChangePassword">
          🔑 修改密碼
        </button>
      </div>

      <div class="action-buttons">
        <button class="save-btn" @click="handleSave" :disabled="isSaving">
          {{ isSaving ? '儲存中...' : '儲存變更' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSaving = ref(false) // 儲存狀態
const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/236/236832.png'

const profile = ref({
  id: '',    // 新增 ID 欄位
  name: '',
  email: '',
  phone: '',
  avatar: '',
  bio: ''    // ✨ 新增 bio 欄位
})

onMounted(async () => {
  const userStr = localStorage.getItem('currentUser')
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      if (user.role !== 'landlord') {
        alert('身分錯誤')
        router.push('/Login')
        return
      }

      // 1. 先填入 LocalStorage 的基本資料 (讓畫面不空白)
      profile.value.id = user.id
      profile.value.name = user.name || ''
      profile.value.email = user.email || ''
      profile.value.phone = user.phone || ''
      profile.value.avatar = user.avatar || ''
      // LocalStorage 通常沒有存 bio，先給空值
      profile.value.bio = '' 

      // 2. ✨ 呼叫後端 API 取得最新的資料 (包含 bio)
      try {
        // 使用我們剛剛建立的 user API
        const res = await fetch(`http://localhost:3000/api/user/${user.id}`)
        const json = await res.json()
        
        if (json.success) {
          // 更新資料 (以資料庫為準)
          profile.value.name = json.data.name
          profile.value.bio = json.data.bio || '' // 取得自我介紹
          if (json.data.avatar) profile.value.avatar = json.data.avatar
        }
      } catch (apiError) {
        console.error('無法從後端取得最新資料', apiError)
      }

    } catch (e) {
      console.error('解析使用者資料失敗', e)
    }
  } else {
    router.push('/Login')
  }
})

// 📸 處理圖片上傳
const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const MAX_SIZE = 500 * 1024 // 500KB
  if (file.size > MAX_SIZE) {
    alert('圖片太大了！請選擇 500KB 以下的圖片。')
    return
  }

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = (e) => {
    profile.value.avatar = e.target.result
  }
}

// 💾 儲存資料
const handleSave = async () => {
  if (!profile.value.id) return
  isSaving.value = true

  const payload = {
    userId: profile.value.id,
    name: profile.value.name,
    email: profile.value.email,
    avatar: profile.value.avatar,
    bio: profile.value.bio // ✨ 傳送 bio
  }

  try {
    // ⚠️ 注意：這裡改成我們剛剛在後端建立的 API 路徑 /api/user/update
    const response = await fetch('http://localhost:3000/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success) {
      alert('✅ 房東資料已更新！')

      // 同步更新 LocalStorage (保持登入狀態的一致性)
      const userStr = localStorage.getItem('currentUser')
      if (userStr) {
        const user = JSON.parse(userStr)
        const updatedUser = {
          ...user,
          name: profile.value.name,
          email: profile.value.email,
          avatar: profile.value.avatar
          // LocalStorage 通常不存 bio 以免太肥，bio 靠 API 抓就好
        }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      }
      
    } else {
      alert('更新失敗：' + data.message)
    }

  } catch (error) {
    console.error('API Error:', error)
    alert('無法連線到伺服器')
  } finally {
    isSaving.value = false
  }
}

const goToChangePassword = () => {
  // 請確認您的路由是否正確設定了此路徑
  router.push('/LandlordHome/change-password') 
}
</script>

<style scoped>
/* 頁面容器 */
.profile-container {
  display: flex; justify-content: center; padding: 40px 20px;
}

/* 卡片樣式 */
.profile-card {
  width: 100%; max-width: 600px;
  background: #fffdf9; border-radius: 20px; padding: 32px;
  box-shadow: 0 10px 25px rgba(46, 38, 34, 0.08);
  border: 1px solid rgba(161, 140, 123, 0.2);
}

.section-title {
  text-align: center; font-size: 24px; color: #4a2c21; margin-bottom: 8px; font-weight: 700;
}
.panel-hint {
  text-align: center; font-size: 14px; color: #8b7e74; margin-bottom: 24px;
}

/* 📸 頭貼樣式 */
.avatar-section {
  display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 24px;
}
.avatar-wrapper {
  position: relative; width: 110px; height: 110px; border-radius: 50%;
  border: 3px solid #a18c7b; padding: 3px; background: white;
}
.avatar-preview {
  width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background-color: #f2e6dc;
}
.upload-btn {
  font-size: 14px; color: #4a2c21; border: 1px solid #d1c7bf; padding: 8px 16px;
  border-radius: 20px; cursor: pointer; background: white; transition: all 0.2s ease;
  font-weight: 600; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.upload-btn:hover { background: #f2e6dc; border-color: #a18c7b; transform: translateY(-1px); }
.hint-text { font-size: 12px; color: #9ca3af; }

.divider { border: none; border-top: 1px dashed #e5e7eb; margin: 24px 0; }

/* 表單區塊 */
.form-section { display: flex; flex-direction: column; gap: 16px; }
.sub-title {
  font-size: 18px; color: #2e2622; font-weight: 600; margin-bottom: 4px;
  border-left: 4px solid #a18c7b; padding-left: 10px;
}

.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-group label { font-size: 14px; color: #4a2c21; font-weight: 500; }

.custom-input {
  padding: 12px; border-radius: 8px; border: 1px solid #d1c7bf;
  font-size: 15px; outline: none; font-family: "Iansui", sans-serif;
  background: #fff; transition: 0.2s; width: 100%; box-sizing: border-box;
}
.custom-input:focus { border-color: #a18c7b; box-shadow: 0 0 0 3px rgba(161, 140, 123, 0.15); }
.custom-input.readonly { background: #f3f4f6; color: #6b7280; cursor: not-allowed; border-color: #e5e7eb; }

/* ✨ Textarea 專用樣式 */
.textarea-resize {
  resize: vertical; line-height: 1.6; min-height: 100px;
}

/* 按鈕區 */
.action-link-btn {
  width: 100%; text-align: left; background: white; border: 1px solid #e5e7eb;
  padding: 12px 16px; border-radius: 10px; color: #4b5563; font-size: 14px;
  cursor: pointer; transition: 0.2s; font-family: inherit;
}
.action-link-btn:hover { background: #f9fafb; border-color: #a18c7b; color: #a18c7b; }

.action-buttons { margin-top: 32px; }
.save-btn {
  width: 100%; padding: 14px; border-radius: 12px; border: none;
  background: #4a2c21; color: #fffdf9; font-size: 16px; font-weight: 600;
  cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 10px rgba(74, 44, 33, 0.2);
}
.save-btn:hover { background: #2e2622; transform: translateY(-1px); }
.save-btn:disabled { background: #9ca3af; cursor: not-allowed; }
</style>