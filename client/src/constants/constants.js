import { Zap, Code2, MessageSquare, FileText, Presentation, ImageIcon, Globe } from "lucide-react";

export const APP_NAME = "Agentrix";
export const AGENTS = ["Planner", "Researcher", "Coder"];

export const DEFAULT_SUGGESTIONS = [
  "Plan a launch checklist for my app",
  "Research the best vector databases",
  "Write a React hook for debouncing",
  "Build a landing page for a coffee shop",
  "Create a fullstack app for a blog",
  "Design a landing page for a fitness app",
];

export const CONVERSATION_GROUP_LABELS = [
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Older",
];

export const CONVERSATION_DAY_MS = 86_400_000;
export const SIDEBAR_DEFAULT_APP_NAME = "AgentHub";

export const ARTIFACT_FILE_EXTENSIONS = {
  javascript: "js",
  js: "js",
  jsx: "jsx",
  typescript: "ts",
  ts: "ts",
  tsx: "tsx",
  python: "py",
  py: "py",
  html: "html",
  css: "css",
  json: "json",
  markdown: "md",
  bash: "sh",
  sql: "sql",
};

// [left %, top %, size px, opacity] - decorative starfield
export const STARS = [
  [62, 8, 2, 0.8],
  [8, 14, 2, 0.6],
  [78, 10, 2, 0.7],
  [37, 20, 2, 0.6],
  [90, 24, 2, 0.6],
  [25, 33, 2, 0.5],
  [68, 32, 2, 0.5],
  [97, 38, 2, 0.6],
  [14, 44, 2, 0.5],
  [78, 48, 2, 0.5],
  [43, 52, 2, 0.4],
  [20, 62, 2, 0.4],
  [72, 68, 2, 0.4],
  [52, 78, 2, 0.4],
  [5, 84, 2, 0.3],
];

export const SearchAGENTS = [
  {
    id:"auto",
    icon: Zap,
    label: "Auto",
  },
  {
    id:"chat",
    icon: MessageSquare,
    label: "Chat",
  },
  {
    id:"coding",
    icon: Code2,
    label: "Coding",
  },
  {
    id: "pdf",
    icon: FileText,
    label: "PDF",
  },
  {
    id: "ppt",
    icon: Presentation,
    label: "PPT",
  },
  {
    id: "image",
    icon: ImageIcon,
    label: "Image",
  },
  {
    id: "search",
    icon: Globe,
    label: "Search",
  }
];
