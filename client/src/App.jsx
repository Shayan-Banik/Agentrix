import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./utils/firebase.js";
import api from "./utils/axios.js";
const App = () => {
  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      console.log(data);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      let token = await result.user.getIdToken();
      console.log("Google Sign-In successful. Token:", token);
      await handleLogin(token);
      console.log("Google Sign-In successful:", result);
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-purple-500 mb-5">
        Hello Authentication!
      </h1>
      <button
        onClick={handleGoogleSignIn}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        continue with google
      </button>
    </div>
  );
};

export default App;
