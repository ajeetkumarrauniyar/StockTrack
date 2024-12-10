import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks
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
  async (product, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        return rejectWithValue(await response.json());
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProductStock = createAsyncThunk(
  "products/updateStock",
  async ({ productId, stockChange, transactionType }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockChange, transactionType }),
      });
      if (!response.ok) {
        return rejectWithValue(await response.json());
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMultipleProducts = createAsyncThunk(
  "products/addMultipleProducts",
  async (products, { rejectWithValue }) => {
    try {
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  items: [], // Each item should have both openingStock and stockQuantity
  status: "idle",
  error: null,
  totalPages: 1,
  currentPage: 1,
  bulkUploadStatus: "idle",
  bulkUploadError: null,
};

// Slice
export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProductManually: (state, action) => {
      state.items.push(action.payload);
    },
    removeProduct: (state, action) => {
      state.items = state.items.filter(
        (product) => product.id !== action.payload
      );
    },
  },
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
      .addCase(addProduct.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Ensure both openingStock and stockQuantity are preserved
        state.items.unshift({
          ...action.payload,
          openingStock: action.payload.openingStock,
          stockQuantity: action.payload.stockQuantity,
        });
        if (state.items.length > 10) state.items.pop();
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.error || "Failed to add product";
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            stockQuantity: action.payload.stockQuantity, // Update only stockQuantity
          };
        }
      })
      .addCase(addMultipleProducts.pending, (state) => {
        state.bulkUploadStatus = "loading";
        state.bulkUploadError = null;
      })
      .addCase(addMultipleProducts.fulfilled, (state, action) => {
        state.bulkUploadStatus = "succeeded";
        state.items = [...action.payload, ...state.items].slice(0, 10);
        state.totalPages = Math.ceil(
          (state.items.length + action.payload.length) / 10
        );
      })
      .addCase(addMultipleProducts.rejected, (state, action) => {
        state.bulkUploadStatus = "failed";
        state.bulkUploadError =
          action.payload?.error || "Failed to add multiple products";
      });
  },
});

export const { addProductManually, removeProduct } = productsSlice.actions;
export default productsSlice.reducer;
