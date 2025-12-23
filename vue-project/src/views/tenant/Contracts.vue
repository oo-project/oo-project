<template>
  <div class="page-container">
    <h2 class="section-title">租約管理</h2>
    
    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'pending' }" 
        @click="currentTab = 'pending'"
      >
        待簽訂合約
        <span class="badge" v-if="pendingContracts.length > 0">{{ pendingContracts.length }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'history' }" 
        @click="currentTab = 'history'"
      >
        簽約紀錄
      </button>
    </div>

    <div v-if="currentTab === 'pending'" class="contract-list">
      <div v-for="item in pendingContracts" :key="item.id" class="card highlight-card">
        <h3 class="rental-title">{{ item.rentalTitle }}</h3>
        <p class="status-text">⚠️ 等待您的簽署</p>
        
        <div class="info-grid">
          <div>
            <span class="label">房東：</span>
            <span class="value-text">{{ item.landlordName }}</span>
          </div>
          <div>
            <span class="label">租期：</span>
            <span class="value-text">{{ item.period }}</span>
          </div>
          <div>
            <span class="label">租金：</span>
            <span class="value-text price-text">{{ item.price }} / 月</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="secondary-btn" @click="viewContract(item)">
            📄 查看合約內容
          </button>
          
          <button class="primary-btn" @click="checkAndOpenSign(item)">
            ✍️ 前往簽名
          </button>
        </div>
      </div>
      <p v-if="pendingContracts.length === 0" class="empty-state">目前沒有待簽訂的合約。</p>
    </div>

    <div v-if="currentTab === 'history'" class="contract-list">
      <div v-for="item in historyContracts" :key="item.id" class="card">
        <div class="card-header">
          <h3 class="rental-title">{{ item.rentalTitle }}</h3>
          <span class="status-badge status-done">已完成</span>
        </div>
        <div class="info-row">
          <span class="label">簽約日期：</span>{{ item.signedDate }}
        </div>
        <div class="info-row" v-if="item.signatureImage">
           <span class="label">您的簽名：</span>
           <img :src="item.signatureImage" class="mini-signature" />
        </div>
        <button class="text-btn" @click="viewContract(item)">查看合約詳情 ></button>
      </div>
    </div>

    <div v-if="showPdfModal" class="modal-overlay" @click.self="closePdf">
      <div class="modal-content pdf-modal-size">
        <div class="modal-header">
          <h3>合約瀏覽</h3>
          <button class="close-btn" @click="closePdf">✕</button>
        </div>
        <div class="pdf-wrapper">
            <iframe :src="currentPdfUrl" width="100%" height="100%" frameborder="0"></iframe>
        </div>
      </div>
    </div>

    <div v-if="showSignModal" class="modal-overlay" @click.self="closeSignModal">
      <div class="modal-content sign-modal-size">
        <div class="modal-header">
          <h3>請在此處簽名</h3>
          <button class="close-btn" @click="closeSignModal">✕</button>
        </div>
        
        <div class="signature-wrapper">
          <VueSignaturePad
            ref="signaturePad"
            width="100%"
            height="300px"
            :options="{ penColor: 'black', backgroundColor: 'white' }"
          />
        </div>
        <p class="hint-text">請在上方框框內簽名</p>

        <div class="modal-footer">
          <button class="outline-btn" @click="clearSignature">清除重寫</button>
          <button class="primary-btn" @click="confirmSignature">確認簽署</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const currentTab = ref('pending')
const showPdfModal = ref(false)
const currentPdfUrl = ref('')
const showSignModal = ref(false)
const signaturePad = ref(null)
const currentSigningItem = ref(null)

// ★★★ 新增：紀錄使用者讀過哪些合約 (用 Set 存 ID) ★★★
const readRecords = reactive(new Set())

const pendingContracts = ref([
  {
    id: 101,
    rentalTitle: '火車站前全新大樓',
    landlordName: '林先生',
    period: '2026/01/01 - 2026/12/31',
    price: '8,500',
    // ★ 補上 PDF 連結，不然待簽約沒東西看 (這裡放範例連結)
    pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/oo-project-dedbd.firebasestorage.app/o/contract%2Fsample.pdf?alt=media&token=49fd71d6-b4dc-4f4d-b783-e29dad30f39c'
  }
])

const historyContracts = ref([
  {
    id: 201,
    rentalTitle: '斗六舊家雅房',
    period: '2024/06/01 - 2025/06/30',
    signedDate: '2024/05/20',
    pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/oo-project-dedbd.firebasestorage.app/o/contract%2Fsample.pdf?alt=media&token=49fd71d6-b4dc-4f4d-b783-e29dad30f39c'
  }
])

// --- PDF 功能 ---
const viewContract = (item) => {
  if (item.pdfUrl) {
    // ★ 紀錄：這個合約已經被打開看過了
    readRecords.add(item.id) 
    
    currentPdfUrl.value = item.pdfUrl
    showPdfModal.value = true
  } else {
    alert('找不到合約檔案')
  }
}

const closePdf = () => {
  showPdfModal.value = false
  currentPdfUrl.value = ''
}

// --- 簽名功能 ---

// ★ 修改：檢查有沒有讀過，才准開簽名板
const checkAndOpenSign = (item) => {
  if (!readRecords.has(item.id)) {
    // 如果沒讀過，跳出警告
    alert('⚠️ 為了保障您的權益，簽名前請先點擊「查看合約內容」閱讀條款。')
    // 貼心的話，可以自動幫他打開合約：
    // viewContract(item) 
    return
  }
  
  // 讀過了，才開啟簽名板
  currentSigningItem.value = item
  showSignModal.value = true
}

const closeSignModal = () => {
  showSignModal.value = false
  currentSigningItem.value = null
}

const clearSignature = () => {
  signaturePad.value.clearSignature()
}

// ... 其他程式碼 ...

// ★★★ 修改這個函式 ★★★
const confirmSignature = async () => {
  // 1. 取得簽名圖片 (Base64)
  const { isEmpty, data } = signaturePad.value.saveSignature()

  if (isEmpty) {
    alert('請先簽名再送出！')
    return
  }

  if (!confirm(`確定要簽署「${currentSigningItem.value.rentalTitle}」嗎？`)) return

  try {
    // 顯示一點點等待的感覺 (因為上傳圖片需要時間)
    alert('正在上傳簽名並加密合約，請稍候...')
    
    // 2. 呼叫剛剛寫好的後端 API
    // 注意：這裡假設你的後端是 localhost:3000
    const response = await fetch(`https://oo-project.zeabur.app/api/contracts/${currentSigningItem.value.id}/sign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        signatureImage: data // 把整串 Base64 丟給後端
      })
    })

    if (response.ok) {
      // 3. 成功後更新畫面
      alert('🎉 簽約成功！合約已生效。')
      
      // 關閉彈窗
      closeSignModal()
      
      // 重新整理頁面 (或是重新呼叫 fetchContracts) 讓資料重抓
      // 這樣合約就會自動跑到「簽約紀錄」分頁，並且顯示剛剛的簽名圖
      location.reload() 
      
    } else {
      alert('簽約失敗，請檢查後端是否開啟')
    }

  } catch (error) {
    console.error(error)
    alert('網路錯誤')
  }
}
</script>

<style scoped>
/* 共用樣式 */
.page-container { max-width: 800px; margin: 0 auto; padding-bottom: 50px; }
.section-title { font-size: 20px; font-weight: 600; color: #2e2622; margin-bottom: 16px; }

.tabs { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 16px; }
.tab-btn { flex: 1; padding: 12px; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; font-size: 15px; cursor: pointer; transition: 0.2s; font-family: "Iansui", sans-serif; }
.tab-btn.active { color: #4a2c21; border-bottom-color: #4a2c21; font-weight: 600; }
.badge { background: #ef4444; color: white; font-size: 11px; padding: 2px 6px; border-radius: 10px; margin-left: 4px; vertical-align: middle;}

.card { background: #fffdf9; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.highlight-card { border: 1px solid #fca5a5; background: #fff1f2; }
.rental-title { font-size: 16px; font-weight: 600; color: #2e2622; }
.status-text { color: #be123c; font-size: 13px; margin: 4px 0 12px; font-weight: 600; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; margin-bottom: 16px; }
.info-row { font-size: 14px; margin-bottom: 6px; color: #374151; display: flex; align-items: center; }
.label { color: #6b7280; margin-right: 4px; }
.status-badge.status-done { background: #e5e7eb; color: #374151; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.empty-state { text-align: center; color: #9ca3af; padding: 20px; }

/* ★★★ 新增：按鈕群組排版 ★★★ */
.card-actions {
  display: flex;
  gap: 10px; /* 按鈕之間的距離 */
  margin-top: 16px;
}

.primary-btn { 
  flex: 2; /* 簽名按鈕佔比較大 */
  padding: 10px; background: #be123c; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-family: "Iansui", sans-serif; 
}
.secondary-btn {
  flex: 1; /* 查看按鈕佔比較小 */
  padding: 10px; background: #fff; border: 1px solid #be123c; color: #be123c; border-radius: 8px; font-size: 14px; cursor: pointer; font-family: "Iansui", sans-serif;
}
.text-btn { background: none; border: none; color: #4a2c21; font-size: 13px; cursor: pointer; margin-top: 8px; text-decoration: underline; font-family: "Iansui", sans-serif; }
.outline-btn { border: 1px solid #a18c7b; background: white; color: #4a2c21; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-family: "Iansui", sans-serif; }

/* Modal 樣式 */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 20px; }
.modal-content { background: white; width: 100%; max-width: 800px; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 4px 12px rgba(0,0,0,0.2); overflow: hidden; }
.pdf-modal-size { height: 80vh; }
.sign-modal-size { max-width: 500px; height: auto; }
.modal-header { padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fffdf9; }
.modal-header h3 { margin: 0; font-size: 18px; color: #4a2c21; }
.close-btn { background: none; border: none; font-size: 24px; color: #6b7280; cursor: pointer; line-height: 1; }
.pdf-wrapper { flex: 1; background: #f3f4f6; position: relative; }
.pdf-wrapper iframe { width: 100%; height: 100%; display: block; }

/* 簽名板樣式 */
.signature-wrapper { border: 2px dashed #ccc; background: #f9f9f9; margin: 20px; border-radius: 8px; height: 300px; }
.hint-text { text-align: center; color: #999; font-size: 14px; margin-top: -10px; margin-bottom: 20px; }
.modal-footer { display: flex; gap: 10px; justify-content: center; padding-bottom: 20px; }
.mini-signature { height: 30px; border-bottom: 1px solid #ddd; }

/* ★★★ 新增：資料文字的顏色 ★★★ */
.value-text {
  color: #111827;  /* 這裡改顏色！例如深灰色 */
  font-weight: 600; /* 加粗，讓字更清楚 */
  font-family: "Iansui", sans-serif; /* 確保字體一致 */
}
</style>