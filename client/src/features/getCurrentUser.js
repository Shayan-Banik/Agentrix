import api from "../utils/axios.js";

export const getCurrentUser = async () => {
    try {
        const { data } = await api.get("/api/me");
        return data;
    } catch (error) {
        console.error("Error fetching usersss:", error);
        return null;
    }
};