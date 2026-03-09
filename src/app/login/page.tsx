"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Moon, Sun, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Authentication system is not ready. Please try again in a moment.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-md w-full">
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-6 rounded-[2.5rem] bg-white shadow-2xl shadow-primary/20 mb-8 border border-primary/10 max-w-[280px]">
            <img src="/logo.png" alt="Imara Logo" className="w-full h-auto object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-serif font-bold text-foreground tracking-tighter">Imara</h1>
            <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-black opacity-60">Fashion Maison</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card p-8 rounded-3xl border border-border shadow-xl backdrop-blur-sm relative z-10">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="owner@imara.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4 text-lg"
          >
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-8">
          &copy; {new Date().getFullYear()} Imara Fashion. All rights reserved.
        </p>
      </div>
    </div>
  );
}
