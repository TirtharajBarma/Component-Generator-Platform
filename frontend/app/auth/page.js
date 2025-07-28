"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAuth } from "../../store/hooks";
import { loginUser, signupUser } from "../../store/thunks";
import { clearError } from "../../store/slices/authSlice";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    try {
      if (isLogin) {
        await dispatch(loginUser({ email, password })).unwrap();
      } else {
        await dispatch(signupUser({ email, password })).unwrap();
      }
      router.push("/");
    } catch (err) {
      // Error is handled by Redux
      console.error("Auth error:", err);
    }
  };

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-black/10 p-6 sm:p-10 rounded-xl shadow-sm w-full max-w-xs sm:max-w-sm mx-auto flex flex-col gap-4"
        key={retryCount}
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-center text-black tracking-tight">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        {error && (
          <div className="mb-2 text-red-600 text-center text-sm">
            {error}
            <div>
              <button className="mt-2 px-3 py-1 bg-black text-white rounded" type="button" onClick={handleRetry}>
                Retry
              </button>
            </div>
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border border-black/10 rounded-lg bg-white text-black placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black/20 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-black/10 rounded-lg bg-white text-black placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black/20 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-black border border-black transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Loading..." : (isLogin ? "Login" : "Sign Up")}
        </button>
        <div className="mt-2 text-center">
          <button
            type="button"
            className="text-black hover:underline text-sm"
            onClick={() => setIsLogin((v) => !v)}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </button>
        </div>
      </form>
    </div>
  );
} 