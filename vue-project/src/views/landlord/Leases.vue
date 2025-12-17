<template>
  <section class="panel">
    <div class="panel-header">
      <h2 class="panel-title">租約管理</h2>
      <button class="primary-btn" @click="addLease">
        ＋ 新增租約
      </button>
    </div>
    <p class="panel-hint">
      管理你的電子租約，支援上傳電子簽章、刪除或典藏歷史租約（示意）。
    </p>

    <div class="card-list">
      <article v-for="lease in leases" :key="lease.id" class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">
              {{ lease.rentalTitle }}
              <span
                class="badge-small"
                :class="lease.status === 'active' ? 'badge-active' : 'badge-archived'"
              >
                {{ lease.status === 'active' ? '有效中' : '已典藏' }}
              </span>
            </h3>
            <p class="card-sub">
              房客：{{ lease.tenantName }} · 期間：{{ lease.period }}
            </p>
          </div>
        </div>

        <p class="card-desc">
          上次更新：{{ lease.lastUpdate }} · 電子簽章：
          <span class="chip">{{ lease.hasESign ? '已上傳' : '未上傳' }}</span>
        </p>

        <div class="card-actions">
          <button class="small-btn" @click="uploadESign(lease)">上傳 / 更新電子簽章</button>
          <button
            class="small-btn outline"
            v-if="lease.status === 'active'"
            @click="archiveLease(lease)"
          >
            典藏租約
          </button>
          <button class="small-btn danger" @click="deleteLease(lease.id)">
            刪除租約
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const leases = ref([
  {
    id: 1,
    rentalId: 1,
    rentalTitle: '雲科大旁溫馨套房',
    tenantName: '小明',
    period: '2025/02 - 2026/01',
    lastUpdate: '2025/01/10',
    hasESign: true,
    status: 'active'
  },
  {
    id: 2,
    rentalId: 2,
    rentalTitle: '斗六市區電梯雅房',
    tenantName: '小美',
    period: '2024/09 - 2025/06',
    lastUpdate: '2024/09/15',
    hasESign: false,
    status: 'archived'
  }
])

const addLease = () => {
  const rentalTitle = window.prompt('請輸入租件名稱：', '新的租約租件')
  const tenantName = window.prompt('請輸入房客姓名：', '房客姓名')
  if (!rentalTitle || !tenantName) return
  const period = window.prompt('請輸入租約期間：', '2025/03 - 2026/02') || '未填寫'
  
  leases.value.unshift({
    id: Date.now(),
    rentalId: 0,
    rentalTitle,
    tenantName,
    period,
    lastUpdate: '2025/01/01',
    hasESign: false,
    status: 'active'
  })
}

const uploadESign = (lease) => {
  alert(`上傳/更新「${lease.rentalTitle} - ${lease.tenantName}」的電子簽章（示意）。`)
  lease.hasESign = true
  lease.lastUpdate = '2025/01/15（示意日期）'
}

const archiveLease = (lease) => {
  if (!confirm('確定要將此租約移到典藏嗎？')) return
  lease.status = 'archived'
}

const deleteLease = (id) => {
  if (!confirm('確定要刪除此租約嗎？')) return
  leases.value = leases.value.filter((l) => l.id !== id)
}
</script>

<style scoped>

.badge-small { margin-left: 6px; padding: 2px 6px; border-radius: 999px; font-size: 11px; }
.badge-active { background: #dcfce7; color: #166534; }
.badge-archived { background: #e5e7eb; color: #374151; }
.chip { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; background: #e1d4c8; color: #4a2c21; }


.panel { max-width: 1100px; margin: 0 auto; background: #fffdf9; border-radius: 16px; padding: 16px 18px 18px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); border: 1px solid rgba(242, 230, 220, 0.9); }
.panel-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.panel-title { font-size: 20px; font-weight: 600; color: #2e2622; }
.panel-hint { font-size: 13px; color: #6b7280; margin-top: 4px; }
.card-list { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
.card { padding: 10px 12px 10px; border-radius: 12px; background: #fefbf7; border: 1px solid #e1d4c8; box-shadow: 0 2px 8px rgba(46, 38, 34, 0.08); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.card-title { font-size: 16px; font-weight: 600; color: #2e2622; }
.card-sub { font-size: 13px; color: #6b7280; }
.card-desc { margin-top: 4px; font-size: 13px; color: #4b5563; }
.card-actions { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.primary-btn { border: none; padding: 6px 12px; border-radius: 999px; background: #a18c7b; color: #f2e6dc; font-size: 13px; cursor: pointer; transition: 0.2s ease; font-family: "Iansui", sans-serif; }
.primary-btn:hover { background: #4a2c21; }
.small-btn { border: none; padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer; font-family: "Iansui", sans-serif; background: #e1d4c8; color: #2e2622; transition: 0.2s ease; }
.small-btn:hover { background: #d3c2b1; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }
.small-btn.outline:hover { background: #a18c7b; color: #f2e6dc; }
.small-btn.danger { background: #fee2e2; color: #991b1b; }
.small-btn.danger:hover { background: #fecaca; }
</style>