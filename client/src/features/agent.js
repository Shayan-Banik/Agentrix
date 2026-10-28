import api from "../utils/axios.js";

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
