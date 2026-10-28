import { useEffect, useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import {
  FiX,
  FiCopy,
  FiCheck,
  FiDownload,
  FiEye,
  FiCode,
  FiFolder,
  FiFile,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";
import { ARTIFACT_FILE_EXTENSIONS } from "../constants/constants.js";

const iconBtn =
  "rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("html", markup);
SyntaxHighlighter.registerLanguage("markup", markup);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("py", python);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("ts", typescript);

export default function Artifact({ artifact, open = true, onOpen, onClose }) {
  const [tabState, setTabState] = useState({ id: null, tab: "preview" });
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [expanded, setExpanded] = useState(false);

  const id = artifact?.id;
  const tab = tabState.id === id ? tabState.tab : "preview";
  const projectFiles = Array.isArray(artifact?.files) ? artifact.files : [];
  const activeFile = projectFiles.find((file) => file.name === selectedFile) || projectFiles[0];
  const content = projectFiles.length ? activeFile?.content || "" : artifact?.content ?? "";
  const displayedFileName = activeFile?.name || artifact?.title || "artifact";
  const codeLanguage = activeFile?.language || artifact?.language || "text";

  // close on Escape
  useEffect(() => {
    if (!artifact) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [artifact, onClose]);

  if (!artifact) return null;

  if (!open) {
    return (
      <aside className="z-40 hidden shrink-0 items-center border-l border-white/5 bg-[#0e1420] md:flex">
        <button
          type="button"
          onClick={onOpen}
          title="Open artifact"
          aria-label="Open artifact"
          className="group flex h-full w-11 flex-col items-center gap-3 py-4 text-slate-400 transition hover:bg-white/4 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400"
        >
          <FiChevronLeft className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <FiCode className="h-4 w-4 shrink-0 text-indigo-300" />
          <span className="max-h-44 overflow-hidden text-[10px] font-semibold uppercase tracking-[0.22em] [writing-mode:vertical-rl]">
            {artifact.title}
          </span>
        </button>
      </aside>
    );
  }

  const canPreview =
    artifact.type === "html" ||
    artifact.type === "markdown" ||
    (artifact.type === "project" && projectFiles.some((file) => file.name === "index.html"));
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
    const name = activeFile?.name || artifact.title || "artifact";
    const extension = name.includes(".")
      ? name.split(".").pop()
      : artifact.type === "html"
        ? "html"
        : artifact.type === "markdown"
          ? "md"
          : ARTIFACT_FILE_EXTENSIONS[artifact.language?.toLowerCase()] || "txt";
    const base =
      name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "artifact";
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewDocument = () => {
    if (artifact.type !== "project") return content;
    const htmlFile = projectFiles.find((file) => file.name === "index.html");
    const html = htmlFile?.content || "";
    const styles = projectFiles
      .filter((file) => file.name.endsWith(".css"))
      .map((file) => file.content)
      .join("\n");
    const scripts = projectFiles
      .filter((file) => file.name.endsWith(".js"))
      .map((file) => file.content)
      .join("\n;");
    return html
      .replace("</head>", `<style>${styles}</style></head>`)
      .replace("</body>", `<script>${scripts}</script></body>`);
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
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <aside
      aria-label={`Artifact: ${artifact.title}`}
      className={`fixed right-0 top-0 z-50 flex h-dvh flex-col border-l border-white/10 bg-[#0e1420] text-slate-100 shadow-2xl shadow-black/40 ${
        expanded
          ? "inset-0 w-full max-w-none"
          : "bottom-0 w-full max-w-[92vw] md:static md:inset-auto md:z-20 md:w-[min(46vw,620px)] md:max-w-none md:shrink-0 lg:w-140"
      }`}
    >
      <header className="flex h-16 shrink-0 items-center gap-1 border-b border-white/5 px-2 sm:h-14 sm:gap-2 sm:px-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-white" title={artifact.title}>{artifact.title}</h2>
          <p className="flex min-w-0 items-center gap-1 truncate font-mono text-xs text-indigo-300" title={displayedFileName}>
            <FiFile className="h-3 w-3 shrink-0" />
            <span className="truncate">{displayedFileName}</span>
          </p>
        </div>

        {canPreview && (
          <div className="flex rounded-lg bg-white/5 p-0.5" role="group" aria-label="View">
            {tabBtn("preview", FiEye, "Preview")}
            {tabBtn("code", FiCode, "Code")}
          </div>
        )}

        <button type="button" onClick={copy} title="Copy generated file" aria-label="Copy generated file" className={iconBtn}>
          {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
        </button>
        <button type="button" onClick={download} title="Download generated file" aria-label="Download generated file" className={iconBtn}>
          <FiDownload className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          title={expanded ? "Restore artifact panel" : "Expand artifact to full width"}
          aria-label={expanded ? "Restore artifact panel" : "Expand artifact to full width"}
          className={iconBtn}
        >
          {expanded ? <FiMinimize2 className="h-4 w-4" /> : <FiMaximize2 className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onClose} title="Close artifact panel" aria-label="Close artifact" className={iconBtn}>
          <FiX className="h-5 w-5 md:hidden" />
          <FiChevronRight className="hidden h-5 w-5 md:block" />
        </button>
      </header>

      {copyError && (
        <p className="border-b border-white/5 px-4 py-2 text-sm text-red-400" role="alert">
          {copyError}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === "preview" && artifact.type === "project" && (
          <div className="flex h-full">
            <nav aria-label="Project files" className="w-32 shrink-0 overflow-y-auto border-r border-white/5 bg-[#0c111b] p-2 sm:w-44">
              <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <FiFolder className="h-4 w-4" /> Files
              </div>
              {projectFiles.map((file) => (
                <button
                  key={file.name}
                  type="button"
                  onClick={() => setSelectedFile(file.name)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                    activeFile?.name === file.name
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <FiFile className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </nav>
            <iframe
              title={`${artifact.title} preview`}
              sandbox="allow-scripts"
              srcDoc={previewDocument()}
              className="h-full min-w-0 flex-1 border-0 bg-white"
            />
          </div>
        )}

        {activeTab === "preview" && artifact.type === "html" && (
          <iframe
            title={artifact.title}
            sandbox="allow-scripts"
            srcDoc={content}
            className="h-full w-full border-0 bg-white"
          />
        )}

        {activeTab === "preview" && artifact.type === "markdown" && (
          <div className="h-full overflow-auto whitespace-pre-wrap p-6 text-[15px] leading-7 text-slate-200">{content}</div>
        )}

        {activeTab === "code" && (
          <div className="flex h-full">
            {projectFiles.length > 0 && (
              <nav aria-label="Project files" className="w-32 shrink-0 overflow-y-auto border-r border-white/5 bg-[#0c111b] p-2 sm:w-44">
                {projectFiles.map((file) => (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => setSelectedFile(file.name)}
                    className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${
                      activeFile?.name === file.name ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <FiFile className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </nav>
            )}
            <SyntaxHighlighter
              language={codeLanguage}
              style={oneDark}
              showLineNumbers
              wrapLines
              wrapLongLines
              className="min-w-0 flex-1! overflow-y-auto! font-mono"
              customStyle={{
                margin: 0,
                minHeight: "100%",
                padding: "1rem",
                background: "#111318",
                fontSize: "13px",
                lineHeight: "1.65",
              }}
              lineNumberStyle={{
                minWidth: "2.75rem",
                paddingRight: "1rem",
                marginRight: "0.75rem",
                color: "#64748b",
                userSelect: "none",
              }}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </aside>
  );
}