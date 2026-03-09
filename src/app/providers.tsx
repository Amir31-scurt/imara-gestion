"use client";

import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/lib/redux/store";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/context/CurrencyContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
