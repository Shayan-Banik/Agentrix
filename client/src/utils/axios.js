import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV ? import.meta.env.VITE_SERVER_URL : undefined,
  withCredentials: true,
});

export default api;
