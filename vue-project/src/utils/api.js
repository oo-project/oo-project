import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  //baseURL: 'http://localhost:3000', // 本地開發用
});

export default api;