import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchInventoryTransactions = createAsyncThunk(
  "inventory/fetchTransactions",
  async ({ page, limit, productId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/inventory?page=${page}&limit=${limit}&productId=${productId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
        // throw new Error("Failed to fetch inventory transactions");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addInventoryTransaction = createAsyncThunk(
  "inventory/addTransaction",
  async (transaction, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  transactions: [],
  status: "idle",
  error: null,
  totalPages: 1,
  currentPage: 1,
  runningBalance: 0,
};

export const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    calculateRunningBalance: (state, action) => {
      const { openingStock } = action.payload;
      let balance = openingStock;
      state.transactions = state.transactions.map((transaction) => {
        balance +=
          transaction.type === "PURCHASE"
            ? transaction.quantity
            : -transaction.quantity;
        return { ...transaction, balance };
      });
      state.runningBalance = balance;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryTransactions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInventoryTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transactions = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchInventoryTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.error || "Failed to fetch transactions";
      })
      .addCase(addInventoryTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
        if (state.transactions.length > 10) {
          state.transactions.pop();
        }
      });
  },
});

export const { calculateRunningBalance } = inventorySlice.actions;

export default inventorySlice.reducer;
