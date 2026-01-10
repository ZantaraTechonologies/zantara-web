// src/api/API.ts
import axios from 'axios';

const baseURL = "https://vtu-backend-xdmg.onrender.com/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: 'application/json' },
  timeout: 20000,
});

export default API;
