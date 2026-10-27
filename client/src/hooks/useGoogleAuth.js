import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user.slice.js";
import { clearConversationState } from "../redux/conversation.slice.js";
import { clearMessages } from "../redux/message.slice.js";
import { auth, googleProvider } from "../utils/firebase.js";
import { loginWithGoogle, logout } from "../features/auth.js";

export default function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const signIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const { data } = await loginWithGoogle(token);
      dispatch(setUserData(data.user || data));
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Server sign out failed:", err);
      return false;
    }
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase sign out failed:", err);
    }
    dispatch(setUserData(null));
    dispatch(clearConversationState());
    dispatch(clearMessages());
    return true;
  };

  return { loading, error, signIn, signOut: signOutUser };
}
