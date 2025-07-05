import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access:", location.pathname);

    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer); // cleanup if component unmounts
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-100 via-purple-100 to-blue-100 text-gray-800">
      <div className="text-center p-6 rounded-3xl shadow-xl bg-white w-[90%] max-w-md transform transition-transform hover:scale-105 hover:rotate-1">
        <h1 className="text-6xl font-black mb-4 text-purple-600 animate-bounce">404 🚫</h1>
        <p className="text-xl mb-2">Oops... You’ve hit a dead end 👀</p>
        <p className="text-sm mb-6 opacity-80">
          This page doesn’t exist. Redirecting you home in 3...2...1 ⏳
        </p>
        <a
          href="/"
          className="inline-block px-5 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md"
        >
          🏠 Go Now
        </a>
      </div>
    </div>
  );
};

export default NotFound;
