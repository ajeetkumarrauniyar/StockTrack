import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchSales = createAsyncThunk(
  "sales/fetchSales",
  async ({ page, limit }) => {
    const response = await fetch(`/api/sales?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch sales");
    }
    const data = await response.json();
    return data;
  }
);

export const addSale = createAsyncThunk(
  "sales/addSale",
  async (sale, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sale),
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
  items: [],
  status: "idle",
  error: null,
  totalPages: 1,
  currentPage: 1,
};

export const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(addSale.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (state.items.length > 10) {
          // Assuming 10 items per page
          state.items.pop();
        }
      })
      .addCase(addSale.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to add sale";
      });
  },
});

export default salesSlice.reducer;
