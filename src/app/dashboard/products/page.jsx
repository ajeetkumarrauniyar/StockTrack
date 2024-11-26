"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/store/productsSlice";
import { AddProductForm } from "@/app/dashboard/(components)/add-product-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { BulkProductUpload } from "@/app/dashboard/(components)/bulk-product-upload";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const status = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);
  const totalPages = useSelector((state) => state.products.totalPages);
  const currentPage = useSelector((state) => state.products.currentPage);

  const limit = 10;

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  const handlePageChange = (page) => {
    dispatch(fetchProducts({ page, limit }));
  };

  // Format currency with error handling
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "N/A";
    return `₹${Number(value).toFixed(2)}`;
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Add Products</h2>
      <AddProductForm />
      <BulkProductUpload />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Packaging</TableHead>
            <TableHead>MRP</TableHead>
            <TableHead>Net Sell Rate</TableHead>
            <TableHead>Opening Stock</TableHead> 
            <TableHead>Stock Quantity</TableHead>
            <TableHead>Minimum Stock Threshold</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product._id}
              className={
                product.stockQuantity < product.minimumStockThreshold
                  ? "bg-red-50"
                  : ""
              }
            >
              <TableCell>{product.name || "N/A"}</TableCell>
              <TableCell>{product.description || "N/A"}</TableCell>
              <TableCell>{product.packaging || "N/A"}</TableCell>
              <TableCell>{formatCurrency(product.mrp)}</TableCell>
              <TableCell>{formatCurrency(product.rate)}</TableCell>
              <TableCell>{product.openingStock || "N/A"}</TableCell>
              <TableCell>{product.stockQuantity ?? "N/A"}</TableCell>
              <TableCell>{product.minimumStockThreshold ?? "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
