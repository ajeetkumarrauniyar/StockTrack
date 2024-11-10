import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchPurchases = createAsyncThunk(
  "purchases/fetchPurchases",
  async ({ page, limit }) => {
    const response = await fetch(`/api/purchases?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch purchases");
    }
    const data = await response.json();
    return data;
  }
);

export const addPurchase = createAsyncThunk(
  "purchases/addPurchase",
  async (purchase) => {
    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(purchase),
    });
    if (!response.ok) {
      throw new Error("Failed to add purchase");
    }
    const data = await response.json();
    return data.data;
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
  totalPages: 1,
  currentPage: 1,
};

export const purchasesSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(addPurchase.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (state.items.length > 10) {
          // Assuming 10 items per page
          state.items.pop();
        }
      });
  },
});

export default purchasesSlice.reducer;
