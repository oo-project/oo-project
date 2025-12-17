<template>
  <section class="panel">
    <h2 class="panel-title">個人專區</h2>
    <p class="panel-hint">
      在這裡可以修改顯示名稱、查看收藏租件。
    </p>

    <div class="profile-section">
      <h3 class="sub-title">帳號基本資料</h3>
      <div class="profile-item">
        <span class="profile-label">顯示名稱：</span>
        <input v-model="landlordName" type="text" class="profile-input" />
      </div>
      <p class="profile-hint">＊此名稱會顯示在系統中的房東標示處。</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const landlordName = ref('小房東')
</script>

<style scoped>
.profile-section { margin-top: 12px; }
.profile-item { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.profile-label { min-width: 80px; font-size: 14px; color: #4a2c21; }
.profile-input { flex: 1; padding: 6px 8px; border-radius: 8px; border: 1px solid #d1c7bf; font-size: 14px; outline: none; font-family: "Iansui", sans-serif; }
.profile-hint { font-size: 12px; color: #6b7280; margin-top: 4px; }
.sub-title { font-size: 16px; font-weight: 600; color: #2e2622; }

/* 共用樣式 */
.panel { max-width: 1100px; margin: 0 auto; background: #fffdf9; border-radius: 16px; padding: 16px 18px 18px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); border: 1px solid rgba(242, 230, 220, 0.9); }
.panel-title { font-size: 20px; font-weight: 600; color: #2e2622; }
.panel-hint { font-size: 13px; color: #6b7280; margin-top: 4px; }
</style>