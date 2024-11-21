"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPurchases } from "@/store/purchasesSlice";
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
import { Pagination } from "@/components/pagination";

export default function PurchaseBookPage() {
  const dispatch = useDispatch();
  const purchases = useSelector((state) => state.purchases.items);
  const status = useSelector((state) => state.purchases.status);
  const error = useSelector((state) => state.purchases.error);
  const totalPages = useSelector((state) => state.purchases.totalPages);
  const currentPage = useSelector((state) => state.purchases.currentPage);

  const limit = 10;

  useEffect(() => {
    dispatch(fetchPurchases({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  const handlePageChange = (page) => {
    dispatch(fetchPurchases({ page, limit }));
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
      <h2 className="text-2xl font-bold">Purchase Book</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Party Name</TableHead>
            <TableHead>Total Quantity</TableHead>
            <TableHead>Total Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase._id}>
              <TableCell>
                {format(new Date(purchase.date), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>{purchase.invoiceNumber}</TableCell>
              <TableCell>{purchase.partyName}</TableCell>
              <TableCell>{purchase.totalQuantity}</TableCell>
              <TableCell>{formatCurrency(purchase.totalAmount)}</TableCell>
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
