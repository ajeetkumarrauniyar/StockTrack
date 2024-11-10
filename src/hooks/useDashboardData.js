import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { createSelector } from "reselect";
import { fetchSales } from "@/store/salesSlice";
import { fetchPurchases } from "@/store/purchasesSlice";
import { fetchProducts } from "@/store/productsSlice";

// Memoized selectors
// const selectSales = (state) => state.sales.items;
// const selectSalesStatus = (state) => state.sales.status;
// const selectSalesError = (state) => state.sales.error;
// const selectPurchases = (state) => state.purchases.items;
// const selectPurchasesStatus = (state) => state.purchases.status;
// const selectPurchasesError = (state) => state.purchases.error;
// const selectProducts = (state) => state.products.items;
// const selectProductsStatus = (state) => state.products.status;
// const selectProductsError = (state) => state.products.error;

// const selectDashboardData = createSelector(
//   [
//     selectSales,
//     selectSalesStatus,
//     selectSalesError,
//     selectPurchases,
//     selectPurchasesStatus,
//     selectPurchasesError,
//     selectProducts,
//     selectProductsStatus,
//     selectProductsError,
//   ],
//   (
//     sales,
//     salesStatus,
//     salesError,
//     purchases,
//     purchasesStatus,
//     purchasesError,
//     products,
//     productsStatus,
//     productsError
//   ) => ({
//     sales,
//     salesStatus,
//     salesError,
//     purchases,
//     purchasesStatus,
//     purchasesError,
//     products,
//     productsStatus,
//     productsError,
//   })
// );

export function useDashboardData() {
  const dispatch = useDispatch();

  // Retrieve sales, purchases, products data, and their statuses from Redux state
  const {
    sales,
    salesStatus,
    salesError,
    purchases,
    purchasesStatus,
    purchasesError,
    products,
    productsStatus,
    productsError,
  } = useSelector((state) => ({
    sales: state.sales.items,
    salesStatus: state.sales.status,
    salesError: state.sales.error,
    purchases: state.purchases.items,
    purchasesStatus: state.purchases.status,
    purchasesError: state.purchases.error,
    products: state.products.items,
    productsStatus: state.products.status,
    productsError: state.products.error,
  }));
  //   } = useSelector(selectDashboardData);

  // useEffect(() => {
  //   // Fetch data with larger limits for accurate calculations in dashboard
  //   dispatch(fetchSales({ page: 1, limit: 1000 }));
  //   dispatch(fetchPurchases({ page: 1, limit: 1000 }));
  //   dispatch(fetchProducts({ page: 1, limit: 1000 }));
  // }, [dispatch]);

  useEffect(() => {
    // Only fetch if we don't have data already
    if (salesStatus === "idle") {
      dispatch(fetchSales({ page: 1, limit: 1000 }));
    }
    if (purchasesStatus === "idle") {
      dispatch(fetchPurchases({ page: 1, limit: 1000 }));
    }
    if (productsStatus === "idle") {
      dispatch(fetchProducts({ page: 1, limit: 1000 }));
    }
  }, [dispatch, salesStatus, purchasesStatus, productsStatus]);

  const isLoading =
    salesStatus === "loading" ||
    purchasesStatus === "loading" ||
    productsStatus === "loading";

  const error = salesError || purchasesError || productsError;

  return {
    sales,
    purchases,
    products,
    isLoading,
    error,
  };
}
