import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  where
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  period: string;
  userId: string;
  createdAt: any;
}

export const expensesApi = createApi({
  reducerPath: "expensesApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Expense"],
  endpoints: (builder) => ({
    getExpenses: builder.query<Expense[], string>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        userId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!userId || !db) return;
        await cacheDataLoaded;

        const q = query(
          collection(db, "expenses"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, {
          next: (snapshot) => {
            updateCachedData((draft) => {
              return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              } as Expense));
            });
          },
          error: (error) => {
            console.error("Firestore expenses snapshot error:", error);
          }
        });

        await cacheEntryRemoved;
        unsubscribe();
      },
    }),
    addExpense: builder.mutation<void, Partial<Expense>>({
      async queryFn(expense) {
        try {
          if (!db) throw new Error("Database not initialized");
          await addDoc(collection(db, "expenses"), {
            ...expense,
            createdAt: serverTimestamp(),
          });
          return { data: null as any };
        } catch (error: any) {
          return { error: { message: error.message } };
        }
      },
    }),
    deleteExpense: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          if (!db) throw new Error("Database not initialized");
          const docRef = doc(db, "expenses", id);
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
          expensesApi.util.updateQueryData('getExpenses', userId, (draft) => {
            return draft.filter(expense => expense.id !== id);
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
  useGetExpensesQuery,
  useAddExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;
