import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import LoggingIn from "../components/LoggingIn";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState("login"); // login | signup

  const handleLogin = async () => {
    setLoading(true);
    setMode("login");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    await new Promise((r) => setTimeout(r, 1200));

    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setMode("signup");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    await new Promise((r) => setTimeout(r, 1200));

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 p-6">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoggingIn
              message={mode === "login" ? "Đang đăng nhập..." : "Đang đăng ký..."}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-sm p-8 rounded-3xl 
        bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl"
      >
        {/* Glowing top decoration */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full 
          bg-gradient-to-tr from-pink-400 via-fuchsia-500 to-purple-600 shadow-[0_0_25px_rgba(255,0,200,0.7)] blur-md"></div>

        <h2 className="text-2xl font-extrabold text-white text-center drop-shadow-lg mb-6">
          {mode === "login" ? "Chào mừng trở lại 💖" : "Tạo tài khoản mới ✨"}
        </h2>

        <div className="flex mb-6 p-1 bg-white/10 rounded-xl">
          <button
            onClick={() => setMode("login")}
            className={`w-1/2 py-2 rounded-lg text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white text-pink-600 shadow-lg"
                : "text-white hover:text-pink-200"
            }`}
          >
            Đăng nhập
          </button>

          <button
            onClick={() => setMode("signup")}
            className={`w-1/2 py-2 rounded-lg text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-purple-600 shadow-lg"
                : "text-white hover:text-purple-200"
            }`}
          >
            Đăng ký
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email của bạn..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/30 text-white 
            placeholder-white/60 border border-white/40
            focus:outline-none focus:ring-2 focus:ring-pink-300"
          />

          <input
            type="password"
            placeholder="Mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/30 text-white 
            placeholder-white/60 border border-white/40
            focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {error && (
            <p className="text-red-200 text-center text-sm drop-shadow-lg">
              {error}
            </p>
          )}

          <button
            onClick={mode === "login" ? handleLogin : handleSignup}
            className="w-full py-3 rounded-xl mt-2 font-semibold
            bg-gradient-to-r from-pink-500 to-purple-600
            text-white shadow-lg shadow-pink-300/50
            hover:shadow-pink-400/70 hover:scale-[1.03]
            transition-all duration-300"
          >
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
