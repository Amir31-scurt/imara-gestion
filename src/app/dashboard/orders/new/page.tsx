"use client";

import { OrderForm } from "@/components/orders/OrderForm";
import { useAddOrderMutation, Order } from "@/lib/redux/features/ordersApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function NewOrderPage() {
  const [addOrder] = useAddOrderMutation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Partial<Order>) => {
    setLoading(true);
    try {
      await addOrder(data).unwrap();
      toast.success("Order created successfully!");
      router.push("/dashboard/orders");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create order");
      console.error("Failed to add order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-serif font-bold text-foreground">Create New Order</h2>
        <p className="text-muted-foreground">Register a new customer order for Imara.</p>
      </div>

      <OrderForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
