import { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiSidebar,
  FiTrash2,
  FiLogOut,
  FiShare2,
  FiZap,
  FiEdit,
  FiCheck,
  FiX,
} from "react-icons/fi";
import {
  CONVERSATION_DAY_MS,
  CONVERSATION_GROUP_LABELS,
  SIDEBAR_DEFAULT_APP_NAME,
} from "../constants/constants.js";

function groupConversations(items) {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const groups = CONVERSATION_GROUP_LABELS.map((label) => ({
    label,
    items: [],
  }));
  [...items]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach((c) => {
      const t = new Date(c.updatedAt).getTime();
      if (t >= startOfToday) groups[0].items.push(c);
      else if (t >= startOfToday - CONVERSATION_DAY_MS) groups[1].items.push(c);
      else if (t >= startOfToday - 7 * CONVERSATION_DAY_MS)
        groups[2].items.push(c);
      else groups[3].items.push(c);
    });
  return groups.filter((g) => g.items.length > 0);
}

export default function SideBar({
  conversations = [],
  conversationsLoading = false,
  error = "",
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onUpdateTitle,
  user,
  onLogout,
  open = true,
  onClose,
  appName = SIDEBAR_DEFAULT_APP_NAME,
}) {
  const [query, setQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? conversations.filter((c) => (c.title || "").toLowerCase().includes(q))
      : conversations;
    return groupConversations(list);
  }, [conversations, query]);

  const handleSelect = (id) => {
    onSelect?.(id);
    if (typeof window !== "undefined" && window.innerWidth < 768) onClose?.();
  };

  const startEditing = (conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveTitle = async (id) => {
    const title = editTitle.trim();
    if (!title || savingTitle) return;

    setSavingTitle(true);
    try {
      const saved = await onUpdateTitle?.(id, title);
      if (saved) cancelEditing();
    } finally {
      setSavingTitle(false);
    }
  };

  useEffect(() => {
  if (!showLogoutConfirm) return;
  const onKey = (e) => e.key === "Escape" && setShowLogoutConfirm(false);
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [showLogoutConfirm]);

  const iconBtn =
    "rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

  return (
    <>
      {/* mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Conversations"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-40 shrink-0 overflow-hidden bg-[#0b101a] text-slate-100 transition-all duration-200 md:static md:z-auto ${
          open
            ? "w-72 translate-x-0 border-r border-white/5 md:border-r-0"
            : "invisible w-72 -translate-x-full md:w-0 md:translate-x-0"
        }`}>
        <div className="flex h-full w-72 flex-col">
          {/* header */}
          <div className="flex items-center justify-between px-4 pt-5">
            <div className="flex items-center gap-3 px-1">
              <span className="grid h-9 w-9 place-items-center text-white">
                <FiShare2 className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <span className="text-2xl font-semibold tracking-tight text-white">
                {appName}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className={iconBtn}>
              <FiSidebar className="h-5 w-5" />
            </button>
          </div>

          {/* new chat + search */}
          <div className="space-y-1 px-4 pt-8">
            <button
              type="button"
              onClick={() => {
                onNewChat?.();
                if (typeof window !== "undefined" && window.innerWidth < 768)
                  onClose?.();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-slate-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
              <FiPlus className="h-5 w-5" />
              New chat
            </button>

            <label className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 focus-within:ring-2 focus-within:ring-indigo-400 hover:bg-white/5">
              <FiSearch className="h-5 w-5 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats"
                aria-label="Search chats"
                className="w-full bg-transparent text-[15px] text-slate-100 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          {/* history */}
          <nav
            className="mt-2 flex-1 overflow-y-auto px-4 pb-3"
            aria-label="Chat history">
            {error && (
              <p className="px-3 py-3 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            {conversationsLoading && (
              <p className="px-3 py-6 text-sm text-slate-400" role="status">
                Loading conversations…
              </p>
            )}
            {!conversationsLoading && groups.length === 0 && (
              <p className="px-3 py-6 text-sm text-slate-500">
                {query
                  ? "No chats match your search."
                  : "Your chats will appear here."}
              </p>
            )}

            {groups.map((group) => (
              <section key={group.label}>
                <h3 className="px-3 pb-1 pt-5 text-xs font-medium text-slate-500">
                  {group.label}
                </h3>
                <ul className="space-y-0.5">
                  {group.items.map((c) => {
                    const active = c.id === activeId;
                    const editing = c.id === editingId;
                    return (
                      <li key={c.id} className="group relative">
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute -left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                          />
                        )}
                        {editing ? (
                          <form
                            className="flex items-center gap-1"
                            onSubmit={(event) => {
                              event.preventDefault();
                              saveTitle(c.id);
                            }}
                          >
                            <input
                              autoFocus
                              aria-label="Conversation title"
                              value={editTitle}
                              onChange={(event) => setEditTitle(event.target.value)}
                              maxLength={100}
                              disabled={savingTitle}
                              className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none focus:border-indigo-400"
                            />
                            <button
                              type="submit"
                              disabled={savingTitle || !editTitle.trim()}
                              aria-label="Save conversation title"
                              className="rounded-md p-1.5 text-slate-400 hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FiCheck className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={savingTitle}
                              aria-label="Cancel editing title"
                              className="rounded-md p-1.5 text-slate-400 hover:text-white disabled:opacity-50"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </form>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSelect(c.id)}
                              aria-current={active ? "page" : undefined}
                              className={`w-full truncate rounded-lg px-3 py-2.5 pr-16 text-left text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                                active
                                  ? "bg-white/5 text-white"
                                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                              }`}
                            >
                              {c.title}
                            </button>
                            {onUpdateTitle && (
                              <button
                                type="button"
                                onClick={() => startEditing(c)}
                                aria-label={`Edit title of ${c.title}`}
                                className="absolute right-8 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:text-green-400 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                              >
                                <FiEdit className="z-30 h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(c.id)}
                            aria-label={`Delete ${c.title}`}
                            className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:text-red-400 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 ${editing ? "hidden" : ""}`}>
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>

          {/* user */}
          {user && (
            <div className="space-y-3 border-t border-white/5 p-3">
              <section
                aria-label="Plan and token billing"
                className="relative overflow-hidden rounded-xl border border-indigo-300/10 bg-gradient-to-br from-indigo-500/15 via-[#151b2b] to-[#111726] p-3.5"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-7 -top-8 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl"
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-indigo-300/15 bg-indigo-400/10 text-indigo-200">
                      <FiZap className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                        Your plan
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-white">
                        Free plan
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400">
                    CURRENT
                  </span>
                </div>
                <div className="relative mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                  <p className="text-xs text-slate-400">
                    Token packs and billing
                  </p>
                  <span className="text-[10px] font-medium text-indigo-200/80">
                    Coming soon
                  </span>
                </div>
              </section>

              <div className="flex items-center gap-3 px-1 py-1">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 text-sm font-semibold text-white ring-2 ring-white/10"
                >
                  {(user.name || user.email || "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">
                    {user.name || "Account"}
                  </p>
                  {user.email && (
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  )}
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    aria-label="Sign out"
                    title="Sign out"
                    className={iconBtn}
                  >
                    <FiLogOut className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showLogoutConfirm && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
                  onClick={() => setShowLogoutConfirm(false)}>
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="logout-title"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111726] p-6 shadow-2xl shadow-black/50"
                    style={{
                      backgroundImage:
                        "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,91,200,0.22), transparent 70%)",
                    }}>
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-red-500/10 text-red-400">
                      <FiLogOut className="h-5 w-5" />
                    </div>

                    <h2
                      id="logout-title"
                      className="mt-4 text-lg font-semibold text-white">
                      Log out?
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-400">
                      You&apos;ll need to sign in again to continue chatting
                      with your agents.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        autoFocus
                        onClick={() => setShowLogoutConfirm(false)}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLogoutConfirm(false);
                          onLogout?.();
                        }}
                        className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
