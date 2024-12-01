import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice";
import salesReducer from "./salesSlice";
import purchasesReducer from "./purchasesSlice";
import inventoryReducer from "./inventorySlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    sales: salesReducer,
    purchases: purchasesReducer,
    inventory: inventoryReducer,
    auth: authReducer,
  },
});
