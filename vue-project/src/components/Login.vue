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
            placeholder="請輸入帳號(電話號碼)"
          />
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="請輸入密碼"
            />
            
            <button 
              type="button" 
              class="eye-btn" 
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
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
import { useRouter } from 'vue-router'
import api from '@/utils/api' // 假設你有這個 utils

const router = useRouter()

const username = ref('')
const password = ref('')
const loginRole = ref('')
const showPassword = ref(false) // ✨ 新增：控制密碼顯示狀態

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert('請輸入帳號與密碼')
    return
  }

  if (!loginRole.value) {
    alert('請先選擇身分')
    return
  }
  
  try {
    const response = await api.post('/api/auth/login', {
        username: username.value,
        password: password.value,
        role: loginRole.value
    })

    const data = response.data

    if (data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      alert(`歡迎回來，${data.user.name}！`)

      if (data.user.role === 'tenant') {
        router.push('/TenantHome')
      } else {
        router.push('/LandlordHome')
      }
    } else {
      alert('登入失敗：' + data.message)
    }

  } catch (error) {
    console.error('Login Error:', error)
    alert('無法連線到伺服器')
  }
}

const goToForgotPassword = () => router.push('/ForgotPassword')
const goToRegChoose = () => router.push('/RegChoose')
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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
  width: 100%; /* 確保滿版 */
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 16px;
  outline: none;
  background-color: white;
  box-sizing: border-box; /* 確保 padding 不會撐大寬度 */
}

input:focus,
select:focus {
  border-color: #a18c7b;
  box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4);
}

/* 👇 新增樣式：密碼輸入框 wrapper */
.password-wrapper {
  position: relative; /* 讓內部絕對定位的按鈕以此為基準 */
  display: flex;
  align-items: center;
}

/* 為了不讓文字被眼睛擋住，輸入框右邊要留點空間 */
.password-wrapper input {
  padding-right: 40px; 
}

/* 👇 新增樣式：小眼睛按鈕 */
.eye-btn {
  position: absolute;
  right: 10px;        /* 靠右 */
  top: 50%;
  transform: translateY(-50%); /* 垂直置中 */
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;     /* 灰色圖示 */
  display: flex;
  align-items: center;
  padding: 0;
}

.eye-btn:hover {
  color: #4a2c21;     /* hover 時變深色 */
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