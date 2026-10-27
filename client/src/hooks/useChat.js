import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addConversation,
  removeConversation,
  setActiveConversationId,
  setConversation,
  updateConversationTitle as updateConversationTitleInStore,
} from "../redux/conversation.slice.js";
import {
  addMessage,
  setMessages,
  clearMessages,
} from "../redux/message.slice.js";
import {
  createConversation,
  createMessage,
  deleteConversation,
  getConversations,
  getMessages,
  updateConversationTitle as updateConversationTitleRequest,
} from "../features/chat.js";
import { sendAgentMessage } from "../features/agent.js";

function artifactFromResponse(content, messageId) {
  const codeBlock = content.match(/```([a-zA-Z0-9_+-]*)\s*\n([\s\S]*?)```/);
  if (!codeBlock) return null;

  const language = codeBlock[1].toLowerCase();
  const type =
    language === "html"
      ? "html"
      : language === "md" || language === "markdown"
        ? "markdown"
        : "code";
  return {
    id: `${messageId}-artifact`,
    title: type === "html" ? "Generated webpage" : "Generated code",
    type,
    language: language || "text",
    content: codeBlock[2],
  };
}

export default function useChat() {
  const dispatch = useDispatch();
  const { conversations, activeId } = useSelector(
    (state) => state.conversation,
  );
  const messages = useSelector((state) => state.message.messages);
  const [chatLoading, setChatLoading] = useState(false);
  const [artifact, setArtifact] = useState(null);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationError, setConversationError] = useState("");
  const [chatError, setChatError] = useState("");
  const activeIdRef = useRef(null);
  const navigationRef = useRef(0);
  const requestRef = useRef(null);
  const pendingNewConversationRef = useRef(new Set());

  useEffect(() => {
    const controller = new AbortController();
    const loadConversations = async () => {
      setConversationsLoading(true);
      setConversationError("");
      try {
        const { data } = await getConversations({ signal: controller.signal });
        dispatch(setConversation(
          data.map((conversation) => ({
            ...conversation,
            id: conversation._id || conversation.id,
            title: conversation.title || "New chat",
          })),
        ));
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Unable to load conversations:", err);
          setConversationError("Could not load your conversations. Please refresh to try again.");
        }
      } finally {
        if (!controller.signal.aborted) setConversationsLoading(false);
      }
    };
    loadConversations();
    return () => controller.abort();
  }, [dispatch]);

  useEffect(() => {
    if (!activeId) return undefined;
    if (pendingNewConversationRef.current.has(activeId)) {
      pendingNewConversationRef.current.delete(activeId);
      return undefined;
    }

    const controller = new AbortController();
    const navigationAtStart = navigationRef.current;

    getMessages(activeId, { signal: controller.signal })
      .then(({ data }) => {
        if (navigationRef.current !== navigationAtStart) return;
        dispatch(setMessages(
          [...data]
            .reverse()
            .map((message) => ({
              ...message,
              id: message._id || message.id,
              content: message.content || "",
              artifact:
                message.role === "assistant"
                  ? artifactFromResponse(message.content || "", message._id || message.id)
                  : undefined,
            })),
        ));
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("Unable to load messages:", err);
          setChatError("Could not load this conversation. Please try selecting it again.");
        }
      });

    return () => controller.abort();
  }, [activeId, dispatch]);

  const handleSend = async (text, { regenerate = false } = {}) => {
    if (chatLoading || requestRef.current) return;
    const navigationAtStart = navigationRef.current;
    let conversationId = activeIdRef.current;
    if (!regenerate) {
      const userMessage = { id: crypto.randomUUID(), role: "user", content: text };
      dispatch(addMessage(userMessage));
    }
    setChatError("");
    setChatLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      if (!conversationId) {
        const { data } = await createConversation({ signal: controller.signal });
        conversationId = data._id || data.id;
        if (!conversationId) throw new Error("The server did not return a conversation ID.");

        const title = text.trim().replace(/\s+/g, " ").slice(0, 60) || "New chat";
        const conversation = {
          ...data,
          id: conversationId,
          title,
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
        dispatch(addConversation(conversation));
        if (navigationRef.current === navigationAtStart) {
          pendingNewConversationRef.current.add(conversationId);
          activeIdRef.current = conversationId;
          dispatch(setActiveConversationId(conversationId));
        }
        try {
          await updateConversationTitleRequest(conversationId, title, {
            signal: controller.signal,
          });
        } catch (err) {
          if (controller.signal.aborted) throw err;
          console.error("Unable to update conversation title:", err);
          setChatError("The conversation was created, but its title could not be saved.");
        }
      }

      const { data } = await sendAgentMessage(
        text,
        conversationId,
        !regenerate,
        { signal: controller.signal },
      );
      const content =
        typeof data === "string"
          ? data
          : data?.content || data?.message || data?.response || "";
      if (!content.trim()) throw new Error("The agent returned an empty response.");

      const assistantId = crypto.randomUUID();
      const assistantMessage = {
        id: assistantId,
        role: "assistant",
        content,
        agent: typeof data === "object" ? data.agent : undefined,
        steps: typeof data === "object" ? data.steps : undefined,
        artifact:
          artifactFromResponse(content, assistantId) ||
          (typeof data === "object" ? data.artifact : undefined),
      };

      try {
        const { data: savedMessage } = await createMessage(
          conversationId,
          "assistant",
          content,
          { signal: controller.signal },
        );
        assistantMessage.id = savedMessage._id || assistantMessage.id;
      } catch (err) {
        console.error("Unable to save assistant response:", err);
        setChatError("The response was generated, but could not be saved to conversation history.");
      }
      if (activeIdRef.current === conversationId) {
        dispatch(addMessage(assistantMessage));
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error("Chat request failed:", err);
        setChatError(err.response?.data?.message || err.message || "Could not send your message. Please try again.");
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setChatLoading(false);
      }
    }
  };

  const handleNewChat = () => {
    navigationRef.current += 1;
    activeIdRef.current = null;
    dispatch(setActiveConversationId(null));
    dispatch(clearMessages());
    setArtifact(null);
    setChatError("");
  };

  const handleSelectConversation = (id) => {
    navigationRef.current += 1;
    activeIdRef.current = id;
    dispatch(clearMessages());
    setChatError("");
    setArtifact(null);
    dispatch(setActiveConversationId(id));
  };

  const handleDeleteConversation = async (id) => {
    setConversationError("");
    try {
      await deleteConversation(id);
      dispatch(removeConversation(id));
      if (activeIdRef.current === id) handleNewChat();
    } catch (err) {
      console.error("Unable to delete conversation:", err);
      setConversationError(err.response?.data?.message || "Could not delete this conversation.");
    }
  };

  const handleUpdateConversationTitle = async (id, title) => {
    setConversationError("");
    try {
      await updateConversationTitleRequest(id, title);
      dispatch(updateConversationTitleInStore({ id, title }));
      return true;
    } catch (err) {
      console.error("Unable to update conversation title:", err);
      setConversationError(err.response?.data?.message || "Could not update this conversation title.");
      return false;
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (lastUserMessage) handleSend(lastUserMessage.content, { regenerate: true });
  };

  return {
    conversations,
    activeId,
    messages,
    chatLoading,
    artifact,
    setArtifact,
    conversationsLoading,
    conversationError,
    setConversationError,
    chatError,
    handleSend,
    handleNewChat,
    handleSelectConversation,
    handleDeleteConversation,
    handleUpdateConversationTitle,
    handleStop: () => requestRef.current?.abort(),
    handleRegenerate,
  };
}
