// backend/debug-key.js
require('dotenv').config();

const rawKey = process.env.FIREBASE_PRIVATE_KEY;

console.log('--- 診斷開始 ---');

if (!rawKey) {
  console.error('❌ 錯誤：完全讀不到環境變數，請檢查 .env 檔名或位置。');
  process.exit(1);
}

console.log('1. 原始長度:', rawKey.length);

// 嘗試轉換換行符號
const formattedKey = rawKey.replace(/\\n/g, '\n');

console.log('2. 轉換後長度:', formattedKey.length);

// 檢查開頭
const expectedHeader = '-----BEGIN PRIVATE KEY-----';
const actualHeader = formattedKey.substring(0, expectedHeader.length);

if (actualHeader !== expectedHeader) {
  console.log('❌ 錯誤：開頭不正確！');
  console.log('   預期:', expectedHeader);
  console.log('   實際:', actualHeader);
  console.log('   (這代表您的 .env 前面可能有引號或空白沒清乾淨)');
} else {
  console.log('✅ 開頭正確');
}

// 檢查是否真的有換行
const firstLineEnd = formattedKey.indexOf('\n');
if (firstLineEnd === -1) {
  console.log('❌ 錯誤：轉換後仍然沒有偵測到換行！');
  console.log('   (這代表 .env 裡的 \\n 被當作了普通文字，或者您複製時變成了真實換行)');
} else {
  console.log('✅ 成功偵測到換行符號');
  console.log('   第一行內容:', formattedKey.substring(0, firstLineEnd));
}

console.log('--- 診斷結束 ---');