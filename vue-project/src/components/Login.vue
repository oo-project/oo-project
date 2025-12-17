<template>
  <div class="page">
    <div class="login-card">
      <h1 class="title">🏡 使用者登入 🏡</h1>
      
      <form class="form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">帳號</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="請輸入帳號"
          />
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="請輸入密碼"
          />
        </div>

        <div class="form-group">
          <label for="role">身分</label>
          <select id="role" v-model="loginRole">
            <option value="">請選擇身分</option>
            <option value="tenant">租客</option>
            <option value="landlord">房東</option>
          </select>
        </div>

        <button type="submit" class="btn-primary">
          登入
        </button>
      </form>

      <div class="bottom-links">
        <button class="link-btn" type="button" @click="goToForgotPassword">
          忘記密碼？
        </button>

        <div class="signup">
          還沒有帳號？
          <button class="link-btn" type="button" @click="goToRegChoose">
            立即註冊
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // 1. 引入 useRouter

const router = useRouter() // 2. 建立 router 實例

const username = ref('')
const password = ref('')
const loginRole = ref('')

// 登入邏輯
const handleLogin = () => {
  if (!username.value || !password.value) {
    alert('請輸入帳號與密碼')
    return
  }

  if (!loginRole.value) {
    alert('請先選擇身分（租客或房東）')
    return
  }

  // 3. 改用 router.push 進行頁面跳轉
  // 注意：這裡的路徑要對應你在 router/index.js 裡設定的 path
  if (loginRole.value === 'tenant') {
    router.push('/TenantHome') 
  } else if (loginRole.value === 'landlord') {
    router.push('/LandlordHome')
  }
}

// 跳轉到忘記密碼
const goToForgotPassword = () => {
  router.push('/ForgotPassword')
}

// 跳轉到註冊選擇頁
const goToRegChoose = () => {
  router.push('/RegChoose')
}
</script>

<style scoped>
/* 樣式直接搬過來即可 */
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background: #f2e6dc; (如果 body 已經設了，這裡可以拿掉，或是保留確保覆蓋) */
}

.login-card {
  width: 360px;
  padding: 24px 28px 28px;
  border-radius: 16px;
  background: #F2E6DC;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 30px;
  font-weight: 600;
  color: #2E2622;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-size: 14px;
  color: #374151;
}

input,
select {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 16px;
  outline: none;
  background-color: white; /* 確保輸入框背景是白的 */
}

input:focus,
select:focus {
  border-color: #a18c7b;
  box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4);
}

.btn-primary {
  margin-top: 8px;
  width: 100%;
  padding: 10px 0;
  border-radius: 8px;
  border: none;
  background: #a18c7b;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: #4a2c21;
}

.bottom-links {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  font-size: 13px;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  color: #4a2c21;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.signup {
  display: flex;
  gap: 4px;
  align-items: center;
  color: #6b7280;
}
</style>