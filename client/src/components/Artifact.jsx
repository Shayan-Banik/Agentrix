import { useEffect, useMemo, useState } from "react";
import { FiX, FiCopy, FiCheck, FiDownload, FiEye, FiCode } from "react-icons/fi";
import { ARTIFACT_FILE_EXTENSIONS } from "../constants/constants.js";

const iconBtn =
  "rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

export default function Artifact({ artifact, onClose }) {
  const [tabState, setTabState] = useState({ id: null, tab: "preview" });
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const id = artifact?.id;
  const tab = tabState.id === id ? tabState.tab : "preview";
  const content = artifact?.content ?? "";
  const lines = useMemo(() => content.split("\n"), [content]);

  // close on Escape
  useEffect(() => {
    if (!artifact) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [artifact, onClose]);

  if (!artifact) return null;

  const canPreview = artifact.type === "html" || artifact.type === "markdown";
  const activeTab = canPreview ? tab : "code";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setCopyError("");
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Unable to copy artifact:", error);
      setCopyError("Clipboard access is unavailable. You can still select and copy the content.");
    }
  };

  const download = () => {
    const ext =
      artifact.type === "html"
        ? "html"
        : artifact.type === "markdown"
        ? "md"
        : ARTIFACT_FILE_EXTENSIONS[artifact.language?.toLowerCase()] || "txt";
    const base =
      artifact.title.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "artifact";
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabBtn = (name, Icon, label) => (
    <button
      type="button"
      onClick={() => setTabState({ id, tab: name })}
      aria-pressed={activeTab === name}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        activeTab === name
          ? "bg-white/10 font-medium text-white shadow-sm"
          : "text-slate-400 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <aside
      aria-label={`Artifact: ${artifact.title}`}
      className="fixed inset-0 z-50 flex flex-col border-white/5 bg-[#0e1420] text-slate-100 md:static md:z-auto md:w-[900px] md:shrink-0 md:border-l lg:w-[560px]"
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 px-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium text-white">{artifact.title}</h2>
          <p className="truncate text-xs text-slate-400">
            {artifact.type === "html" ? "Web page" : artifact.language || artifact.type}
          </p>
        </div>

        {canPreview && (
          <div className="flex rounded-lg bg-white/5 p-0.5" role="group" aria-label="View">
            {tabBtn("preview", FiEye, "Preview")}
            {tabBtn("code", FiCode, "Code")}
          </div>
        )}

        <button type="button" onClick={copy} aria-label="Copy" className={iconBtn}>
          {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
        </button>
        <button type="button" onClick={download} aria-label="Download" className={iconBtn}>
          <FiDownload className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClose} aria-label="Close artifact" className={iconBtn}>
          <FiX className="h-5 w-5" />
        </button>
      </header>

      {copyError && (
        <p className="border-b border-white/5 px-4 py-2 text-sm text-red-400" role="alert">
          {copyError}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        {activeTab === "preview" && artifact.type === "html" && (
          <iframe
            title={artifact.title}
            sandbox="allow-scripts"
            srcDoc={content}
            className="h-full w-full border-0 bg-white"
          />
        )}

        {activeTab === "preview" && artifact.type === "markdown" && (
          <div className="whitespace-pre-wrap p-6 text-[15px] leading-7 text-slate-200">{content}</div>
        )}

        {activeTab === "code" && (
          <pre className="min-w-full p-4 font-mono text-[13px] leading-6 text-slate-200">
            <code>
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="mr-4 w-8 shrink-0 select-none text-right text-slate-600">
                    {i + 1}
                  </span>
                  <span className="whitespace-pre">{line || " "}</span>
                </div>
              ))}
            </code>
          </pre>
        )}
      </div>
    </aside>
  );
}