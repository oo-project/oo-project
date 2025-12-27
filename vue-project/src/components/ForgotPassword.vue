<template>
  <div class="page">
    <div class="login-card">
      <h1 class="title">忘記密碼</h1>
      <p class="helper-text">
        請輸入您註冊時的 Email，我們會寄送重設密碼的連結給您。
      </p>

      <form class="form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="請輸入您的 Email"
          />
        </div>

        <button type="submit" class="btn-primary">
          送出重設密碼請求
        </button>
      </form>

      <div class="bottom-links">
        <button class="link-btn" type="button" @click="backToLogin">
          ← 回到登入頁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // 3. 引入 useRouter

const router = useRouter() // 4. 建立 router 實例
const email = ref('')


const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const handleSubmit = () => {
  if (!email.value) {
    alert('請先輸入 Email')
    return
  }

  if (!emailPattern.test(email.value)) {
    alert('請輸入正確的 Email 格式，例如：example@mail.com')
    return
  }

  // 模擬寄信成功
  alert(`已收到重設密碼請求：\nEmail：${email.value}\n（目前為模擬動作）`)

  // 5. 送出成功後，跳轉回登入頁
  router.push('/Login')
}

// 6. 點擊「回到登入頁」的跳轉邏輯
const backToLogin = () => {
  router.push('/Login')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f2e6dc; 
}

.login-card {
  width: 360px;
  padding: 24px 28px 28px;
  border-radius: 16px;
  background: #F2E6DC; 
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  font-family: "Iansui", sans-serif;
}

.title {
  text-align: center;
  margin-bottom: 12px;
  font-size: 26px;
  font-weight: 600;
  color: #2E2622; 
}

.helper-text {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 18px;
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

input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  font-family: "Iansui", sans-serif;
  background-color: white;
}

input:focus {
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
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
  font-family: "Iansui", sans-serif;
}

.btn-primary:hover {
  background: #4a2c21; 
}

.bottom-links {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  font-size: 13px;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  color: #4a2c21; 
  cursor: pointer;
  font-family: "Iansui", sans-serif;
}

.link-btn:hover {
  text-decoration: underline;
}
</style>