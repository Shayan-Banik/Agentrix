import { useState, useRef, useEffect, useCallback } from "react";
import {
  FiArrowUp,
  FiSquare,
  FiPaperclip,
  FiMic,
  FiX,
  FiFileText,
  FiImage,
  FiMonitor,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { SearchAGENTS } from "../constants/constants.js";

const ACCEPT =
  "image/*,application/pdf,.pdf,.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";
const MAX_FILES = 5;
const MAX_MB = 20;

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

function fileKind(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  return "ppt";
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function AttachmentChip({ item, onRemove }) {
  const Icon =
    item.kind === "image" ? FiImage : item.kind === "pdf" ? FiFileText : FiMonitor;
  return (
    <div className="group relative flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3">
      {item.kind === "image" ? (
        <img
          src={item.preview}
          alt={item.file.name}
          className="h-10 w-10 rounded-lg object-cover"
        />
      ) : (
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-500/20 text-indigo-200">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0 max-w-35 text-left">
        <p className="truncate text-xs font-medium text-slate-200">{item.file.name}</p>
        <p className="text-[11px] text-slate-500">{formatSize(item.file.size)}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.file.name}`}
        className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-slate-700 text-slate-200 opacity-0 transition hover:bg-slate-600 focus:opacity-100 focus:outline-none group-hover:opacity-100"
      >
        <FiX className="h-3 w-3" />
      </button>
    </div>
  );
}

function ChatAreaComposer({ onSend, onStop, loading }) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [agentSearch, setAgentSearch] = useState("");
  const [agentPickerOpen, setAgentPickerOpen] = useState(false);

  const ref = useRef(null);
  const fileInputRef = useRef(null);
  const agentSearchRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");

  // auto-grow textarea
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (agentPickerOpen) agentSearchRef.current?.focus();
  }, [agentPickerOpen]);

  // revoke image previews + stop mic on unmount
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  useEffect(
    () => () => {
      attachmentsRef.current.forEach((a) => a.preview && URL.revokeObjectURL(a.preview));
      recognitionRef.current?.stop();
    },
    []
  );

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    setError("");

    setAttachments((prev) => {
      const next = [...prev];
      let msg = "";
      for (const file of incoming) {
        const okType =
          file.type.startsWith("image/") ||
          file.type === "application/pdf" ||
          /\.(pdf|pptx?|PPTX?)$/.test(file.name);
        if (!okType) {
          msg = `${file.name}: only images, PDF and PPT/PPTX are supported.`;
          continue;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
          msg = `${file.name} is larger than ${MAX_MB} MB.`;
          continue;
        }
        if (next.length >= MAX_FILES) {
          msg = `You can attach up to ${MAX_FILES} files.`;
          break;
        }
        const kind = fileKind(file);
        next.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          kind,
          preview: kind === "image" ? URL.createObjectURL(file) : null,
        });
      }
      if (msg) setError(msg);
      return next;
    });
  }, []);

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((a) => a.id !== id);
    });
  };

  // ---- voice ----
  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      setError("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    setError("");
    const rec = new SpeechRecognition();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = true;
    rec.continuous = true;

    baseTextRef.current = value ? value.replace(/\s+$/, "") + " " : "";

    rec.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      setValue(baseTextRef.current + transcript);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access was blocked. Allow it in your browser settings.");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setError("Voice input error. Please try again.");
      }
      setListening(false);
    };
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const toggleMic = () => (listening ? stopListening() : startListening());

  // ---- send ----
  const canSend = value.trim().length > 0 || attachments.length > 0;

  const submit = () => {
    if (!canSend || loading) return;
    if (listening) stopListening();
    onSend?.(value.trim(), { agentMode: selectedAgent });
    attachments.forEach((a) => a.preview && URL.revokeObjectURL(a.preview));
    setAttachments([]);
    setValue("");
    setError("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  // paste images straight from the clipboard
  const onPaste = (e) => {
    const files = Array.from(e.clipboardData?.files || []);
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  };

  // drag & drop
  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const iconBtn =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
  const currentAgent =
    SearchAGENTS.find((agent) => agent.id === selectedAgent) || SearchAGENTS[0];
  const filteredAgents = SearchAGENTS.filter((agent) =>
    agent.label.toLowerCase().includes(agentSearch.trim().toLowerCase())
  );

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-4">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col rounded-2xl border bg-linear-to-b from-[#1a2133] to-[#141a29] px-3 pb-3 pt-3 shadow-xl shadow-black/30 transition focus-within:ring-2 focus-within:ring-indigo-400/50 sm:rounded-3xl sm:px-5 sm:pt-4 ${
          dragging ? "border-indigo-400/70 ring-2 ring-indigo-400/40" : "border-white/5"
        }`}
      >
        {dragging && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-3xl bg-[#101624]/90 text-sm font-medium text-indigo-200">
            Drop images, PDFs or slides here
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2.5">
            {attachments.map((a) => (
              <AttachmentChip key={a.id} item={a} onRemove={removeAttachment} />
            ))}
          </div>
        )}

        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={listening ? "Listening…" : "Message your agents"}
          aria-label="Message"
          className="max-h-50 min-h-8 w-full resize-none bg-transparent text-[15px] leading-6 text-slate-100 outline-none placeholder:text-slate-500"
        />

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAgentPickerOpen((open) => !open);
                  setAgentSearch("");
                }}
                aria-label={`Choose agent, currently ${currentAgent.label}`}
                aria-expanded={agentPickerOpen}
                aria-haspopup="listbox"
                className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <currentAgent.icon className="h-4 w-4 text-indigo-300" />
                <span>{currentAgent.label}</span>
                <FiChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {agentPickerOpen && (
                <div className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-2xl border border-white/10 bg-[#151c2b] p-2 shadow-2xl shadow-black/50">
                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
                    <FiSearch className="h-4 w-4 shrink-0 text-slate-500" />
                    <input
                      ref={agentSearchRef}
                      type="search"
                      value={agentSearch}
                      onChange={(event) => setAgentSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") setAgentPickerOpen(false);
                      }}
                      placeholder="Search agents"
                      aria-label="Search agents"
                      className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    />
                  </label>

                  <ul role="listbox" aria-label="Agents" className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                    {filteredAgents.map((agent) => {
                      const Icon = agent.icon;
                      const isSelected = agent.id === selectedAgent;
                      return (
                        <li key={agent.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedAgent(agent.id);
                              setAgentPickerOpen(false);
                              setAgentSearch("");
                            }}
                            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                              isSelected
                                ? "bg-indigo-400/15 text-indigo-100"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0 text-indigo-300" />
                            <span>{agent.label}</span>
                          </button>
                        </li>
                      );
                    })}
                    {filteredAgents.length === 0 && (
                      <li className="px-3 py-3 text-sm text-slate-500">
                        No agents found.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/*// TODO: AWS S3 integrationn upload files */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = ""; // allow re-selecting the same file
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach files"
              title="Attach image, PDF or PPT"
              className={iconBtn}
            >
              <FiPaperclip className="h-4.5 w-4.5" />
            </button>

            <button
              type="button"
              onClick={toggleMic}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              aria-pressed={listening}
              title={listening ? "Stop" : "Voice input"}
              className={`${iconBtn} ${
                listening
                  ? "relative bg-red-500/15 text-red-300 hover:bg-red-500/25 hover:text-red-200"
                  : ""
              }`}
            >
              {listening && (
                <span className="absolute inset-0 animate-ping rounded-full bg-red-400/25" />
              )}
              <FiMic className="relative h-4.5 w-4.5" />
            </button>
          </div>

          {loading ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 text-slate-200 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <FiSquare className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send message"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 text-slate-200 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiArrowUp className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-red-300">
          {error}
        </p>
      )}
      <p className="mt-2 text-center text-xs text-slate-500">
        Agents can make mistakes. Check important information.
      </p>
    </div>
  );
}

export default ChatAreaComposer;