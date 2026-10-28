import api from "../utils/axios.js";

export const getConversations = (options) =>
  api.get("/api/chat/get-conversations", options);

export const getMessages = (conversationId, options) =>
  api.get(
    `/api/chat/get-messages/${encodeURIComponent(conversationId)}`,
    options,
  );

export const createConversation = (options) =>
  api.post("/api/chat/create-conversations", {}, options);

export const updateConversationTitle = (conversationId, title, options) =>
  api.put(
    "/api/chat/update-conversation-title",
    { conversationId, title },
    options,
  );

export const createMessage = (
  conversationId,
  role,
  content,
  images,
  artifacts,
  options,
) =>
  api.post(
    "/api/chat/create-messages",
    { conversationId, role, content, images, artifacts },
    options,
  );

export const deleteConversation = (conversationId) =>
  api.delete(
    `/api/chat/delete-conversation/${encodeURIComponent(conversationId)}`,
  );
