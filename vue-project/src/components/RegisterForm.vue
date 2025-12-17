<template>
  <div class="page">
    <div class="register-card">
      <h1 class="title">
        {{ role === 'landlord' ? '房東註冊' : '租客註冊' }}
      </h1>

      <p class="step-text" v-if="currentStep === 'form'">
        步驟 1：請先填寫基本資料
      </p>
      <p class="step-text" v-else>
        步驟 2：手機簡訊驗證
      </p>

      <form
        v-if="currentStep === 'form'"
        class="form"
        @submit.prevent="handleSubmitForm"
      >
        <div class="form-group">
          <label for="name">姓名</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="請輸入姓名"
          />
        </div>

        <div class="form-group">
          <label for="phone">手機號碼</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="例如：0912345678"
          />
        </div>

        <div class="form-group">
          <label for="address">地址</label>
          <input
            id="address"
            v-model="form.address"
            type="text"
            placeholder="請輸入住址"
          />
        </div>

        <div class="form-group">
          <label for="gender">性別</label>
          <select id="gender" v-model="form.gender">
            <option value="">請選擇性別</option>
            <option value="female">女</option>
            <option value="male">男</option>
            <option value="other">其他 / 不方便透露</option>
          </select>
        </div>

        <div class="form-group">
          <label for="idImage">
            {{ role === 'landlord' ? '身分證照片（示意）' : '學生證 / 身分證照片（示意）' }}
          </label>
          <input
            id="idImage"
            type="file"
            accept="image/*"
            @change="handleFileChange"
          />
          <p class="hint">
            ＊正式系統可用來做身分驗證，現在先示意即可。
          </p>
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="請輸入密碼"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">確認密碼</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
          />
        </div>

        <div class="button-row">
          <button
            type="button"
            class="secondary-btn"
            @click="goBackToChoice"
          >
            ← 回上一步（選擇身分）
          </button>

          <button type="submit" class="btn-primary">
            下一步：手機驗證
          </button>
        </div>
      </form>

      <div v-else class="verify-step">
        <p class="verify-text">
          我們已傳送驗證碼到您的手機：
          <span class="phone-highlight">{{ maskedPhone }}</span><br />
          請輸入簡訊中的 6 位數驗證碼（本範例不會真的發簡訊，只做流程示意）。
        </p>

        <div class="form-group">
          <label for="code">簡訊驗證碼</label>
          <input
            id="code"
            v-model="verificationCode"
            type="text"
            maxlength="6"
            placeholder="請輸入 6 位數驗證碼"
          />
        </div>

        <div class="verify-buttons">
          <button
            type="button"
            class="secondary-btn"
            @click="backToEditForm"
          >
            ← 返回修改資料
          </button>

          <button
            type="button"
            class="secondary-btn"
            @click="resendCode"
          >
            重新寄送驗證碼
          </button>

          <button
            type="button"
            class="btn-primary"
            @click="handleVerifyCode"
          >
            完成註冊
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router' // 3. 引入路由工具

const router = useRouter()
const route = useRoute()

// 4. 從網址取得 role 參數 (例如 /Register?role=landlord)
// 如果網址沒有參數，預設給 'tenant' 避免報錯
const role = computed(() => route.query.role || 'tenant')

const currentStep = ref('form')

const form = ref({
  name: '',
  phone: '',
  address: '',
  gender: '',
  password: '',
  confirmPassword: '',
  idImageFile: null
})

const verificationCode = ref('')

const maskedPhone = computed(() => {
  const p = form.value.phone || ''
  if (p.length >= 10) {
    return p.slice(0, 4) + '***' + p.slice(-3)
  }
  return p
})

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  form.value.idImageFile = file || null
}

// 5. 回到上一頁 (選擇身分頁)
const goBackToChoice = () => {
  router.push('/RegChoose')
}

// Step 1：檢查表單
const handleSubmitForm = () => {
  if (!form.value.name || !form.value.phone || !form.value.address ||
      !form.value.gender || !form.value.password || !form.value.confirmPassword) {
    alert('請先填寫所有必填欄位')
    return
  }

  const phonePattern = /^09\d{8}$/
  if (!phonePattern.test(form.value.phone)) {
    alert('請輸入正確的手機號碼，例如：0912345678')
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    alert('兩次輸入的密碼不一致，請再確認')
    return
  }

  alert('已發送驗證碼到您的手機（示意）')
  currentStep.value = 'verify'
}

const resendCode = () => {
  alert('已重新寄送驗證碼到您的手機（示意）')
}

const backToEditForm = () => {
  currentStep.value = 'form'
}

// Step 2：驗證碼與完成註冊
const handleVerifyCode = () => {
  if (!verificationCode.value) {
    alert('請先輸入簡訊驗證碼')
    return
  }

  const codePattern = /^\d{6}$/
  if (!codePattern.test(verificationCode.value)) {
    alert('驗證碼格式錯誤，請輸入 6 位數字')
    return
  }

  // 6. 註冊成功，跳轉回登入頁
  alert('手機驗證成功，註冊完成！請重新登入。')
  
  // 可以在這裡呼叫後端 API 送出資料...
  
  router.push('/Login')
}
</script>

<style scoped>
/* 7. 補上 page 樣式 */
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f2e6dc; 
}

.register-card {
  width: 420px;
  padding: 24px 28px 28px;
  border-radius: 16px;
  background: #f2e6dc;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  font-family: "Iansui", sans-serif;
}

.title {
  text-align: center;
  margin-bottom: 4px;
  font-size: 24px;
  font-weight: 600;
  color: #2e2622;
}

.step-text {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-size: 14px;
  color: #4a2c21;
}

input,
select {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1c7bf;
  font-size: 14px;
  outline: none;
  font-family: "Iansui", sans-serif;
  background: #fffdf9;
}

input:focus,
select:focus {
  border-color: #a18c7b;
  box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4);
}

.hint {
  font-size: 11px;
  color: #6b7280;
}

/* Step 1 按鈕列 */
.button-row {
  margin-top: 4px;
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.btn-primary,
.secondary-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  font-family: "Iansui", sans-serif;
  transition: 0.2s ease;
}

.btn-primary {
  border: none;
  background: #a18c7b;
  color: white;
  font-weight: 600;
}

.btn-primary:hover {
  background: #4a2c21;
}

.secondary-btn {
  border: 1px solid #a18c7b;
  background: transparent;
  color: #4a2c21;
}

.secondary-btn:hover {
  background: #e1d4c8;
}

/* Step 2：驗證碼 */
.verify-step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verify-text {
  font-size: 14px;
  color: #4a2c21;
  line-height: 1.6;
}

.phone-highlight {
  font-weight: 600;
  color: #a18c7b;
}

.verify-buttons {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>