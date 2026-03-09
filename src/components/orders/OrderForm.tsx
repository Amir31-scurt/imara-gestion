"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Order } from "@/lib/redux/features/ordersApi";
import { auth } from "@/lib/firebase";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Save, Trash2, X } from "lucide-react";

const orderSchema = z.object({
  clientName: z.string().min(2, "Client name is required"),
  description: z.string().min(5, "Description is required"),
  period: z.string().min(1, "Period/Bunch is required"),
  itemCost: z.number().min(0),
  sellingPrice: z.number().min(0),
  transportCost: z.number().min(0),
  status: z.enum(["pending", "completed", "cancelled", "archived"]),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  initialData?: Order;
  onSubmit: (data: Partial<Order>) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
}

export function OrderForm({ initialData, onSubmit, onDelete, loading }: OrderFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: initialData || {
      clientName: "",
      description: "",
      period: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), // Default to current month
      itemCost: 0,
      sellingPrice: 0,
      transportCost: 0,
      status: "pending",
    },
  });

  const itemCost = watch("itemCost");
  const sellingPrice = watch("sellingPrice");
  const transportCost = watch("transportCost");
  
  const benefit = sellingPrice - itemCost - transportCost;

  const onFormSubmit = async (values: OrderFormValues) => {
    const userId = auth?.currentUser?.uid || "";
    await onSubmit({
      ...values,
      benefit,
      userId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 bg-card p-8 rounded-3xl border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Client Name</label>
            <input
              {...register("clientName")}
              className={cn(
                "w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all",
                errors.clientName && "border-destructive"
              )}
              placeholder="e.g. Amina Diop"
            />
            {errors.clientName && <p className="text-xs text-destructive font-medium">{errors.clientName.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Period / Bunch</label>
            <input
              {...register("period")}
              className={cn(
                "w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all",
                errors.period && "border-destructive"
              )}
              placeholder="e.g. March 2024 Collection"
            />
            {errors.period && <p className="text-xs text-destructive font-medium">{errors.period.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className={cn(
                "w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none",
                errors.description && "border-destructive"
              )}
              placeholder="e.g. Navy Blue Kaftan with Gold Embroidery"
            />
            {errors.description && <p className="text-xs text-destructive font-medium">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Status</label>
            <select
              {...register("status")}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Item Cost (XOF)</label>
              <input
                type="number"
                {...register("itemCost", { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Selling Price (XOF)</label>
              <input
                type="number"
                {...register("sellingPrice", { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Transport Cost (XOF)</label>
            <input
              type="number"
              {...register("transportCost", { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <label className="text-sm font-bold text-foreground">Calculated Profit (XOF)</label>
          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Calculated Profit</span>
              <span className={cn(
                "text-2xl font-bold",
                benefit >= 0 ? "text-primary" : "text-destructive"
              )}>
                {new Intl.NumberFormat("fr-FR").format(benefit)} CFA
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Selling Price - Item Cost - Transport Cost
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
        {onDelete ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this order?")) {
                onDelete();
              }
            }}
            className="flex items-center gap-2 px-6 py-3 text-destructive hover:bg-destructive/5 rounded-xl transition-all font-bold"
          >
            <Trash2 className="w-5 h-5" />
            Delete Order
          </button>
        ) : <div />}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 text-muted-foreground hover:bg-muted/30 rounded-xl transition-all font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Saving..." : initialData ? "Update Order" : "Create Order"}
          </button>
        </div>
      </div>
    </form>
  );
}
