<template>
  <section class="panel">
    <h2 class="panel-title">房客管理</h2>
    <p class="panel-hint">
      可查看各租件的房客名單、合約紀錄、付款紀錄，以及預約看房列表。
    </p>

    <h3 class="sub-title">已租出租件與房客名單</h3>
    <div class="card-list">
      <article v-for="group in tenantGroups" :key="group.rentalId" class="card">
        <h3 class="card-title">{{ group.rentalTitle }}</h3>
        <p class="card-sub">目前房客：{{ group.tenants.length }} 位</p>

        <table class="simple-table">
          <thead>
            <tr>
              <th>房客姓名</th>
              <th>聯絡電話</th>
              <th>合約狀態</th>
              <th>付款狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in group.tenants" :key="t.id">
              <td>{{ t.name }}</td>
              <td>{{ t.phone }}</td>
              <td>{{ t.contractStatus }}</td>
              <td>{{ t.paymentStatus }}</td>
              <td>
                <button class="table-btn" @click="editTenant(t)">編輯</button>
                <button class="table-btn danger" @click="removeTenant(t.id)">刪除</button>
                <button class="table-btn outline" @click="viewTenantHistory(t)">
                  合約 / 付款紀錄
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <button class="small-btn" @click="addTenant(group.rentalId)">
          ＋ 新增房客
        </button>
      </article>
    </div>

    <h3 class="sub-title">預約清單</h3>
    <div class="card-list">
      <article v-for="reserve in reservations" :key="reserve.id" class="card">
        <h3 class="card-title">{{ reserve.rentalTitle }}</h3>
        <p class="card-sub">
          房客：{{ reserve.guestName }} · 預約時間：{{ reserve.time }}
        </p>
        <p class="card-desc">
          備註：{{ reserve.note || '（無備註）' }} · 狀態：
          <span class="chip">{{ reserve.statusText }}</span>
        </p>
        <div class="card-actions">
          <button class="small-btn" @click="contactGuest(reserve)">線上聯絡房客</button>
          <button class="small-btn outline" @click="approveReservation(reserve)">同意預約</button>
          <button class="small-btn danger" @click="rejectReservation(reserve)">拒絕預約</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const tenants = ref([
  { id: 1, rentalId: 1, rentalTitle: '雲科大旁溫馨套房', name: '小明', phone: '0912-345-678', contractStatus: '簽約中', paymentStatus: '本月已繳' },
  { id: 2, rentalId: 1, rentalTitle: '雲科大旁溫馨套房', name: '小華', phone: '0922-111-333', contractStatus: '即將到期', paymentStatus: '本月未繳' },
  { id: 3, rentalId: 2, rentalTitle: '斗六市區電梯雅房', name: '小美', phone: '0933-222-444', contractStatus: '生效中', paymentStatus: '本月已繳' }
])

// 為了讓新增房客功能正常，我們需要這份 rentals 資訊（實際專案請用 API 或 Pinia）
const rentals = [
  { id: 1, title: '雲科大旁溫馨套房' },
  { id: 2, title: '斗六市區電梯雅房' }
]

const tenantGroups = computed(() => {
  const groupMap = new Map()
  tenants.value.forEach((t) => {
    if (!groupMap.has(t.rentalId)) {
      groupMap.set(t.rentalId, {
        rentalId: t.rentalId,
        rentalTitle: t.rentalTitle,
        tenants: []
      })
    }
    groupMap.get(t.rentalId).tenants.push(t)
  })
  return Array.from(groupMap.values())
})

const addTenant = (rentalId) => {
  const rental = rentals.find(r => r.id === rentalId)
  const name = window.prompt('請輸入房客姓名：', '')
  const phone = window.prompt('請輸入房客電話：', '')
  if (!name || !phone) return
  tenants.value.push({
    id: Date.now(),
    rentalId,
    rentalTitle: rental ? rental.title : '未知租件',
    name,
    phone,
    contractStatus: '新合約',
    paymentStatus: '待繳費'
  })
}

const editTenant = (t) => {
  const newName = window.prompt('修改房客姓名：', t.name) || t.name
  t.name = newName
}

const removeTenant = (id) => {
  if (confirm('確定要刪除？')) tenants.value = tenants.value.filter(t => t.id !== id)
}

const viewTenantHistory = (t) => alert(`查看 ${t.name} 的紀錄...`)

// 預約資料
const reservations = ref([
  { id: 1, rentalId: 1, rentalTitle: '雲科大旁溫馨套房', guestName: '小新', time: '2025/01/20  14:00', note: '希望看頂樓', status: 'pending', statusText: '待回覆' },
])

const contactGuest = () => alert('開啟聊天室...')
const approveReservation = (r) => { r.statusText = '已同意' }
const rejectReservation = (r) => { r.statusText = '已拒絕' }
</script>

<style scoped>
/* 表格樣式 */
.simple-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 13px; }
.simple-table th, .simple-table td { border-bottom: 1px solid #e5e7eb; padding: 4px 6px; text-align: left; }
.simple-table th { background: #f9fafb; color: #4b5563; }
.table-btn { border: none; padding: 2px 6px; border-radius: 999px; font-size: 11px; cursor: pointer; margin-right: 4px; font-family: "Iansui", sans-serif; background: #e5e7eb; color: #374151; }
.table-btn.outline { background: transparent; border: 1px solid #9ca3af; }
.table-btn.danger { background: #fee2e2; color: #991b1b; }

.sub-title { margin-top: 16px; margin-bottom: 4px; font-size: 16px; font-weight: 600; color: #2e2622; }
/* 共用樣式請再次貼上，或引用全域 */
.panel { max-width: 1100px; margin: 0 auto; background: #fffdf9; border-radius: 16px; padding: 16px 18px 18px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); border: 1px solid rgba(242, 230, 220, 0.9); }
.panel-title { font-size: 20px; font-weight: 600; color: #2e2622; }
.panel-hint { font-size: 13px; color: #6b7280; margin-top: 4px; }
.card-list { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
.card { padding: 10px 12px 10px; border-radius: 12px; background: #fefbf7; border: 1px solid #e1d4c8; box-shadow: 0 2px 8px rgba(46, 38, 34, 0.08); }
.card-title { font-size: 16px; font-weight: 600; color: #2e2622; }
.card-sub { font-size: 13px; color: #6b7280; }
.card-desc { margin-top: 4px; font-size: 13px; color: #4b5563; }
.card-actions { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.small-btn { border: none; padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer; font-family: "Iansui", sans-serif; background: #e1d4c8; color: #2e2622; transition: 0.2s ease; }
.small-btn:hover { background: #d3c2b1; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }
.small-btn.outline:hover { background: #a18c7b; color: #f2e6dc; }
.small-btn.danger { background: #fee2e2; color: #991b1b; }
.small-btn.danger:hover { background: #fecaca; }
.chip { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; background: #e1d4c8; color: #4a2c21; }
</style>