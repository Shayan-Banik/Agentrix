import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiCpu, FiSearch, FiZap } from "react-icons/fi";
import useAgentCatalog, { AUTO_AGENT } from "../hooks/useAgentCatalog.js";

export default function AgentPicker({ value, onChange }) {
  const { agents, error } = useAgentCatalog();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);
  const currentAgent = agents.find((agent) => agent.id === value) || AUTO_AGENT;
  const filteredAgents = agents.filter((agent) =>
    agent.label.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const CurrentIcon =
    currentAgent.id === AUTO_AGENT.id ? FiZap : currentAgent.icon || FiCpu;

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const togglePicker = () => {
    setOpen((isOpen) => !isOpen);
    setSearch("");
  };

  const selectAgent = (agentId) => {
    onChange(agentId);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <div className="relative">
        <button
          type="button"
          onClick={togglePicker}
          aria-label={`Choose agent, currently ${currentAgent.label}`}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <CurrentIcon className="h-4 w-4 text-indigo-300" />
          <span>{currentAgent.label}</span>
          <FiChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>

        {open && (
          <div className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-2xl border border-white/10 bg-[#151c2b] p-2 shadow-2xl shadow-black/50">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
              <FiSearch className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setOpen(false);
                }}
                placeholder="Search agents"
                aria-label="Search agents"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
            </label>

            <ul
              role="listbox"
              aria-label="Agents"
              className="mt-2 max-h-56 space-y-1 overflow-y-auto"
            >
              {filteredAgents.map((agent) => {
                const Icon = agent.icon || FiZap;
                const isSelected = agent.id === value;
                return (
                  <li key={agent.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectAgent(agent.id)}
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
      {error && (
        <p
          className="absolute left-0 top-full mt-1 w-72 text-xs text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
