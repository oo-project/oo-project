<template>
  <div class="editor-container">
    <div class="editor-header">
      <button class="back-btn" @click="goBack">← 返回列表</button>
      <h2 class="page-title">{{ isEditMode ? '編輯租件' : '新增租件' }}</h2>
    </div>

    <div class="editor-layout">
      <div class="main-form">
        
        <div class="section photo-upload-section">
          <label class="section-label">房屋照片 (第一張將作為封面)</label>
          <div class="photo-grid">
            <div v-for="(img, index) in form.images" :key="index" class="photo-item">
              <img :src="img" />
              <button class="remove-photo" @click="removePhoto(index)">✕</button>
            </div>
            
            <label class="upload-box">
              <input type="file" multiple accept="image/*" @change="handlePhotoUpload" hidden />
              <span class="plus-icon">📷</span>
              <span>新增照片</span>
            </label>
          </div>
          <p class="hint">建議尺寸：1200x800，單張不超過 2MB</p>
        </div>

        <div class="section header-info">
          <div class="input-group full-width">
            <label>租件標題</label>
            <input v-model="form.title" type="text" placeholder="例如：雲科大旁溫馨獨立套房，採光佳" class="big-input" />
          </div>

          <div class="row-group">
            <div class="input-group">
              <label>每月租金 (元)</label>
              <input v-model.number="form.price" type="number" class="price-input" />
            </div>
            <div class="input-group">
              <label>押金/訂金 (元)</label>
              <input v-model.number="form.deposit" type="number" />
            </div>
          </div>
        </div>

        <div class="section specs-info">
          <h3 class="sub-title">房屋詳情</h3>
          <div class="specs-grid">
            <div class="input-group">
              <label>地址</label>
              <input v-model="form.address" type="text" placeholder="請輸入完整地址" />
            </div>
            <div class="input-group">
              <label>房屋型式</label>
              <select v-model="form.type">
                <option value="獨立套房">獨立套房</option>
                <option value="分租套房">分租套房</option>
                <option value="雅房">雅房</option>
                <option value="整層住家">整層住家</option>
              </select>
            </div>
            <div class="input-group">
              <label>樓層</label>
              <input v-model.number="form.floor" type="number" placeholder="例如：3" />
            </div>
            <div class="input-group">
              <label>坪數 (坪)</label>
              <input v-model.number="form.area" type="number" />
            </div>
            <div class="input-group">
              <label>房間數</label>
              <input v-model.number="form.rooms" type="number" value="1" />
            </div>
          </div>
        </div>

        <div class="section amenities-section">
          <h3 class="sub-title">提供設施</h3>
          <div class="amenities-grid">
            <label v-for="item in amenityOptions" :key="item" class="amenity-checkbox">
              <input type="checkbox" :value="item" v-model="form.amenities" />
              <span class="checkmark"></span>
              {{ item }}
            </label>
          </div>
        </div>

        <div class="section desc-section">
          <h3 class="sub-title">屋況特色描述</h3>
          <textarea 
            v-model="form.description" 
            rows="6" 
            placeholder="請詳細描述房屋特色、周邊環境、租屋規則等..."
          ></textarea>
        </div>

      </div>

      <div class="control-panel">
        <div class="control-card">
          <h3>發布設定</h3>
          <div class="status-toggle">
            <label>狀態</label>
            <select v-model="form.isPublished">
              <option :value="false">📂 暫存草稿 (不公開)</option>
              <option :value="true">🌏 公開發布</option>
            </select>
          </div>
          
          <hr class="divider">
          
          <button class="save-btn" @click="handleSave" :disabled="isSaving">
            {{ isSaving ? '儲存中...' : (isEditMode ? '儲存修改' : '確認新增') }}
          </button>
          
          <p class="hint">
            {{ form.isPublished ? '儲存後將立即讓房客搜尋到此房源。' : '您可以先儲存為草稿，稍後再發布。' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 狀態變數
const amenityOptions = ref([]) // 設施選項
const isSaving = ref(false)    // 防止重複點擊

// 表單資料
const form = reactive({
  title: '',
  address: '',
  price: 0,
  deposit: 0,
  type: '獨立套房',
  floor: 1,
  area: 5,
  rooms: 1,
  amenities: [],
  description: '',
  images: [], // 存放 Base64 或 網址
  isPublished: false
})

// 判斷是否為編輯模式 (網址有 id)
const isEditMode = computed(() => !!route.params.id)

// 初始化
onMounted(async () => {
  // 1. 抓取設施選項
  try {
    const res = await fetch('http://localhost:3000/api/rentals/amenities')
    const json = await res.json()
    if (json.success) {
      amenityOptions.value = json.data
    }
  } catch (e) {
    console.error('載入設施失敗，使用預設值', e)
    amenityOptions.value = ['Wi-Fi', '冷氣', '冰箱', '洗衣機', '熱水器', '電視', '床', '衣櫃', '書桌椅', '電梯', '陽台', '可養寵']
  }

  // 2. 如果是編輯模式，抓取舊資料填入
  if (isEditMode.value) {
    const rentalId = route.params.id
    try {
      const res = await fetch(`http://localhost:3000/api/rentals/${rentalId}`)
      const json = await res.json()
      if (json.success) {
        Object.assign(form, json.data)
      } else {
        alert('找不到該租件資料')
        router.push('/LandlordHome/rent')
      }
    } catch (e) {
      console.error('載入租件失敗', e)
    }
  }
})

// 處理照片上傳 (轉 Base64)
const handlePhotoUpload = (e) => {
  const files = e.target.files
  if (!files) return

  // 限制最多上傳 5 張
  if (form.images.length + files.length > 5) {
    alert('最多只能上傳 5 張照片')
    return
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    // 限制 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert(`照片 ${file.name} 超過 2MB，請壓縮後再上傳`)
      continue
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (evt) => {
      form.images.push(evt.target.result)
    }
  }
  // 清空 input 讓同一張圖可以再次選擇
  e.target.value = ''
}

// 移除照片
const removePhoto = (index) => {
  form.images.splice(index, 1)
}

// ✨ 修正重點：儲存邏輯 ✨
const handleSave = async () => {
  // 1. 驗證必填
  if (!form.title || !form.address || !form.price) {
    alert('請填寫標題、地址與租金！')
    return
  }

  // 2. ✨✨✨ 這裡必須定義 user 變數！ ✨✨✨
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) {
    alert('登入逾時，請重新登入')
    router.push('/Login')
    return
  }
  const user = JSON.parse(userStr) // 解析出 user 物件

  isSaving.value = true

  // 3. 準備傳給後端的資料
  const payload = {
    ...form,
    landlordId: user.id, // 使用上面解析出的 user.id
    id: isEditMode.value ? route.params.id : undefined
  }
  
  try {
    const url = isEditMode.value 
      ? 'http://localhost:3000/api/rentals/update'
      : 'http://localhost:3000/api/rentals/add'

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    
    if (data.success) {
      alert(isEditMode.value ? '✅ 修改成功！' : '🎉 新增成功！')
      router.push('/LandlordHome/rent') // 回到列表頁
    } else {
      alert('失敗：' + data.message)
    }
  } catch (error) {
    console.error('API Error:', error)
    alert('連線失敗，請檢查後端伺服器')
  } finally {
    isSaving.value = false
  }
}

const goBack = () => router.back()
</script>

<style scoped>
/* ✨ 全域設定：確保 padding 不會撐開寬度 */
* {
  box-sizing: border-box;
}

.editor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Iansui", sans-serif;
  width: 100%; /* 確保容器不超過視窗 */
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.back-btn {
  background: none; border: none; font-size: 16px; cursor: pointer; color: #6b7280;
}
.page-title { font-size: 24px; font-weight: 700; color: #4a2c21; }

.editor-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 左側表單區 */
.main-form {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  /* ✨ 關鍵：防止內容過寬時撐開容器 */
  min-width: 0; 
  width: 100%;
}

.section { margin-bottom: 32px; }
.section-label { font-size: 16px; font-weight: 600; color: #2e2622; margin-bottom: 12px; display: block; }
.sub-title { font-size: 18px; font-weight: 600; color: #2e2622; margin-bottom: 12px; border-left: 4px solid #a18c7b; padding-left: 8px; }

/* 照片上傳格 */
.photo-grid {
  display: flex;
  flex-wrap: wrap; /* 讓照片自動換行 */
  gap: 12px;
}
.photo-item {
  width: 100px; height: 100px; /* 手機版照片稍微縮小一點 */
  position: relative; border-radius: 8px; overflow: hidden;
  border: 1px solid #eee;
}
.photo-item img { width: 100%; height: 100%; object-fit: cover; }
.remove-photo {
  position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;
}
.upload-box {
  width: 100px; height: 100px; border: 2px dashed #d1c7bf; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #8b7e74; transition: 0.2s; background: #fafafa;
}
.upload-box:hover { background: #fdf6ed; border-color: #a18c7b; }
.plus-icon { font-size: 24px; margin-bottom: 4px; }
.hint { font-size: 12px; color: #9ca3af; margin-top: 6px; }

/* 輸入框樣式 */
.input-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.input-group label { font-size: 14px; font-weight: 500; color: #4b5563; }

/* 確保輸入框寬度是 100% 且不超出父層 */
input, select, textarea {
  width: 100%; 
  padding: 10px 12px; 
  border: 1px solid #d1c7bf; 
  border-radius: 8px; 
  font-size: 15px; 
  outline: none; 
  transition: 0.2s; 
  font-family: inherit;
  background: #fff;
}
input:focus, select:focus, textarea:focus { border-color: #a18c7b; box-shadow: 0 0 0 3px rgba(161, 140, 123, 0.1); }

.big-input { font-size: 20px; font-weight: 600; }
.price-input { font-size: 18px; color: #a18c7b; font-weight: 700; }

.row-group { display: flex; gap: 20px; margin-top: 12px; }
.specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

/* 設施 Checkbox */
.amenities-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.amenity-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 15px; color: #4b5563; }
.amenity-checkbox input { accent-color: #a18c7b; width: 16px; height: 16px; flex-shrink: 0; }

/* 右側控制板 */
.control-panel {
  width: 300px;
  position: sticky;
  top: 80px;
  flex-shrink: 0; /* 防止被壓縮 */
}
.control-card {
  background: #fff; border-radius: 12px; padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border: 1px solid #f2e6dc;
  width: 100%;
}
.status-toggle select { width: 100%; margin-top: 8px; }
.save-btn {
  width: 100%; padding: 12px; background: #4a2c21; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 16px; transition: 0.2s;
}
.save-btn:hover { background: #2e2622; }
.save-btn:disabled { background: #9ca3af; cursor: not-allowed; }

.divider { border: none; border-top: 1px solid #eee; margin: 16px 0; }

/* ✨✨✨ RWD 手機版優化 ✨✨✨ */
@media (max-width: 768px) {
  .editor-container {
    padding: 12px; /* 減少外層留白 */
    overflow-x: hidden; /* 防止水平捲動 */
  }

  .editor-layout {
    flex-direction: column; /* 改為上下排列 */
    gap: 16px;
  }

  .main-form {
    padding: 20px 16px; /* ✨ 減少內距，這最重要，不然會爆版 */
  }

  /* 讓租金和押金那一行變成上下排列 */
  .row-group {
    flex-direction: column;
    gap: 12px;
  }

  /* 詳細規格改成 1 欄，避免太擠 */
  .specs-grid {
    grid-template-columns: 1fr; 
  }

  /* 設施改成 2 欄 (原本4欄太寬了) */
  .amenities-grid {
    grid-template-columns: repeat(2, 1fr); 
  }

  /* 控制面板改為正常流動 */
  .control-panel {
    width: 100%;
    position: static;
  }
}
</style>