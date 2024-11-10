import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ page, limit }) => {
    const response = await fetch(`/api/products?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    return data;
  }
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (product) => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      throw new Error("Failed to add product");
    }
    const data = await response.json();
    return data.data;
  }
);

export const updateProductStock = createAsyncThunk(
  "products/updateStock",
  async ({ productId, newStock }) => {
    const response = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stockQuantity: newStock }),
    });
    if (!response.ok) {
      throw new Error("Failed to update product stock");
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

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (state.items.length > 10) {
          // Assuming 10 items per page
          state.items.pop();
        }
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default productsSlice.reducer;
