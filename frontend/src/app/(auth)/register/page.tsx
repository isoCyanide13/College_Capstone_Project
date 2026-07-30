"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, AlertCircle, Mic } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading, error } = useAuth();

  async function handleSubmit() {
    if (!name || !email || !password) return;
    await register(name, email, password);
  }

  return (
    <div className="aero-bg flex-1 flex flex-col justify-center items-center py-12 px-4 min-h-screen">

      {/* Ambient warm spots */}
      <div className="aero-spot-1 top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2" />
      <div className="aero-spot-2 bottom-1/3 left-1/4 -translate-x-1/3 translate-y-1/3" />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass-warm w-full max-w-sm p-8 relative z-10"
      >
        {/* Logo mark */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-sm bg-ink flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-surface" />
          </div>
          <span className="font-headline font-bold text-base tracking-tight text-ink">
            Mock<span className="text-accent">AI</span>
          </span>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h2 className="font-headline text-xl font-bold text-ink mb-1">
            Create account
          </h2>
          <p className="font-body text-sm text-ink-muted">
            Start practising real technical interviews
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-danger px-3.5 py-3 rounded-md text-sm font-body">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-ink-faint" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="aero-input pl-9 pr-4 py-2.5"
                placeholder="Nairit Singh"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-ink-faint" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="aero-input pl-9 pr-4 py-2.5"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-ink-faint" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="aero-input pl-9 pr-4 py-2.5"
                placeholder="Min 8 chars with uppercase & number"
              />
            </div>
            <p className="font-body text-xs text-ink-faint mt-1.5">
              At least 8 characters, one uppercase, one number, one special character
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="aero-btn mt-1"
          >
            {isLoading
              ? "Creating account..."
              : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[rgba(196,186,170,0.4)] text-center">
          <p className="font-body text-sm text-ink-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent hover:text-accent-hover font-medium snap-transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="relative z-10 mt-6 font-body text-xs text-ink-faint"
      >
        AI-powered interview preparation
      </motion.p>
    </div>
  );
}