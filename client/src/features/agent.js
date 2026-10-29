import api from "../utils/axios.js";

export const getAvailableAgents = (options) =>
  api.get("/api/agent/agents", options);

export const sendAgentMessage = (
  prompt,
  conversationId,
  saveUserMessage,
  agentMode,
  options,
) =>
  api.post(
    "/api/agent/chat",
    {
      prompt,
      conversationId,
      saveUserMessage,
      agentMode,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    options,
  );
