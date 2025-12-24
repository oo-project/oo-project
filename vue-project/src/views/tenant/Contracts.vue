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
          <span class="status-badge">{{ contract.statusDisplay }}</span>
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
            📄 審閱合約 PDF
          </a>

          <button 
            v-if="currentTab === 'todo'" 
            class="btn-primary"
            @click="openSignModal(contract)"
          >
            ✍️前往簽約
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSignModal" class="modal-overlay">
      <div class="modal-box">
        <h3>房客簽署合約</h3>
        <p class="hint">請在下方簽名，同意合約條款。</p>
        
        <div class="signature-box">
           <VueSignaturePad 
            width="100%" 
            height="300px" 
            ref="signaturePad" 
            :options="{ penColor: 'black' }"
          />
        </div>

        <div class="modal-btns">
          <button class="btn-outline" @click="showSignModal = false">取消</button>
          <button class="btn-outline" @click="clearPad">清除</button>
          <button class="btn-primary" @click="submitSignature">確認簽署</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { VueSignaturePad } from 'vue-signature-pad'

const contracts = ref([])
const loading = ref(false)
const currentTab = ref('todo') // 'todo' | 'history'
const currentUser = ref({})

// 簽名相關
const showSignModal = ref(false)
const signaturePad = ref(null)
const selectedContractId = ref('')

onMounted(() => {
  // 1. 取得目前登入者資訊
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
    // 這裡我們暫時抓全部合約，然後在前端過濾 (比較簡單的解法)
    // 如果後端有寫 GET /api/my-contracts?tenantId=xxx 會更好
    const res = await axios.get('http://localhost:3000/api/contracts')
    
    // ★★★ 關鍵篩選邏輯 ★★★
    // 只保留 tenantId 等於 目前使用者 ID 的合約
    const myContracts = res.data.filter(c => c.tenantId === currentUser.value.id)
    
    contracts.value = myContracts.map(c => ({
      ...c,
      statusDisplay: mapStatus(c.status)
    }))

  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 根據分頁過濾顯示
const filteredContracts = computed(() => {
  if (currentTab.value === 'todo') {
    // 待簽訂：狀態是 'approved' (房東建立完，等房客簽)
    return contracts.value.filter(c => c.status === 'approved')
  } else {
    // 歷史紀錄：狀態是 'tenant_signed' (已簽，等房東簽) 或 'completed' (完成)
    return contracts.value.filter(c => c.status !== 'approved')
  }
})

const mapStatus = (s) => {
  const map = {
    'approved': '等待您簽約',
    'tenant_signed': '等待房東簽署',
    'completed': '已生效'
  }
  return map[s] || s
}

// --- 簽名邏輯 ---
const openSignModal = (contract) => {
  selectedContractId.value = contract.id
  showSignModal.value = true
}

const clearPad = () => {
  signaturePad.value.clearSignature()
}

// --- 在 TenantContracts.vue 裡面 ---

const submitSignature = async () => {
  // 1. 取得簽名板的圖檔
  const { isEmpty, data } = signaturePad.value.saveSignature()
  if (isEmpty) return alert('請先簽名！')

  if (!confirm('簽名後將無法修改，確定送出嗎？')) return

  try {
    loading.value = true // 顯示讀取中(建議加個 loading 變數控制畫面)
    
    // 2. 呼叫剛剛寫好的後端 API
    await axios.put(`http://localhost:3000/api/contracts/${selectedContractId.value}/tenant-sign`, {
      signatureImage: data // 送出 Base64 圖片
    })

    alert('✅ 簽署成功！請等待房東最終簽署生效。')
    
    // 3. 關閉視窗並重整列表
    showSignModal.value = false
    fetchContracts()

  } catch (error) {
    console.error(error)
    alert('簽署失敗，請檢查網路或後端連線')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.tenant-contracts { padding: 20px; max-width: 800px; margin: 0 auto; }
.page-title { font-size: 24px; font-weight: bold; color: #4a2c21; margin-bottom: 20px; }

/* Tabs */
.tabs { display: flex; gap: 20px; border-bottom: 2px solid #eee; margin-bottom: 20px; }
.tab-btn { padding: 10px 0; background: none; border: none; font-size: 16px; color: #888; cursor: pointer; position: relative; }
.tab-btn.active { color: #4a2c21; font-weight: bold; }
.tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: #4a2c21; }

.contract-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.status-badge { background: #fff8e1; color: #b45309; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.card-body p { margin: 5px 0; color: #555; }
.card-actions { margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end; }

.btn-primary { background: #4a2c21; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-outline { border: 1px solid #4a2c21; color: #4a2c21; background: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block;}

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-box { background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 500px; }
.signature-box { border: 2px dashed #ccc; background: #fafafa; margin: 20px 0; }
.modal-btns { display: flex; justify-content: flex-end; gap: 10px; }
</style>