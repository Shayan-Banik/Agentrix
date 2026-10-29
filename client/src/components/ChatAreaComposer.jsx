import { useEffect, useRef, useState } from "react";
import {
  FiArrowUp,
  FiMic,
  FiPaperclip,
  FiSquare,
} from "react-icons/fi";
import AgentPicker from "./AgentPicker.jsx";
import AttachmentChip from "./AttachmentChip.jsx";
import useAttachments from "../hooks/useAttachments.js";
import useVoiceInput from "../hooks/useVoiceInput.js";

const ACCEPT =
  "image/*,application/pdf,.pdf,.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

function AttachmentButton({ inputRef, onFilesSelected }) {
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          onFilesSelected(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Attach files"
        title="Attach image, PDF or PPT"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <FiPaperclip className="h-4.5 w-4.5" />
      </button>
    </>
  );
}

function VoiceInputButton({ listening, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      aria-pressed={listening}
      title={listening ? "Stop" : "Voice input"}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
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
  );
}

function SubmitButton({ loading, canSend, onStop, onSubmit }) {
  if (loading) {
    return (
      <button
        type="button"
        onClick={onStop}
        aria-label="Stop generating"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 text-slate-200 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <FiSquare className="h-3.5 w-3.5 fill-current" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={!canSend}
      aria-label="Send message"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 text-slate-200 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FiArrowUp className="h-5 w-5" />
    </button>
  );
}

function ChatAreaComposer({ onSend, onStop, loading }) {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const {
    attachments,
    error,
    setError,
    dragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addFiles,
    removeAttachment,
    clearAttachments,
  } = useAttachments();
  const { listening, stopListening, toggleListening } =
    useVoiceInput(value, setValue, setError);
  const canSend = value.trim().length > 0 || attachments.length > 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    if (!canSend || loading) return;
    if (listening) stopListening();
    onSend?.(value.trim(), { agentMode: selectedAgent });
    clearAttachments();
    setValue("");
    setError("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const handlePaste = (event) => {
    const files = Array.from(event.clipboardData?.files || []);
    if (files.length) {
      event.preventDefault();
      addFiles(files);
    }
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
            {attachments.map((attachment) => (
              <AttachmentChip
                key={attachment.id}
                item={attachment}
                onRemove={removeAttachment}
              />
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={listening ? "Listening…" : "Message your agents"}
          aria-label="Message"
          className="max-h-50 min-h-8 w-full resize-none bg-transparent text-[15px] leading-6 text-slate-100 outline-none placeholder:text-slate-500"
        />

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <AgentPicker value={selectedAgent} onChange={setSelectedAgent} />
            <AttachmentButton
              inputRef={fileInputRef}
              onFilesSelected={addFiles}
            />
            <VoiceInputButton
              listening={listening}
              onToggle={toggleListening}
            />
          </div>
          <SubmitButton
            loading={loading}
            canSend={canSend}
            onStop={onStop}
            onSubmit={submit}
          />
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
