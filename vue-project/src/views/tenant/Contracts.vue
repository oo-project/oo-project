<template>
  <div class="tenant-contracts">
    <h2 class="page-title">租約管理</h2>

    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'todo' }"
        @click="currentTab = 'todo'"
      >
        待簽訂合約
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'history' }"
        @click="currentTab = 'history'"
      >
        簽約紀錄
      </button>
    </div>

    <div v-if="loading" class="loading">讀取中...</div>

    <div v-else class="contract-list">
      
      <div v-if="filteredContracts.length === 0" class="empty-state">
        <p>目前沒有{{ currentTab === 'todo' ? '待簽訂' : '歷史' }}的合約。</p>
      </div>

      <div 
        v-for="contract in filteredContracts" 
        :key="contract.id" 
        class="contract-card"
      >
        <div class="card-header">
          <h3>{{ contract.rentalTitle || '租屋合約' }}</h3>
          <span 
            class="status-badge"
            :class="contract.status === 'completed' ? 'badge-success' : 'badge-warn'"
          >
            {{ contract.statusDisplay }}
          </span>
        </div>
        
        <div class="card-body">
          <p>📅 租期：{{ contract.periodStart }} ~ {{ contract.periodEnd }}</p>
          <p>💰 租金：{{ contract.price }} 元/月</p>
          <p>👤 房東：{{ contract.landlordName }}</p>
        </div>

        <div class="card-actions">
          <a 
            v-if="contract.pdfUrl" 
            :href="contract.pdfUrl" 
            target="_blank" 
            class="btn-outline"
          >
            📄 預覽合約
          </a>

          <button 
            v-if="currentTab === 'todo'" 
            class="btn-primary"
            @click="openSignModal(contract)"
          >
            ✍️ 填寫並簽約
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSignModal" class="modal-overlay">
      <div class="modal-box">
        <h3>簽署合約流程</h3>
        <p class="hint" style="margin-bottom: 15px;">請依序完成以下步驟：</p>
        
        <div class="step-box">
          <div class="step-title">1. 下載合約並填寫資料</div>
          <p class="step-desc">請下載 PDF，使用電腦或手機填寫個人資料。</p>
          <a :href="currentContractPdfUrl" target="_blank" class="btn-outline small">
            ⬇️ 下載 PDF
          </a>
        </div>

        <div class="step-box">
          <div class="step-title">2. 上傳填寫後的 PDF</div>
          <p class="step-desc">將填好的檔案上傳回系統。</p>
          <input type="file" ref="fileInput" accept="application/pdf" @change="handleFileChange">
          <p v-if="uploadFile" class="file-name">✅ 已選擇檔案: {{ uploadFile.name }}</p>
        </div>

        <div class="step-box">
          <div class="step-title">3. 電子簽名</div>
          <p class="step-desc">請在下方簽名，系統將自動壓印至您剛上傳的檔案。</p>
          <div class="signature-box">
             <VueSignaturePad 
              width="100%" 
              height="200px" 
              ref="signaturePad" 
              :options="{ penColor: 'black' }"
            />
          </div>
          <button class="btn-text" @click="clearPad">清除重寫</button>
        </div>

        <div class="modal-btns">
          <button class="btn-outline" @click="closeModal" :disabled="submitting">取消</button>
          <button class="btn-primary" @click="submitProcess" :disabled="submitting">
            {{ submitting ? '處理中...' : '確認上傳並簽署' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { VueSignaturePad } from 'vue-signature-pad'

const contracts = ref([])
const loading = ref(false)
const submitting = ref(false)
const currentTab = ref('todo')
const currentUser = ref({})

// 簽名與上傳相關
const showSignModal = ref(false)
const signaturePad = ref(null)
const selectedContractId = ref('')
const currentContractPdfUrl = ref('')
const uploadFile = ref(null) // 儲存使用者選取的檔案

onMounted(() => {
  const userStr = localStorage.getItem('currentUser')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)
    fetchContracts()
  } else {
    alert('請先登入')
  }
})

const fetchContracts = async () => {
  try {
    loading.value = true
    const res = await api.get(`/api/contracts?tenantId=${currentUser.value.id}`)
    const myContracts = res.data || []
    contracts.value = myContracts.map(c => ({
      ...c,
      statusDisplay: mapStatus(c.status)
    }))
  } catch (error) {
    console.error("讀取合約失敗:", error)
  } finally {
    loading.value = false
  }
}

const filteredContracts = computed(() => {
  if (currentTab.value === 'todo') {
    return contracts.value.filter(c => 
      c.status === 'created' || c.status === 'approved' || c.status === 'applied'
    )
  } else {
    return contracts.value.filter(c => 
      ['tenant_signed', 'landlord_signed', 'completed'].includes(c.status)
    )
  }
})

const mapStatus = (s) => {
  const map = {
    'created': '待簽約',
    'approved': '待簽約',
    'tenant_signed': '等待房東簽署',
    'landlord_signed': '✅ 雙方已簽署',
    'completed': '✅ 合約已歸檔'
  }
  return map[s] || s
}

// --- Modal 操作 ---
const openSignModal = (contract) => {
  selectedContractId.value = contract.id
  currentContractPdfUrl.value = contract.pdfUrl
  uploadFile.value = null // 重置檔案
  showSignModal.value = true
}

const closeModal = () => {
  showSignModal.value = false
  uploadFile.value = null
}

const clearPad = () => {
  signaturePad.value.clearSignature()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.type !== 'application/pdf') {
    alert('請上傳 PDF 格式的檔案')
    event.target.value = ''
    return
  }
  uploadFile.value = file
}

// 輔助函式：轉 File 為 Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// --- 核心送出邏輯 (先上傳 -> 再簽名) ---
const submitProcess = async () => {
  // 1. 檢查簽名
  const { isEmpty, data } = signaturePad.value.saveSignature()
  if (isEmpty) return alert('請先在下方簽名！')

  // 2. 檢查檔案 (強制要求上傳)
  if (!uploadFile.value) {
    return alert('請務必上傳「已填寫資料」的合約 PDF！')
  }

  if (!confirm('確定資料正確並送出簽署？此動作無法復原。')) return

  try {
    submitting.value = true

    // --- 步驟 A: 上傳檔案 ---
    // 呼叫原本房東上傳 PDF 的那支 API (功能一樣，都是覆蓋檔案)
    const base64File = await fileToBase64(uploadFile.value)
    await api.put(`/api/contracts/${selectedContractId.value}/update-pdf`, {
      pdfBase64: base64File
    })
    
    // --- 步驟 B: 送出簽名 ---
    // 檔案上傳成功後，後端資料庫的 pdfUrl 已經更新，這時候再呼叫簽名，就會簽在新檔案上
    await api.put(`/api/contracts/${selectedContractId.value}/tenant-sign`, {
      signatureImage: data
    })

    alert('✅ 資料上傳並簽署成功！')
    closeModal()
    fetchContracts() // 重整

  } catch (error) {
    console.error(error)
    alert('處理失敗: ' + (error.response?.data?.error || '請檢查連線'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.tenant-contracts { padding: 20px; max-width: 800px; margin: 0 auto; font-family: "Iansui", sans-serif; }
.page-title { font-size: 24px; font-weight: bold; color: #4a2c21; margin-bottom: 20px; }

/* Tabs */
.tabs { display: flex; gap: 20px; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px; }
.tab-btn { padding: 10px 0; background: none; border: none; font-size: 16px; color: #9ca3af; cursor: pointer; position: relative; font-family: inherit;}
.tab-btn.active { color: #4a2c21; font-weight: bold; }
.tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: #4a2c21; }

.contract-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; }
.card-header h3 { margin: 0; font-size: 18px; color: #1f2937; }

.status-badge { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 500; }
.badge-success { background: #d1fae5; color: #065f46; }
.badge-warn { background: #fff7ed; color: #c2410c; }

.card-body p { margin: 8px 0; color: #4b5563; font-size: 14px; }
.card-actions { margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end; }

/* Buttons */
.btn-primary { background: #4a2c21; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-family: inherit;}
.btn-primary:hover { background: #352018; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-outline { border: 1px solid #d1d5db; color: #374151; background: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; font-size: 14px; transition: 0.2s; font-family: inherit;}
.btn-outline:hover { background: #f9fafb; border-color: #9ca3af; }
.btn-outline.small { padding: 4px 12px; font-size: 13px; margin-top: 5px; }

.btn-text { background: none; border: none; color: #6b7280; font-size: 12px; text-decoration: underline; cursor: pointer; margin-top: 5px; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-box { background: white; padding: 30px; border-radius: 16px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.hint { color: #6b7280; font-size: 14px; }

/* Step Box */
.step-box { margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6; }
.step-title { font-weight: bold; color: #4a2c21; margin-bottom: 5px; }
.step-desc { font-size: 13px; color: #6b7280; margin-bottom: 10px; }
.file-name { font-size: 13px; color: #166534; margin-top: 5px; font-weight: 500; }

</style>