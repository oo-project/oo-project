<template>
  <div class="page-container">
    <div class="card">
      <h2 class="title">修改密碼</h2>
      <p class="hint">為了保護您的帳號安全，請先輸入目前的舊密碼。</p>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>舊密碼</label>
          <input 
            v-model="form.oldPassword" 
            type="password" 
            placeholder="請輸入目前的密碼"
          />
        </div>

        <div class="form-group">
          <label>新密碼</label>
          <input 
            v-model="form.newPassword" 
            type="password" 
            placeholder="請輸入新密碼 (至少 6 碼)"
          />
        </div>

        <div class="form-group">
          <label>確認新密碼</label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="請再次輸入新密碼"
          />
        </div>

        <div class="button-group">
          <button type="button" class="cancel-btn" @click="goBack">
            取消
          </button>
          <button type="submit" class="save-btn">
            確認修改
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const goBack = () => {
  router.back()
}

const handleSubmit = async () => {
  // 1. 前端基本檢查
  if (!form.value.oldPassword || !form.value.newPassword || !form.value.confirmPassword) {
    alert('請填寫所有欄位')
    return
  }

  if (form.value.newPassword.length < 6) {
    alert('新密碼長度不足，請至少輸入 6 碼')
    return
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('兩次新密碼輸入不一致')
    return
  }

  if (form.value.newPassword === form.value.oldPassword) {
    alert('新密碼不能與舊密碼相同')
    return
  }

  // 2. 準備呼叫後端
  try {
    // 從 localStorage 取得目前使用者的 ID 和身分
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      alert('登入時效已過，請重新登入')
      router.push('/Login')
      return
    }
    const user = JSON.parse(userStr)

    // 發送請求
    const response = await fetch('https://oo-project.zeabur.app/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,       // 誰要改密碼
        role: user.role,       // 查哪張表
        oldPassword: form.value.oldPassword, // 傳舊密碼給後端檢查
        newPassword: form.value.newPassword  // 傳新密碼給後端寫入
      })
    })

    const data = await response.json()

    if (data.success) {
      alert('✅ 密碼修改成功！請重新登入。')
      
      // 清除登入狀態，強制使用者重新登入
      localStorage.removeItem('currentUser')
      router.push('/Login')
    } else {
      // 顯示後端回傳的錯誤 (例如：舊密碼錯誤)
      alert('修改失敗：' + data.message)
    }

  } catch (error) {
    console.error('API Error:', error)
    alert('伺服器連線錯誤，請稍後再試')
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.card {
  width: 100%;
  max-width: 400px;
  background: #fffdf9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12);
  border: 1px solid rgba(242, 230, 220, 0.9);
}

.title {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #2e2622;
  margin-bottom: 8px;
}

.hint {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

label {
  font-size: 14px;
  color: #4a2c21;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d1c7bf;
  font-size: 15px;
  outline: none;
  font-family: "Iansui", sans-serif;
}

input:focus {
  border-color: #a18c7b;
  box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4);
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.save-btn, .cancel-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  cursor: pointer;
  font-family: "Iansui", sans-serif;
  font-weight: 600;
}

.save-btn {
  border: none;
  background: #4a2c21;
  color: #f2e6dc;
}

.save-btn:hover {
  background: #2e2622;
}

.cancel-btn {
  border: 1px solid #d1c7bf;
  background: white;
  color: #6b7280;
}

.cancel-btn:hover {
  background: #f3f4f6;
}
</style>