<template>
  <div class="form-section">
    <h3 class="sub-title">基本資訊</h3>
    
    <div class="form-group">
      <label>顯示名稱</label>
      <input 
        :value="name"
        @input="$emit('update:name', $event.target.value)"
        type="text" 
        placeholder="請輸入您的暱稱"
      />
    </div>

    <div class="form-group">
      <label>身分</label>
      <input type="text" value="租客 (Tenant)" disabled class="disabled-input" />
    </div>

    <div class="form-group">
      <label>Email</label>
      <input :value="email" type="email" disabled class="disabled-input" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  email: String
})

defineEmits(['update:name'])
</script>

<style scoped>
/* 共用樣式直接搬過來，保持一致性 */
.sub-title { font-size: 16px; font-weight: 600; color: #4a2c21; margin-bottom: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
label { font-size: 14px; color: #6b7280; }
input { padding: 10px 12px; border-radius: 8px; border: 1px solid #d1c7bf; font-size: 15px; background: white; outline: none; width: 100%; box-sizing: border-box; font-family: "Iansui", sans-serif; }
input:focus { border-color: #a18c7b; box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4); }
.disabled-input { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
</style>