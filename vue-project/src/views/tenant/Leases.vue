<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">租約管理系統</h2>
        <p class="panel-hint">
          整合您的房源與預約資料，快速建立合約並進行線上簽署。
        </p>
      </div>
      <button class="primary-btn" @click="openAddModal">
        ＋ 新增租約
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      資料讀取中...
    </div>

    <div v-else class="card-list">
      
      <div v-if="leases.length === 0" class="empty-state">
        <span class="empty-icon">📝</span>
        <p>目前沒有租約記錄</p>
      </div>

      <article v-for="lease in leases" :key="lease.id" class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">
              {{ lease.rentalTitle }}
              <span
                class="badge-small"
                :class="lease.isActive ? 'badge-active' : 'badge-pending'"
              >
                {{ lease.statusText }}
              </span>
            </h3>
            <p class="card-sub">
              房客：{{ lease.tenantName }} · 租期：{{ lease.period }}
            </p>
          </div>
        </div>

        <div class="card-body">
          <p class="card-desc">
            目前進度：{{ lease.statusDisplay }}
          </p>
          
          <div v-if="lease.pdfUrl" style="margin-top: 12px; display: flex; gap: 10px; align-items: center;">
            <a :href="lease.pdfUrl" target="_blank" class="download-link">
              📄 查看/編輯 PDF
            </a>

            <button 
              v-if="lease.status === 'approved'"
              class="text-btn-upload"
              @click="triggerUpload(lease)"
            >
              📤 上傳修改版
            </button>
          </div>
        </div>

        <div class="card-actions">
          <button 
            v-if="lease.status === 'tenant_signed'"
            class="small-btn primary" 
            @click="openSignModal(lease)"
          >
            ✍️ 房東簽署生效
          </button>

          <button v-if="lease.status === 'approved'" class="small-btn outline" disabled>
            ⏳ 等待房客簽約
          </button>

          <button v-if="lease.status === 'completed'" class="small-btn outline success" disabled>
            ✓ 已完成
          </button>

          <button class="small-btn danger" @click="deleteLease(lease.id)">
            刪除
          </button>
        </div>
      </article>
    </div>

    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-box">
        <h3 class="modal-title">建立新租約</h3>
        <p class="modal-sub">請選擇房源以自動帶入資訊</p>
        
        <div class="form-group">
          <label>選擇出租房源</label>
          <select v-model="selectedRentalId" @change="onRentalSelect" class="form-select">
            <option value="" disabled>-- 請選擇房源 --</option>
            <option v-for="rental in rentalOptions" :key="rental.id" :value="rental.id">
              {{ rental.title }} ({{ rental.roomType || '套房' }})
            </option>
          </select>
          <p v-if="rentalOptions.length === 0" class="error-text">
            查無上架房源，請先至「租件管理」新增。
          </p>
        </div>

        <div class="form-group">
          <label>房客姓名</label>
          <div v-if="tenantOptions.length > 0">
            <select v-model="tempLeaseForm.tenantName" class="form-select">
              <option value="" disabled>-- 請選擇申請租屋的房客 --</option>
              <option v-for="t in tenantOptions" :key="t.id" :value="t.name">
                👤 {{ t.name }} ({{ t.status === 'confirmed' ? '已預約' : '申請中' }})
              </option>
            </select>
            <p style="font-size: 12px; color: #166534; margin-top: 4px;">
              ✓ 找到 {{ tenantOptions.length }} 位預約紀錄
            </p>
          </div>
          <div v-else>
            <input 
              type="text" 
              v-model="tempLeaseForm.tenantName" 
              :placeholder="loadingTenants ? '搜尋預約紀錄中...' : '此房源無預約紀錄，請手動輸入姓名'"
              :disabled="loadingTenants"
            >
          </div>
        </div>

        <div class="form-group">
          <label>租金 (月)</label>
          <input type="number" v-model="tempLeaseForm.price" placeholder="自動帶入房源租金" @input="calculateDeposit">
        </div>

        <div class="form-group">
          <label>租期 (月數)</label>
          <input type="number" v-model="tempLeaseForm.months" placeholder="預設 12 個月">
          <p style="font-size: 12px; color: #666; margin-top: 4px;">
            系統將自動推算起訖日期填入合約
          </p>
        </div>

        <div class="form-group">
          <label>押金設定 (月數 / 金額)</label>
          <div style="display: flex; gap: 10px;">
            <input 
              type="number" 
              v-model="tempLeaseForm.depositMonths" 
              placeholder="月數" 
              style="flex: 1"
              @input="calculateDeposit"
            >
            <input 
              type="number" 
              v-model="tempLeaseForm.depositFee" 
              placeholder="押金總額" 
              style="flex: 2"
            >
          </div>
        </div>

        <div class="modal-actions">
          <button class="small-btn outline" @click="closeAddModal">取消</button>
          <button class="small-btn primary" @click="confirmAddLease">確定建立</button>
        </div>
      </div>
    </div>

    <div v-if="showPad" class="modal-overlay">
      <div class="modal-box" style="max-width: 600px; width: 95%;">
        <h3 class="modal-title">房東簽署</h3>
        <p class="modal-sub">請在下方區塊簽名，系統將自動合成至合約 PDF。</p>
        
        <div class="signature-wrapper">
          <VueSignaturePad 
            width="100%" 
            height="300px" 
            ref="signaturePad" 
            :options="{ penColor: 'black' }"
          />
        </div>

        <div class="modal-actions" style="margin-top: 15px;">
          <button class="small-btn outline" @click="showPad = false">取消</button>
          <button class="small-btn outline" @click="clearPad">清除重寫</button>
          <button class="small-btn primary" @click="confirmSignature">確認送出</button>
        </div>
      </div>
    </div>

    <input 
      type="file" 
      ref="fileInput" 
      accept="application/pdf" 
      style="display: none" 
      @change="handleFileUpload"
    >

  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import { VueSignaturePad } from 'vue-signature-pad'

const leases = ref([])
const loading = ref(false)
const rentalOptions = ref([]) 
const tenantOptions = ref([]) 
const selectedRentalId = ref('')
const loadingTenants = ref(false)
const showAddModal = ref(false)
const showPad = ref(false)
const signaturePad = ref(null)
const currentLeaseId = ref(null)

const fileInput = ref(null)
const uploadingLeaseId = ref(null)

const tempLeaseForm = ref({
  rentalId: '',
  rentalTitle: '',
  tenantName: '',
  price: '',
  address: '',
  months: 12,
  depositMonths: 2, 
  depositFee: '',   
  otherTerms: ''
})

onMounted(() => {
  fetchLeases()
  fetchRentals()
})

const fetchLeases = async () => {
  try {
    loading.value = true
    const res = await api.get('/api/contracts')
    leases.value = res.data.map(doc => ({
      id: doc.id,
      rentalTitle: doc.rentalTitle || `房源 ${doc.roomId || ''}`,
      tenantName: doc.tenantName || '未填寫',
      period: `${doc.periodStart || '?'} ~ ${doc.periodEnd || '?'}`,
      status: doc.status,
      pdfUrl: doc.pdfUrl,
      isActive: doc.status === 'completed',
      statusText: mapStatusText(doc.status),
      statusDisplay: mapStatusDisplay(doc.status)
    }))
  } catch (error) {
    console.error("租約讀取失敗:", error)
  } finally {
    loading.value = false
  }
}

const fetchRentals = async () => {
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return
  const user = JSON.parse(userStr)
  try {
    const response = await api.get(`/api/rentals/list?landlordId=${user.id}`)
    const json = await response.json()
    if (json.success) rentalOptions.value = json.data
  } catch (e) {
    console.error("房源讀取失敗:", e)
  }
}

const calculateDeposit = () => {
  const price = parseInt(tempLeaseForm.value.price) || 0
  const months = parseInt(tempLeaseForm.value.depositMonths) || 0
  tempLeaseForm.value.depositFee = (price * months).toString()
}

const onRentalSelect = async () => {
  tempLeaseForm.value.tenantName = ''
  tenantOptions.value = []
  const selected = rentalOptions.value.find(r => r.id === selectedRentalId.value)
  if (selected) {
    tempLeaseForm.value.rentalId = selected.id
    tempLeaseForm.value.rentalTitle = selected.title
    tempLeaseForm.value.price = selected.price
    tempLeaseForm.value.address = selected.address
    calculateDeposit()
    await fetchRoomTenants(selected.id)
  }
}

const fetchRoomTenants = async (rentalId) => {
  try {
    loadingTenants.value = true
    const res = await api.get('/api/room-tenants', { params: { rentalId } })
    tenantOptions.value = res.data
    if (tenantOptions.value.length === 1) {
      tempLeaseForm.value.tenantName = tenantOptions.value[0].name
    }
  } catch (error) {
    console.error("無法讀取房客名單:", error)
  } finally {
    loadingTenants.value = false
  }
}

const openAddModal = () => {
  selectedRentalId.value = ''
  tenantOptions.value = []
  tempLeaseForm.value = { 
      rentalId: '', rentalTitle: '', tenantName: '', price: '', address: '', months: 12, 
      depositMonths: 2, depositFee: '', otherTerms: '' 
  }
  showAddModal.value = true
}
const closeAddModal = () => { showAddModal.value = false }

const confirmAddLease = async () => {
  const { rentalTitle, tenantName, price, months, address, otherTerms, depositMonths, depositFee } = tempLeaseForm.value

  if (!rentalTitle || !tenantName) {
    alert("請選擇房源並填寫/選擇房客姓名")
    return
  }

  const selectedTenant = tenantOptions.value.find(t => t.name === tenantName)
  const tenantId = selectedTenant ? selectedTenant.id : ''

  if (!tenantId) {
     if(!confirm('注意：目前為手動輸入模式，未綁定房客帳號，房客可能無法線上簽約。\n確定要繼續嗎？')) return
  }

  const userStr = localStorage.getItem('currentUser')
  const user = userStr ? JSON.parse(userStr) : {}
  const myName = user.name || '房東'

  const today = new Date()
  const startDate = today.toISOString().split('T')[0]
  const endDateObj = new Date(today)
  endDateObj.setMonth(today.getMonth() + parseInt(months))
  const endDate = endDateObj.toISOString().split('T')[0]

  const payload = {
    roomId: rentalTitle,
    rentalId: selectedRentalId.value,
    tenantName,
    tenantId,
    price: price.toString(),
    depositMonths: depositMonths.toString(),
    depositFee: depositFee.toString(),
    periodStart: startDate,
    periodEnd: endDate,
    address: address || '未填寫地址',
    otherTerms: otherTerms || '',
    status: 'approved',
    landlordName: myName 
  }

  try {
    const res = await api.post('/api/contracts', payload)
    const { pdfUrl } = res.data
    alert("租約建立成功！正在為您開啟合約 PDF...")
    if (pdfUrl) window.open(pdfUrl, '_blank')
    closeAddModal()
    fetchLeases()
  } catch (error) {
    console.error(error)
    alert("建立失敗，請檢查後端連線")
  }
}

const triggerUpload = (lease) => {
  uploadingLeaseId.value = lease.id
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    alert('請上傳 PDF 格式的檔案')
    return
  }
  if (!confirm('確定要用這份檔案覆蓋原本的合約嗎？')) {
    event.target.value = ''
    return
  }

  try {
    alert('上傳中...')
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64String = reader.result
      await api.put(`/api/contracts/${uploadingLeaseId.value}/update-pdf`, {
        pdfBase64: base64String
      })
      alert('✅ 更新成功！')
      fetchLeases()
    }
  } catch (error) {
    console.error(error)
    alert('上傳失敗')
  } finally {
    event.target.value = ''
  }
}

const openSignModal = (lease) => {
  currentLeaseId.value = lease.id
  showPad.value = true
}

const clearPad = () => {
  signaturePad.value.clearSignature()
}

const confirmSignature = async () => {
  const { isEmpty, data } = signaturePad.value.saveSignature()
  if (isEmpty) return alert('請先簽名！')
  try {
    alert("處理中...")
    await api.put(`/api/contracts/${currentLeaseId.value}/landlord-sign`, {
      signatureImage: data
    })
    alert("簽署完成！合約已生效。")
    showPad.value = false
    fetchLeases()
  } catch (error) {
    console.error(error)
    alert("簽署失敗")
  }
}

const deleteLease = async (id) => {
  if (!confirm('確定要刪除此租約？')) return
  leases.value = leases.value.filter(l => l.id !== id)
}

const mapStatusText = (status) => {
  const map = { 'approved': '處理中', 'tenant_signed': '待簽核', 'completed': '有效中' }
  return map[status] || '草稿'
}

const mapStatusDisplay = (status) => {
  const map = {
    'applied': '房客申請中',
    'approved': '等待房客簽約',
    'tenant_signed': '等待房東簽署',
    'completed': '合約已完成'
  }
  return map[status] || status
}
</script>

<style scoped>
.panel { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: "Iansui", sans-serif; background: #fffdf9; border-radius: 16px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); min-height: 85vh; display: flex; flex-direction: column; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-title { font-size: 24px; font-weight: 700; color: #4a2c21; }
.panel-hint { font-size: 14px; color: #6b7280; margin-top: 4px; }
.primary-btn { background: #4a2c21; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; }
.primary-btn:hover { background: #2e2622; }
.card-list { display: flex; flex-direction: column; gap: 15px; flex: 1; }
.empty-state { text-align: center; padding: 40px; color: #9ca3af; font-size: 16px; }
.empty-icon { font-size: 40px; display: block; margin-bottom: 10px; }
.loading-state { text-align: center; padding: 40px; color: #6b7280; }
.card { padding: 16px 20px; border-radius: 12px; background: white; border: 1px solid #e1d4c8; box-shadow: 0 2px 8px rgba(46, 38, 34, 0.05); }
.card-header { display: flex; justify-content: space-between; }
.card-title { font-size: 18px; font-weight: 600; color: #2e2622; }
.card-sub { font-size: 14px; color: #6b7280; margin-top: 4px; }
.card-body { margin-top: 10px; font-size: 14px; color: #4b5563; }
.download-link { color: #a18c7b; text-decoration: underline; font-weight: 600; cursor: pointer; }
.badge-small { margin-left: 8px; padding: 2px 8px; border-radius: 99px; font-size: 12px; }
.badge-active { background: #dcfce7; color: #166534; }
.badge-pending { background: #fef3c7; color: #92400e; }
.card-actions { margin-top: 15px; display: flex; gap: 8px; justify-content: flex-end; }
.small-btn { padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; border: 1px solid transparent; transition: 0.2s; }
.small-btn.primary { background: #a18c7b; color: white; }
.small-btn.primary:hover { background: #8b7362; }
.small-btn.outline { background: white; border-color: #d1d5db; color: #374151; }
.small-btn.success { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
.small-btn.danger { background: #fee2e2; color: #991b1b; }
.small-btn.danger:hover { background: #fecaca; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 13px; color: #4b5563; margin-bottom: 4px; }
.form-group input, .form-select { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; font-family: "Iansui", sans-serif; }
.form-group input:focus, .form-select:focus { border-color: #a18c7b; outline: none; }
.error-text { color: #ef4444; font-size: 12px; margin-top: 4px; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
.modal-box { background: white; width: 90%; max-width: 400px; padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); animation: popIn 0.2s ease; }
@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.modal-title { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
.modal-sub { font-size: 14px; color: #6b7280; margin-bottom: 20px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.signature-wrapper { border: 2px dashed #d1d5db; border-radius: 8px; background: #fafafa; }
.text-btn-upload { background: none; border: 1px solid #a18c7b; color: #a18c7b; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; font-family: "Iansui", sans-serif; }
.text-btn-upload:hover { background: #fdf8f6; }
</style>