"use client";

import { useGetExpensesQuery, useAddExpenseMutation, useDeleteExpenseMutation } from "@/lib/redux/features/expensesApi";
import { auth } from "@/lib/firebase";
import { useCurrency } from "@/context/CurrencyContext";
import { 
  Search, 
  Filter, 
  Plus,
  Clock,
  Trash2
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ExpensesListPage() {
  const userId = auth?.currentUser?.uid || "";
  const { data: expenses = [], isLoading } = useGetExpensesQuery(userId, {
    skip: !userId
  });

  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  
  const [addExpense] = useAddExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState(new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  const [isAdding, setIsAdding] = useState(false);

  const periods = Array.from(new Set(expenses.map(e => e.period))).sort();

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = periodFilter === "all" || expense.period === periodFilter;
    return matchesSearch && matchesPeriod;
  });

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

  const handleDelete = async (id: string) => {
    const pin = prompt("Enter Admin PIN to confirm deletion:");
    if (pin !== "160705230300") {
      alert("Incorrect PIN. Deletion cancelled.");
      return;
    }

    const row = document.getElementById(`row-${id}`);
    if (row) {
      row.style.opacity = '0';
      row.style.transform = 'translateY(10px) scale(0.98)';
    }
    setTimeout(async () => {
      try {
        await deleteExpense(id).unwrap();
        toast.success("Expense deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete expense");
      }
    }, 150);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-medium">Loading expenses list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-serif font-bold text-foreground">Expenses & Withdrawals</h2>
          <p className="text-muted-foreground">Manage and track all Imara expenditures.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddExpense} className="bg-card p-6 rounded-3xl border border-border shadow-md space-y-4 animate-in slide-in-from-top-2">
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-4 py-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <select 
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
            >
              <option value="all">All Periods</option>
              {periods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Period</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    id={`row-${expense.id}`}
                    className="hover:bg-muted/20 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground text-lg">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2 py-1 bg-muted rounded text-muted-foreground whitespace-nowrap">
                        {expense.period}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {expense.createdAt?.seconds ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-500">
                      {formatPrice(expense.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 flex items-center justify-center mx-auto rounded-xl text-destructive/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground font-medium">No expenses found matching your criteria.</p>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm("")}
                          className="text-primary text-sm font-bold hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-muted/10 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground font-bold">{filteredExpenses.length}</span> expenses
          </p>
        </div>
      </div>
    </div>
  );
}
