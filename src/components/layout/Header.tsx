"use client";

import { useTheme } from "next-themes";
import { useCurrency } from "@/context/CurrencyContext";
import { Moon, Sun, Laptop, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
          <h1 className="text-xl font-serif font-bold tracking-[0.1em] text-primary">IMARA</h1>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Currency Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
            <span className="text-sm font-medium">{currency}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            {(["XOF", "GMD", "USD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent first:rounded-t-lg last:rounded-b-lg ${
                  currency === c ? "text-primary font-bold" : ""
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center border border-border rounded-lg p-1 bg-background">
          <button
            onClick={() => setTheme("light")}
            className={`p-1.5 rounded-md transition-colors ${
              theme === "light" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-1.5 rounded-md transition-colors ${
              theme === "dark" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`p-1.5 rounded-md transition-colors ${
              theme === "system" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            <Laptop className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
