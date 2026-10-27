import { FcGoogle } from "react-icons/fc";
import { FiShare2, FiLoader, FiAlertCircle } from "react-icons/fi";
import { useSelector } from "react-redux";
import { APP_NAME, AGENTS } from "../constants/constants.js";
import ChatLayout from "../components/ChatLayout.jsx";
import useGoogleAuth from "../hooks/useGoogleAuth.js";

function SignInScreen({ loading, error, onSignIn }) {
  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-[#0b101a] px-6 py-10 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[22%] h-105 w-155 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl"
      />

      <main className="relative w-full max-w-sm text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 grid h-16 w-16 place-items-center text-indigo-100 drop-shadow-[0_0_24px_rgba(129,140,248,0.75)]">
          <FiShare2 className="h-12 w-12" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-400">
          Sign in to work with your team of AI agents on {APP_NAME}.
        </p>

        <ul
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
          aria-label="Available agents">
          {AGENTS.map((name, i) => (
            <li
              key={name}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
              <span
                className="h-1.5 w-1.5 rounded-full bg-indigo-400 motion-safe:animate-pulse"
                style={{ animationDelay: `${i * 400}ms` }}
              />
              {name}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onSignIn}
          disabled={loading}
          aria-busy={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-[#1a2133] px-5 py-3.5 text-base font-medium text-slate-100 shadow-lg shadow-black/30 transition hover:bg-[#222b42] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b101a] active:scale-[0.99] disabled:cursor-progress disabled:opacity-70">
          {loading ? (
            <FiLoader className="h-5 w-5 motion-safe:animate-spin" />
          ) : (
            <FcGoogle className="h-5 w-5" />
          )}
          <span>{loading ? "Signing in…" : "Continue with Google"}</span>
        </button>

        <div className="mt-3 min-h-5" role="alert" aria-live="polite">
          {error && (
            <p className="flex items-start justify-center gap-1.5 text-sm text-red-400">
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="underline underline-offset-2 hover:text-slate-200">
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="underline underline-offset-2 hover:text-slate-200">
            Privacy Policy
          </a>
          .
        </p>
      </main>
    </div>
  );
}

export default function Home() {
  const user = useSelector((state) => state.user.userData);
  const { loading, error, signIn, signOut } = useGoogleAuth();

  if (user) {
    return <ChatLayout user={user} onLogout={signOut} />;
  }

  return <SignInScreen loading={loading} error={error} onSignIn={signIn} />;
}
