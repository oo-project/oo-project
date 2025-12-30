<template>
  <div class="chatbot-wrapper">
    <button class="chat-toggle-btn" @click="toggleChat">
      <span v-if="!isOpen">🤖</span>
      <span v-else>✕</span>
    </button>

    <transition name="fade">
      <div v-if="isOpen" class="chat-window">
        <div class="chat-header">
          <div class="header-info">
            <h3>租屋大神助手</h3>
            <span class="status-dot"></span>
          </div>
          <p>找房、功能導覽、設定提醒，問我就對了！</p>
        </div>

        <div class="chat-body" ref="chatBody">
          <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
            
            <div v-if="msg.type === 'text' || msg.type === 'chat'" class="bubble">
              {{ msg.content }}
            </div>

            <div v-else-if="msg.type === 'recommendation'" class="recommendation-list">
              <p class="bubble">{{ msg.text }}</p>
              <div 
                v-for="rental in msg.data" 
                :key="rental.id" 
                class="mini-card"
                @click="goToPage(`/TenantHome/rental/${rental.id}`)"
              >
                <img :src="rental.images?.[0] || defaultImg" class="mini-img" />
                <div class="mini-info">
                  <h4>{{ rental.title }}</h4>
                  <p class="price">${{ rental.price }}</p>
                  <p class="addr">{{ rental.address }}</p>
                </div>
              </div>
            </div>

            <div v-else-if="msg.type === 'navigate'" class="nav-content">
              <div class="bubble">{{ msg.content }}</div>
              <button class="action-btn" @click="goToPage(msg.path)">
                📍 前往「{{ msg.label }}」
              </button>
            </div>
          </div>
          
          <div v-if="isThinking" class="message bot">
            <div class="bubble typing">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <div class="chat-footer">
          <input 
            v-model="input" 
            @keyup.enter="sendMessage" 
            placeholder="請輸入您的需求..." 
            :disabled="isThinking"
          />
          <button @click="sendMessage" :disabled="!input || isThinking" class="send-btn">
            ➤
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()
const isOpen = ref(false)
const input = ref('')
const isThinking = ref(false)
const chatBody = ref(null)
const defaultImg = 'https://cdn-icons-png.flaticon.com/512/609/609803.png'

// 預設歡迎訊息
const messages = ref([
  { 
    role: 'bot', 
    type: 'text', 
    content: '你好！我是您的租屋小幫手。您可以問我「推薦斗六的套房」、「我要去哪裡改密碼？」、「提醒我明天八點要繳房租」' 
  }
])

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) scrollToBottom()
}

const sendMessage = async () => {
  if (!input.value.trim() || isThinking.value) return
  
  const userMsg = input.value
  messages.value.push({ role: 'user', type: 'text', content: userMsg })
  input.value = ''
  isThinking.value = true
  scrollToBottom()

  // ✨ 新增：從 localStorage 取得目前登入使用者資訊
  const userStr = localStorage.getItem('currentUser')
  let currentUserId = null
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      // 根據你儲存的格式，可能是 user.uid 或 user.id
      currentUserId = user.uid || user.id 
    } catch (e) {
      console.error('解析用戶資訊失敗', e)
    }
  }

  try {
    // ✨ 修改：將 userId 放入 body 傳給後端
    const res = await api.post('/api/bot/chat', { 
      message: userMsg,
      userId: currentUserId // 將 ID 傳過去
    })
    
    const data = res.data

    // 1. 處理房源推薦
    if (data.type === 'recommendation') {
      messages.value.push({ 
        role: 'bot', 
        type: 'recommendation', 
        text: data.text, 
        data: data.data 
      })
    } 
    // 2. 處理導航跳轉
    else if (data.type === 'navigate') {
      const label = data.label || '目標頁面'
      const replyText = data.reply || data.text
      
      messages.value.push({ 
        role: 'bot', 
        type: 'navigate', 
        content: replyText,
        path: data.path,
        label: label
      })

      setTimeout(() => {
        if (data.path) {
          router.push(data.path)
          isOpen.value = false 
        }
      }, 1200)
    }
    // 3. 一般對話 (包括建立提醒後的成功回覆)
    else {
      messages.value.push({ 
        role: 'bot', 
        type: 'text', 
        content: data.text || data.reply 
      })
    }

  } catch (e) {
    console.error('Bot API Error:', e)
    messages.value.push({ role: 'bot', type: 'text', content: '抱歉，我現在無法連線，請稍後再試。' })
  } finally {
    isThinking.value = false
    scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

const goToPage = (path) => {
  router.push(path)
  isOpen.value = false
}
</script>

<style scoped>
.chatbot-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: "Iansui", sans-serif;
}

/* 懸浮按鈕 */
.chat-toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4a2c21;
  color: #f2e6dc;
  border: none;
  font-size: 26px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.chat-toggle-btn:hover {
  transform: scale(1.1);
  background: #5d3a2d;
}

/* 聊天視窗 */
.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 520px;
  background: #fffdf9;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(74, 44, 33, 0.1);
}

.chat-header {
  background: #4a2c21;
  color: #f2e6dc;
  padding: 18px;
}
.header-info { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.chat-header h3 { margin: 0; font-size: 17px; }
.status-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; }
.chat-header p { margin: 0; font-size: 11px; opacity: 0.8; }

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fdf6ed;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 訊息氣泡 */
.message { display: flex; flex-direction: column; max-width: 85%; }
.message.user { align-self: flex-end; align-items: flex-end; }
.message.bot { align-self: flex-start; align-items: flex-start; }

.bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.message.user .bubble { background: #a18c7b; color: white; border-bottom-right-radius: 4px; }
.message.bot .bubble { background: white; color: #4a2c21; border-bottom-left-radius: 4px; }

/* 導航按鈕 */
.nav-content { display: flex; flex-direction: column; gap: 8px; }
.action-btn {
  align-self: flex-start;
  background: #fefce8;
  color: #a18c7b;
  border: 1.5px dashed #a18c7b;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  font-family: "Iansui", sans-serif;
}
.action-btn:hover { background: #a18c7b; color: white; }

/* 推薦卡片 */
.recommendation-list { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.mini-card {
  display: flex;
  background: white;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  gap: 12px;
}
.mini-card:hover { transform: translateY(-2px); border-color: #a18c7b; }
.mini-img { width: 55px; height: 55px; border-radius: 8px; object-fit: cover; }
.mini-info h4 { margin: 0 0 2px; font-size: 14px; color: #4a2c21; }
.mini-info .price { color: #b45309; font-weight: bold; margin: 0; font-size: 13px; }
.mini-info .addr { color: #6b7280; font-size: 11px; margin: 0; }

.chat-footer {
  padding: 14px;
  background: white;
  border-top: 1px solid #f2e6dc;
  display: flex;
  gap: 10px;
}
.chat-footer input {
  flex: 1;
  padding: 12px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
}
.send-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #4a2c21;
  color: white;
  border: none;
  cursor: pointer;
}

/* 打字動畫 */
.typing { display: flex; gap: 4px; padding: 12px 15px; }
.dot { width: 6px; height: 6px; background: #a18c7b; border-radius: 50%; animation: blink 1.4s infinite both; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }
</style>