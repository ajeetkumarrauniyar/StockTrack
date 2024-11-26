"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInventoryTransactions } from "@/store/inventorySlice";
import { fetchProducts } from "@/store/productsSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/loader";
import { Pagination } from "@/components/pagination";

export default function InventoryPage() {
  const dispatch = useDispatch();
  const inventoryTransactions = useSelector(
    (state) => state.inventory.transactions
  );
  const inventoryStatus = useSelector((state) => state.inventory.status);
  const inventoryError = useSelector((state) => state.inventory.error);
  const totalPages = useSelector((state) => state.inventory.totalPages);
  const currentPage = useSelector((state) => state.inventory.currentPage);

  const products = useSelector((state) => state.products.items);
  const productsStatus = useSelector((state) => state.products.status);
  const productsError = useSelector((state) => state.products.error);

  const [selectedProduct, setSelectedProduct] = useState("");

  const limit = 20;

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  useEffect(() => {
    if (selectedProduct) {
      dispatch(
        fetchInventoryTransactions({
          page: currentPage,
          limit,
          productId: selectedProduct,
        })
      );
    }
  }, [dispatch, selectedProduct, currentPage, limit]);

  const calculateTransactionsWithBalance = useMemo(() => {
    if (!inventoryTransactions.length || !selectedProduct) return [];

    const product = products.find((p) => p._id === selectedProduct);
    if (!product) return [];

    const openingStock = product.openingStock || 0;
    let runningBalance = openingStock;

    // Sort transactions by date in descending order
    const sortedTransactions = [...inventoryTransactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Calculate running balance for all transactions
    const transactionsWithBalance = sortedTransactions.map((transaction) => {
      const quantity =
        transaction.type === "purchase"
          ? transaction.quantity
          : -transaction.quantity;
      runningBalance += quantity;

      return {
        ...transaction,
        balance: runningBalance,
      };
    });

    // Add opening balance row
    const openingBalanceRow = {
      _id: "opening-balance",
      date: null,
      invoiceNumber: "-",
      partyName: "Opening Balance",
      type: "opening",
      quantity: openingStock,
      balance: openingStock,
    };

    return [...transactionsWithBalance, openingBalanceRow]; // Combine opening balance with transactions
  }, [inventoryTransactions, selectedProduct, products]);

  const handlePageChange = (page) => {
    dispatch(
      fetchInventoryTransactions({ page, limit, productId: selectedProduct })
    );
  };

  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    dispatch(fetchInventoryTransactions({ page: 1, limit, productId }));
  };

  if (productsStatus === "loading" || inventoryStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (productsStatus === "failed" || inventoryStatus === "failed") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{productsError || inventoryError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Inventory Transactions</h2>
      <div className="w-full max-w-xs">
        <Select value={selectedProduct} onValueChange={handleProductChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product._id} value={product._id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedProduct && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead>Receive (In)</TableHead>
                <TableHead>Issue (Out)</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculateTransactionsWithBalance.map((transaction) => (
                <TableRow
                  key={transaction._id}
                  className={
                    transaction.type === "opening"
                      ? "bg-gray-50"
                      : transaction.type === "purchase"
                      ? "bg-gray-150"
                      : transaction.type === "sale"
                      ? "bg-gray-200"
                      : ""
                  }
                >
                  <TableCell>
                    {transaction.date
                      ? format(new Date(transaction.date), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>{transaction.invoiceNumber}</TableCell>
                  <TableCell>{transaction.partyName}</TableCell>
                  <TableCell>
                    {transaction.type === "purchase"
                      ? transaction.quantity
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {transaction.type === "sale" ? transaction.quantity : "-"}
                  </TableCell>
                  <TableCell>{transaction.balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
