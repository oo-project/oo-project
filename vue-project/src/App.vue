<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* 全域字型設定保留在這裡 */
@font-face {
  font-family: "Iansui";
  src: url("/src/assets/fonts/Iansui-Regular.woff2") format("woff2"),
       url("/src/assets/fonts/Iansui-Regular.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Iansui", sans-serif;
  background: #f2e6dc; /* 背景色也可以放這裡，確保切換頁面時不會閃白 */
}
</style>