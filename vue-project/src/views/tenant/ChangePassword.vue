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

// 模擬後端資料庫目前的密碼
const MOCK_CURRENT_PASSWORD = '123456'

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const goBack = () => {
  router.back() // 回上一頁
}

const handleSubmit = () => {
  // 1. 檢查欄位是否填寫
  if (!form.value.oldPassword || !form.value.newPassword || !form.value.confirmPassword) {
    alert('請填寫所有欄位')
    return
  }

  // 2. 模擬檢查舊密碼是否正確
  if (form.value.oldPassword !== MOCK_CURRENT_PASSWORD) {
    alert('❌ 舊密碼錯誤！(測試用：請輸入 123456)')
    return
  }

  // 3. 檢查新密碼規則 (例如至少6碼)
  if (form.value.newPassword.length < 6) {
    alert('新密碼長度不足，請至少輸入 6 碼')
    return
  }

  // 4. 檢查兩次新密碼是否一致
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('兩次新密碼輸入不一致')
    return
  }

  // 5. 避免新密碼跟舊密碼一樣
  if (form.value.newPassword === form.value.oldPassword) {
    alert('新密碼不能與舊密碼相同')
    return
  }

  // 成功
  alert('✅ 密碼修改成功！請重新登入。')
  
  // 實務上這裡會呼叫 API，成功後通常會登出或是跳回個人頁
  router.push('/TenantHome/profile')
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