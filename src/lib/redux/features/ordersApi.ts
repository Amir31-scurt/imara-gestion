import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  where
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export interface Order {
  id: string;
  clientName: string;
  description: string;
  period: string; // Bunch/Period identifier
  itemCost: number;
  sellingPrice: number;
  transportCost: number;
  benefit: number;
  status: "pending" | "completed" | "cancelled" | "archived";
  userId: string;
  createdAt: any;
  updatedAt: any;
}

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], string>({
      queryFn: () => ({ data: [] }), // Initial data
      async onCacheEntryAdded(
        userId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!userId || !db) return;
        // Wait for the cache to be populated
        await cacheDataLoaded;

        const q = query(
          collection(db, "orders"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, {
          next: (snapshot) => {
            updateCachedData((draft) => {
              return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              } as Order));
            });
          },
          error: (error) => {
            console.error("Firestore snapshot error:", error);
          }
        });

        await cacheEntryRemoved;
        unsubscribe();
      },
    }),
    addOrder: builder.mutation<void, Partial<Order>>({
      async queryFn(order) {
        try {
          if (!db) throw new Error("Database not initialized");
          await addDoc(collection(db, "orders"), {
            ...order,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          return { data: null as any };
        } catch (error: any) {
          return { error: { message: error.message } };
        }
      },
    }),
    updateOrder: builder.mutation<void, { id: string; data: Partial<Order> }>({
      async queryFn({ id, data }) {
        try {
          if (!db) throw new Error("Database not initialized");
          const docRef = doc(db, "orders", id);
          await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
          });
          return { data: null as any };
        } catch (error: any) {
          return { error: { message: error.message } };
        }
      },
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled, getState }) {
        const state = getState() as any;
        const userId = state?.auth?.user?.uid || auth?.currentUser?.uid;
        if (!userId) return;

        const patchResult = dispatch(
          ordersApi.util.updateQueryData('getOrders', userId, (draft) => {
            const index = draft.findIndex(order => order.id === id);
            if (index !== -1) {
              draft[index] = { ...draft[index], ...data };
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteOrder: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          if (!db) throw new Error("Database not initialized");
          const docRef = doc(db, "orders", id);
          await deleteDoc(docRef);
          return { data: null as any };
        } catch (error: any) {
          return { error: { message: error.message } };
        }
      },
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const state = getState() as any;
        const userId = state?.auth?.user?.uid || auth?.currentUser?.uid;
        if (!userId) return;

        const patchResult = dispatch(
          ordersApi.util.updateQueryData('getOrders', userId, (draft) => {
            return draft.filter(order => order.id !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useAddOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;
