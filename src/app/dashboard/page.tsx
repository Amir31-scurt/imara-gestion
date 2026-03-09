"use client";

import { useGetOrdersQuery, Order } from "@/lib/redux/features/ordersApi";
import { auth } from "@/lib/firebase";
import { useCurrency } from "@/context/CurrencyContext";
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Clock,
  ArrowRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FinanceSection } from "@/components/finances/FinanceSection";

export default function DashboardPage() {
  const userId = auth?.currentUser?.uid || "";
  const { data: orders = [], isLoading } = useGetOrdersQuery(userId, {
    skip: !userId
  });
  const { formatPrice } = useCurrency();

  const activeOrders = orders.filter(o => (o.status as string) !== "archived");
  const totalOrders = activeOrders.length;
  const totalRevenue = activeOrders.reduce((acc, order) => acc + order.sellingPrice, 0);
  const totalProfit = activeOrders.reduce((acc, order) => acc + order.benefit, 0);
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-medium">Loading metrics...</p>
      </div>
    );
  }

  const pendingOrders = activeOrders.filter(o => o.status === "pending").length;

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "bg-green-500" },
    { label: "Total Profit", value: formatPrice(totalProfit), icon: TrendingUp, color: "bg-primary" },
    { label: "Pending", value: pendingOrders, icon: Clock, color: "bg-amber-500" },
  ];

  const recentOrders = activeOrders.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-serif font-bold text-foreground">Imara Maison</h2>
          <p className="text-muted-foreground">Managing collection periods and orders.</p>
        </div>
        <Link 
          href="/dashboard/orders/new" 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold"
        >
          <Plus className="w-5 h-5" />
          Create Order
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl text-white shadow-lg", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Metrics</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</h3>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <FinanceSection activeOrders={activeOrders} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-foreground">Recent Orders</h3>
          <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Period</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{order.clientName}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">{order.description}</div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded text-muted-foreground">{order.period}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {formatPrice(order.sellingPrice)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter disabled:opacity-50",
                        order.status === "completed" ? "bg-green-100 text-green-700" : 
                        order.status === "pending" ? "bg-amber-100 text-amber-700" : 
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-zinc-100 text-zinc-500"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                      {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    No orders found. Create your first order!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
