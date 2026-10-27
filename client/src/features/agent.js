import api from "../utils/axios.js";

export const sendAgentMessage = (prompt, conversationId, saveUserMessage, options) =>
  api.post(
    "/api/agent/chat",
    { prompt, conversationId, saveUserMessage },
    options,
  );
