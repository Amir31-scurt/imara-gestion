"use client";

import { useGetOrdersQuery, Order } from "@/lib/redux/features/ordersApi";
import { auth } from "@/lib/firebase";
import { useCurrency } from "@/context/CurrencyContext";
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Clock,
  Archive,
  Trash2
} from "lucide-react";
import { useUpdateOrderMutation, useDeleteOrderMutation } from "@/lib/redux/features/ordersApi";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function OrdersListPage() {
  const userId = auth?.currentUser?.uid || "";
  const { data: orders = [], isLoading } = useGetOrdersQuery(userId, {
    skip: !userId
  });

  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [periodFilter, setPeriodFilter] = useState("all");
  
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const periods = Array.from(new Set(orders.map(o => o.period))).sort();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.period.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Default 'active' shows everything except archived
    const matchesStatus = statusFilter === "all" 
      ? true 
      : statusFilter === "active" 
        ? (order.status as string) !== "archived" 
        : order.status === statusFilter;

    const matchesPeriod = periodFilter === "all" || order.period === periodFilter;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const handleArchive = async (id: string) => {
    if (confirm("Move this order to archive?")) {
      const row = document.getElementById(`row-${id}`);
      if (row) {
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px) scale(0.98)';
      }
      setTimeout(async () => {
        await updateOrder({ id, data: { status: "archived" } });
      }, 150);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this order? This cannot be undone.")) {
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
        await deleteOrder(id);
      }, 150);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-medium">Loading orders list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-serif font-bold text-foreground">Orders History</h2>
          <p className="text-muted-foreground">Manage and track all Imara customer orders.</p>
        </div>
        <Link 
          href="/dashboard/orders/new" 
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold"
        >
          <Plus className="w-5 h-5" />
          Create Order
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by client or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-4 py-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
            >
              <option value="active">Active Only</option>
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Period</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Selling Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Profit</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    id={`row-${order.id}`}
                    className="hover:bg-muted/20 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground text-lg">{order.clientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2 py-1 bg-muted rounded text-muted-foreground whitespace-nowrap">
                        {order.period}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground/80 line-clamp-2 max-w-[250px]">{order.description}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">
                      {formatPrice(order.sellingPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      {formatPrice(order.benefit)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                        order.status === "completed" ? "bg-green-100 text-green-700" : 
                        order.status === "pending" ? "bg-amber-100 text-amber-700" : 
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-zinc-100 text-zinc-500"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/dashboard/orders/${order.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                          title="Edit Order"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                        {order.status !== "archived" && (
                          <button
                            onClick={() => handleArchive(order.id)}
                            className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                            title="Archive Order"
                          >
                            <Archive className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 rounded-xl text-destructive/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground font-medium">No orders found matching your criteria.</p>
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
            Showing <span className="text-foreground font-bold">{filteredOrders.length}</span> orders
          </p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 rounded-lg hover:bg-muted opacity-50"><ChevronLeft className="w-4 h-4" /></button>
            <button disabled className="p-2 rounded-lg hover:bg-muted opacity-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
