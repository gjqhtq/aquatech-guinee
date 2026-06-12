import axios from 'axios';

// En dev, le proxy de react-scripts redirige /api → localhost:5000/api
// En production, on utilise le chemin relatif vers le même domaine
const BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
}, (err) => Promise.reject(err));

export default api;
