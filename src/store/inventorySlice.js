import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchInventoryTransactions = createAsyncThunk(
  "inventory/fetchTransactions",
  async ({ page, limit }) => {
    const response = await fetch(`/api/inventory?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch inventory transactions");
    }
    const data = await response.json();
    return data;
  }
);

const initialState = {
  transactions: [],
  status: "idle",
  error: null,
  totalPages: 1,
  currentPage: 1,
};

export const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {},
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
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default inventorySlice.reducer;
