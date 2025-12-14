<template>
  <div class="form-section">
    <h3 class="sub-title">修改密碼</h3>
    <p class="hint">若不修改請留空</p>

    <div class="form-group">
      <label>新密碼</label>
      <input 
        :value="newPassword"
        @input="$emit('update:newPassword', $event.target.value)"
        type="password" 
        placeholder="請輸入新密碼"
      />
    </div>

    <div class="form-group">
      <label>確認新密碼</label>
      <input 
        :value="confirmPassword"
        @input="$emit('update:confirmPassword', $event.target.value)"
        type="password" 
        placeholder="請再次輸入新密碼"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  newPassword: String,
  confirmPassword: String
})

defineEmits(['update:newPassword', 'update:confirmPassword'])
</script>

<style scoped>
/* 樣式同上 */
.sub-title { font-size: 16px; font-weight: 600; color: #4a2c21; margin-bottom: 12px; }
.hint { font-size: 12px; color: #9ca3af; margin-bottom: 10px; margin-top: -8px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
label { font-size: 14px; color: #6b7280; }
input { padding: 10px 12px; border-radius: 8px; border: 1px solid #d1c7bf; font-size: 15px; background: white; outline: none; width: 100%; box-sizing: border-box; font-family: "Iansui", sans-serif; }
input:focus { border-color: #a18c7b; box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4); }
</style>