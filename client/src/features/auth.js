import api from "../utils/axios.js";

export const loginWithGoogle = (token) => api.post("/api/auth/login", { token });

export const logout = () => api.post("/api/auth/logout");
