"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "XOF" | "GMD" | "USD" | "AED";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number) => string;
  convertPrice: (amount: number) => number;
  parseToXOF: (amount: number, fromCurrency: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates relative to XOF (Default)
const RATES = {
  XOF: 1,
  GMD: 0.11, // 1 XOF = 0.11 GMD
  USD: 1 / 610, // 1 XOF = 0.0016 USD
  AED: 3.67 / 610, // 1 XOF = ~0.006 AED
};

const SYMBOLS: Record<Currency, string> = {
  XOF: "CFA",
  GMD: "D",
  USD: "$",
  AED: "د.إ",
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>("XOF");

  const convertPrice = (amountXOF: number) => {
    return amountXOF * RATES[currency];
  };

  const formatPrice = (amountXOF: number) => {
    const converted = convertPrice(amountXOF);
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(converted);
    }
    if (currency === "AED") {
      return `${new Intl.NumberFormat("ar-AE").format(Math.round(converted * 100) / 100)} ${SYMBOLS.AED}`;
    }
    return `${new Intl.NumberFormat("fr-FR").format(Math.round(converted))} ${SYMBOLS[currency]}`;
  };

  // Convert from any currency back to XOF for storage
  const parseToXOF = (amount: number, fromCurrency: Currency): number => {
    return Math.round(amount / RATES[fromCurrency]);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, parseToXOF }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
