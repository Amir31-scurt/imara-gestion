"use client";

import { useParams, useRouter } from "next/navigation";
import { OrderForm } from "@/components/orders/OrderForm";
import { 
  useGetOrdersQuery, 
  useUpdateOrderMutation, 
  useDeleteOrderMutation,
  Order 
} from "@/lib/redux/features/ordersApi";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import toast from "react-hot-toast";

export default function EditOrderPage() {
  const { id } = useParams() as { id: string };
  const userId = auth?.currentUser?.uid || "";
  const { data: orders = [] } = useGetOrdersQuery(userId, { skip: !userId });
  const order = orders.find((o) => o.id === id);
  
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-medium">Loading order details...</p>
      </div>
    );
  }

  const handleSubmit = async (data: Partial<Order>) => {
    setLoading(true);
    try {
      await updateOrder({ id, data }).unwrap();
      toast.success("Order updated successfully!");
      router.push("/dashboard/orders");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update order");
      console.error("Failed to update order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const pin = prompt("Enter Admin PIN to confirm deletion:");
    if (pin !== "160705230300") {
      alert("Incorrect PIN. Deletion cancelled.");
      return;
    }
    try {
      await deleteOrder(id).unwrap();
      toast.success("Order deleted successfully!");
      router.push("/dashboard/orders");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete order");
      console.error("Failed to delete order:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-serif font-bold text-foreground">Edit Order</h2>
        <p className="text-muted-foreground">Manage details for order from {order.clientName}</p>
      </div>

      <OrderForm 
        initialData={order} 
        onSubmit={handleSubmit} 
        onDelete={handleDelete}
        loading={loading} 
      />
    </div>
  );
}
