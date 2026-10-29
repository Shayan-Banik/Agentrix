import { FiFileText, FiImage, FiMonitor, FiX } from "react-icons/fi";

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AttachmentChip({ item, onRemove }) {
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
        <p className="truncate text-xs font-medium text-slate-200">
          {item.file.name}
        </p>
        <p className="text-[11px] text-slate-500">
          {formatSize(item.file.size)}
        </p>
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
