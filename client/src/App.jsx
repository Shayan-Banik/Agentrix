import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Home from "./pages/Home";
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Home />
    </div>
  );
};

export default App;
