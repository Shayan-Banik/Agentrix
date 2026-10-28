import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound.jsx";
import { getCurrentUser } from "./features/getCurrentUser.js";
import { setUserData } from "./redux/user.slice.js";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        dispatch(setUserData(user));
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchUser();
  }, [dispatch]);

  const isHomePath = window.location.pathname === "/";

  return isHomePath ? <Home /> : <NotFound />;
};

export default App;
