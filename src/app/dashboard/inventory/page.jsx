"use client";

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState("");
  const limit = 20;

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 100 })); // Fetch all products for the dropdown
  }, [dispatch]);

  useEffect(() => {
    if (selectedProduct) {
      dispatch(
        fetchInventoryTransactions({ page, limit, productId: selectedProduct })
      );
    }
  }, [dispatch, page, limit, selectedProduct]);

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    setPage(1); // Reset to first page when changing product
  };

  if (productsStatus === "loading" || inventoryStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                <TableHead>Invoice No</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Receive (In)</TableHead>
                <TableHead>Issue (Out)</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>
                    {format(new Date(transaction.date), "dd/MM/yyyy")}
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
          <div className="flex justify-between items-center">
            <Button onClick={handlePrevPage} disabled={page === 1}>
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button onClick={handleNextPage} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
