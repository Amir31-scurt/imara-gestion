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
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

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
        <div className="relative">
          <button 
            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
          >
            <span className="text-sm font-medium">{currency}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isCurrencyOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isCurrencyOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsCurrencyOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-border bg-muted/20">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Currency</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">All rates in CFA (XOF)</p>
                </div>
                {([
                  { code: "XOF", name: "CFA Franc",       rate: "1 CFA = 1 CFA",           symbol: "CFA" },
                  { code: "GMD", name: "Gambian Dalasi",  rate: "1 D ≈ 9 CFA",             symbol: "D" },
                  { code: "USD", name: "US Dollar",       rate: "1 $ ≈ 610 CFA",           symbol: "$" },
                  { code: "AED", name: "UAE Dirham",      rate: "1 د.إ ≈ 166 CFA",        symbol: "د.إ" },
                ] as const).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors last:rounded-b-2xl ${
                      currency === c.code ? "bg-primary/10" : ""
                    }`}
                  >
                    <div>
                      <div className={`text-sm font-bold ${currency === c.code ? "text-primary" : "text-foreground"}`}>
                        {c.code} <span className="font-normal text-muted-foreground">— {c.name}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{c.rate}</div>
                    </div>
                    {currency === c.code && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
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
