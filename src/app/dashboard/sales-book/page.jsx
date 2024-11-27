"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchSales } from "@/store/salesSlice";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { updateSale } from "@/store/salesSlice";
import { Loader2 } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { InvoiceGenerator } from "@/app/dashboard/(components)/invoice-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalesBookPage() {
  const dispatch = useDispatch();
  const sales = useSelector((state) => state.sales.items);
  const status = useSelector((state) => state.sales.status);
  const error = useSelector((state) => state.sales.error);
  const totalPages = useSelector((state) => state.sales.totalPages);
  const currentPage = useSelector((state) => state.sales.currentPage);

  const [editingSale, setEditingSale] = useState(null);

  const limit = 10;

  useEffect(() => {
    dispatch(fetchSales({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  const handlePageChange = (page) => {
    dispatch(fetchSales({ page, limit }));
  };

  const handleEditSale = (sale) => {
    setEditingSale(sale);
  };

  const handleUpdateSale = async (updatedSale) => {
    try {
      await dispatch(updateSale(updatedSale)).unwrap();
      setEditingSale(null);
      dispatch(fetchSales({ page: currentPage, limit }));
    } catch (error) {
      console.error("Failed to update sale:", error);
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Sales Book</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Party Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale._id}>
                <TableCell>
                  {new Date(sale.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{sale.invoiceNumber}</TableCell>
                <TableCell>{sale.partyName}</TableCell>
                <TableCell className="text-right">
                  ₹{sale.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <InvoiceGenerator
                    transaction={{
                      ...sale,
                      type: "sale",
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSale(sale)}
                    className="ml-2"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </CardContent>
      {editingSale && (
        <EditSaleModal
          sale={editingSale}
          onClose={() => setEditingSale(null)}
          onUpdate={handleUpdateSale}
        />
      )}
    </Card>
  );
}
