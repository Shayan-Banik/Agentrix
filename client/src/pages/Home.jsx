import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiShare2, FiLoader, FiAlertCircle } from "react-icons/fi";
import { signInWithPopup } from "firebase/auth";

import api from "../utils/axios.js";
import { auth, googleProvider } from "../utils/firebase.js";
import { APP_NAME, AGENTS } from "../constants/constants.js";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/user.slice.js";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user.userData);

  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      dispatch(setUserData(data));
      console.log(data);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      let token = await result.user.getIdToken();
      console.log("Google Sign-In successful. Token:", token);
      await handleLogin(token);
      console.log("Google Sign-In successful:", result);
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-10 text-neutral-900 dark:bg-[#212121] dark:text-neutral-100 w-screen">
      {/* soft glow behind the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[22%] h-105 w-155 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15"
      />
      {
        userData ? <h1>Home</h1> : (
          <main className="relative w-full max-w-sm text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
          <FiShare2 className="h-6 w-6" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Sign in to work with your team of AI agents on {APP_NAME}.
        </p>

        <ul
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
          aria-label="Available agents">
          {AGENTS.map((name, i) => (
            <li
              key={name}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse"
                style={{ animationDelay: `${i * 400}ms` }}
              />
              {name}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          aria-busy={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white px-5 py-3.5 text-base font-medium text-neutral-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.99] disabled:cursor-progress disabled:opacity-70 dark:border-neutral-600 dark:bg-[#2f2f2f] dark:text-neutral-100 dark:hover:bg-[#3a3a3a] dark:focus-visible:ring-offset-[#212121]">
          {loading ? (
            <FiLoader className="h-5 w-5 motion-safe:animate-spin" />
          ) : (
            <FcGoogle className="h-5 w-5" />
          )}
          <span>{loading ? "Signing in…" : "Continue with Google"}</span>
        </button>

        <div className="mt-3 min-h-5" role="alert" aria-live="polite">
          {error && (
            <p className="flex items-start justify-center gap-1.5 text-sm text-red-500">
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-200">
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-200">
            Privacy Policy
          </a>
          .
        </p>
      </main>
        )
      }
      
    </div>
  );
}
