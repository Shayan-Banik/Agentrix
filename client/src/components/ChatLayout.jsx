import { useState } from "react";
import { APP_NAME } from "../constants/constants.js";
import useChat from "../hooks/useChat.js";
import SideBar from "./SideBar.jsx";
import ChatArea from "./ChatArea.jsx";
import Artifact from "./Artifact.jsx";

export default function ChatLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 768,
  );
  const [artifactOpen, setArtifactOpen] = useState(false);
  const {
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
    handleStop,
    handleRegenerate,
  } = useChat();

  const handleLogout = async () => {
    setConversationError("");
    const loggedOut = await onLogout();
    if (!loggedOut) {
      setConversationError("Could not securely sign out. Please try again.");
    }
  };

  const activeTitle =
    conversations.find((conversation) => conversation.id === activeId)?.title ||
    "New chat";

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-[#0b101a] text-slate-100">
      <SideBar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        appName={APP_NAME}
        conversations={conversations}
        conversationsLoading={conversationsLoading}
        error={conversationError}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onDelete={handleDeleteConversation}
        onUpdateTitle={handleUpdateConversationTitle}
        user={{ name: user?.name, email: user?.email }}
        onLogout={handleLogout}
      />

      <ChatArea
        title={activeTitle}
        messages={messages}
        loading={chatLoading}
        error={chatError}
        onSend={handleSend}
        onStop={handleStop}
        onRegenerate={handleRegenerate}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(true)}
        onOpenArtifact={(selectedArtifact) => {
          setArtifact(selectedArtifact);
          setArtifactOpen(true);
        }}
        activeArtifactId={artifactOpen ? artifact?.id : undefined}
      />

      <Artifact
        artifact={artifact}
        open={artifactOpen}
        onOpen={() => setArtifactOpen(true)}
        onClose={() => setArtifactOpen(false)}
      />
    </div>
  );
}
