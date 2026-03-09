"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  LogOut,
  ChevronRight,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "All Orders", icon: ShoppingBag },
  { href: "/dashboard/expenses", label: "Expenses", icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar text-white flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl">
        <div className="p-6">
          <div className="flex flex-col gap-4 mb-10">
            <div className="bg-white/95 p-4 rounded-2xl shadow-inner backdrop-blur-sm hover:bg-white transition-all duration-300">
              <img src="/logo.png" alt="Imara Logo" className="w-full h-auto object-contain max-h-20" />
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/40 group-hover:text-white/70")} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-sidebar/95 backdrop-blur-xl border border-white/10 flex items-center justify-around px-2 z-50 rounded-2xl shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] h-12 rounded-xl transition-all",
                isActive ? "text-primary bg-white/5" : "text-white/40"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 min-w-[64px] h-12 text-white/40 active:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
        </button>
      </nav>
    </>
  );
}
