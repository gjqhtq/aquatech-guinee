import axios from 'axios';

// En dev, le proxy de react-scripts redirige /api → localhost:5000/api
// En prod ou accès par IP, on utilise l'hôte courant du navigateur
const BASE = process.env.REACT_APP_API_URL
  || (process.env.NODE_ENV === 'development'
    ? '/api'
    : `${window.location.protocol}//${window.location.hostname}:5000/api`);

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
