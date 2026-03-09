"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { useGetExpensesQuery, useAddExpenseMutation, useDeleteExpenseMutation } from "@/lib/redux/features/expensesApi";
import { Order } from "@/lib/redux/features/ordersApi";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Wallet, TrendingDown, Landmark } from "lucide-react";

export function FinanceSection({ activeOrders }: { activeOrders: Order[] }) {
  const userId = auth?.currentUser?.uid || "";
  const { data: expenses = [], isLoading } = useGetExpensesQuery(userId, { skip: !userId });
  const [addExpense] = useAddExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const { formatPrice } = useCurrency();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState(new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  const [isAdding, setIsAdding] = useState(false);

  const totalProfit = activeOrders.reduce((acc, order) => acc + order.benefit, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netBalance = totalProfit - totalExpenses;

  // Group by period
  const periods = Array.from(new Set([...activeOrders.map(o => o.period), ...expenses.map(e => e.period)])).sort();

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    try {
      await addExpense({
        description,
        amount: parseFloat(amount),
        period,
        userId
      }).unwrap();
      toast.success("Expense added successfully!");
      setDescription("");
      setAmount("");
      setIsAdding(false);
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const pin = prompt("Enter Admin PIN to confirm deletion:");
    if (pin !== "160705230300") {
      alert("Incorrect PIN. Deletion cancelled.");
      return;
    }
    
    try {
      await deleteExpense(id).unwrap();
      toast.success("Expense deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif font-bold text-foreground">Financial Overview</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 text-sm font-bold text-white bg-primary px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-2xl text-white shadow-lg bg-green-500">
              <Landmark className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Profit</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatPrice(totalProfit)}</h3>
        </div>
        
        <div className="bg-card p-6 rounded-3xl border border-destructive/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-2xl text-white shadow-lg bg-red-500">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Expenses</span>
          </div>
          <h3 className="text-2xl font-bold text-red-500 tracking-tight">{formatPrice(totalExpenses)}</h3>
        </div>

        <div className="bg-card p-6 rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-2xl text-white shadow-lg bg-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Net Balance</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatPrice(netBalance)}</h3>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddExpense} className="bg-card p-6 rounded-3xl border border-border space-y-4 animate-in slide-in-from-top-2">
          <h4 className="font-bold text-foreground mb-4">Record New Expense/Withdrawal</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Description</label>
              <input type="text" required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border bg-transparent focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Fabric purchase" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Amount (XOF)</label>
              <input type="number" required min="0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border bg-transparent focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Period</label>
              <input type="text" required value={period} onChange={e => setPeriod(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border bg-transparent focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90">Save Expense</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h4 className="font-bold text-foreground">Profits & Balance by Period</h4>
          </div>
          <div className="divide-y divide-border">
            {periods.map(p => {
              const pProfit = activeOrders.filter(o => o.period === p).reduce((acc, o) => acc + o.benefit, 0);
              const pExpense = expenses.filter(e => e.period === p).reduce((acc, e) => acc + e.amount, 0);
              const pNet = pProfit - pExpense;
              return (
                <div key={p} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <span className="font-bold text-sm">{p}</span>
                  <div className="text-right flex items-center gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Profit</div>
                      <div className="font-bold text-green-600">{formatPrice(pProfit)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Expenses</div>
                      <div className="font-bold text-red-500">{formatPrice(pExpense)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Net</div>
                      <div className="font-bold text-primary">{formatPrice(pNet)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {periods.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground italic">No periods recorded yet.</div>}
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h4 className="font-bold text-foreground">Recent Expenses</h4>
          </div>
          <div className="divide-y divide-border">
            {expenses.slice(0, 5).map(exp => (
              <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div>
                  <div className="font-bold text-sm text-foreground">{exp.description}</div>
                  <div className="text-xs text-muted-foreground">{exp.period}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-red-500">{formatPrice(exp.amount)}</span>
                  <button onClick={() => handleDeleteExpense(exp.id)} className="p-2 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground italic">No expenses recorded yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
