import { FiArrowLeft, FiShare2 } from "react-icons/fi";
import { APP_NAME } from "../constants/constants.js";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b101a] px-6 py-16 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-3xl"
      />

      <section className="relative w-full max-w-xl text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-7 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-indigo-200 shadow-lg shadow-indigo-950/30">
          <FiShare2 className="h-7 w-7" strokeWidth={1.5} />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
          Lost in the workflow?
        </p>
        <h1 className="mt-4 text-8xl font-bold tracking-tight text-white sm:text-9xl">
          404
        </h1>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
          This page couldn’t be found
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-400">
          The link may be outdated, or the page may have moved. Let’s get you
          back to {APP_NAME}.
        </p>

        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b101a]">
          <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </a>

        <p className="mt-12 text-xs text-slate-600">{APP_NAME}</p>
      </section>
    </main>
  );
}
