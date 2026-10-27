import { useEffect, useRef, useState } from "react";
import {
  FiMenu,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiChevronDown,
  FiLoader,
  FiFileText,
  FiShare2,
} from "react-icons/fi";
import { DEFAULT_SUGGESTIONS, STARS } from "../constants/constants.js";
import EmptyState from "./EmptyState.jsx";
import ChatAreaComposer from "./ChatAreaComposer.jsx";

const iconBtn =
  "rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

function Starfield() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map(([x, y, s, o], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: s,
            height: s,
            opacity: o,
          }}
        />
      ))}
    </div>
  );
}

function AssistantAvatar() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-indigo-300">
      <FiShare2 className="h-3.5 w-3.5" />
    </span>
  );
}

function AgentSteps({ steps }) {
  const [open, setOpen] = useState(false);
  const running = steps.some((s) => s.status === "running");

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
        {running ? (
          <FiLoader className="h-4 w-4 motion-safe:animate-spin" />
        ) : (
          <FiCheck className="h-4 w-4" />
        )}
        {running ? "Agents are working…" : `${steps.length} agent steps`}
        <FiChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ol className="mt-2 space-y-2 border-l border-white/10 pl-4">
          {steps.map((s, i) => (
            <li key={i} className="text-sm leading-relaxed">
              <span className="font-medium text-slate-200">{s.agent}</span>{" "}
              <span className="text-slate-400">{s.text}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ArtifactCard({ artifact, active, onOpen }) {
  const label =
    artifact.type === "html" ? "Web page" : artifact.language || "Code";
  return (
    <button
      type="button"
      onClick={() => onOpen?.(artifact)}
      className={`mt-4 flex w-full max-w-md items-center gap-3 rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        active
          ? "border-indigo-400/60 bg-indigo-400/10"
          : "border-white/10 bg-white/2 hover:bg-white/5"
      }`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-slate-300">
        <FiFileText className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-white">
          {artifact.title}
        </span>
        <span className="block text-xs text-slate-400">{label}</span>
      </span>
    </button>
  );
}

function AssistantMessage({
  message,
  isLast,
  onRegenerate,
  onOpenArtifact,
  activeArtifactId,
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex gap-3">
      <AssistantAvatar />
      <div className="min-w-0 flex-1">
        {message.agent && (
          <p className="mb-1 text-sm font-medium text-slate-200">
            {message.agent}
          </p>
        )}
        {message.steps?.length > 0 && <AgentSteps steps={message.steps} />}

        <p className="break-words whitespace-pre-wrap text-[15px] leading-7 text-slate-200 [overflow-wrap:anywhere]">
          {message.content}
        </p>

        {message.artifact && (
          <ArtifactCard
            artifact={message.artifact}
            active={message.artifact.id === activeArtifactId}
            onOpen={onOpenArtifact}
          />
        )}

        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={copy}
            aria-label="Copy response"
            className={iconBtn}>
            {copied ? (
              <FiCheck className="h-4 w-4" />
            ) : (
              <FiCopy className="h-4 w-4" />
            )}
          </button>
          {isLast && onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              aria-label="Regenerate response"
              className={iconBtn}>
              <FiRefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UserMessage({ message }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] break-words whitespace-pre-wrap rounded-3xl border border-white/5 bg-[#1b2336] px-4 py-2.5 text-[15px] leading-7 text-slate-100 [overflow-wrap:anywhere]">
        {message.content}
      </p>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex gap-3" role="status" aria-label="Agents are thinking">
      <AssistantAvatar />
      <div className="flex items-center gap-1.5 pt-2.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-indigo-300/70 motion-safe:animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatArea({
  title = "New chat",
  messages = [],
  loading = false,
  onSend,
  onStop,
  onRegenerate,
  onOpenArtifact,
  activeArtifactId,
  error = "",
  sidebarOpen = true,
  onToggleSidebar,
  suggestions = DEFAULT_SUGGESTIONS,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const showThinking = loading;
  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <section
      aria-label="Chat"
      className={`flex h-full min-w-0 flex-1 flex-col bg-[#0b101a] p-1.5 text-slate-100 sm:p-2 md:p-4 ${
        sidebarOpen ? "md:pl-0" : ""
      }`}>
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#111726]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 45% 45% at 50% 28%, rgba(79,91,200,0.30), rgba(79,91,200,0.08) 55%, transparent 80%)",
        }}>
        <Starfield />

        <header         className="relative z-10 flex h-12 shrink-0 items-center gap-1.5 px-2 sm:h-14 sm:gap-2 sm:px-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Open sidebar"
            className={`${iconBtn} p-2 ${sidebarOpen ? "md:hidden" : ""}`}>
            <FiMenu className="h-5 w-5" />
          </button>
          
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)]" />
            </span>
            <h2 className="min-w-0 truncate bg-linear-to-r from-white to-indigo-300 bg-clip-text text-[13px] font-semibold tracking-wide text-transparent sm:text-sm">
              {title}
            </h2>
          </div>
        </header>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {messages.length === 0 ? (
            <EmptyState suggestions={suggestions} onPick={(s) => onSend?.(s)} />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 px-3 py-4 sm:space-y-8 sm:px-4 sm:py-6">
              {messages.map((m) =>
                m.role === "user" ? (
                  <UserMessage key={m.id} message={m} />
                ) : (
                  <AssistantMessage
                    key={m.id}
                    message={m}
                    isLast={m.id === lastAssistantId && !loading}
                    onRegenerate={onRegenerate}
                    onOpenArtifact={onOpenArtifact}
                    activeArtifactId={activeArtifactId}
                  />
                ),
              )}
              {showThinking && <Thinking />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <p
            className="relative z-10 mx-auto w-full max-w-3xl px-3 pb-2 text-sm text-red-400 sm:px-4"
            role="alert">
            {error}
          </p>
        )}
        <ChatAreaComposer onSend={onSend} onStop={onStop} loading={loading} />
      </div>
    </section>
  );
}
