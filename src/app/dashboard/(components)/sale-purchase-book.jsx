"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPurchases } from "@/store/purchasesSlice";
import { selectUserRole } from "@/store/authSlice";
import { fetchSales } from "@/store/salesSlice";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowUpDown, Edit, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Pagination } from "@/components/pagination";
import { InvoiceGenerator } from "@/app/dashboard/(components)/invoice-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditSaleModal } from "./edit-sale-modal";
import { Input } from "@/components/ui/input";

export default function SalePurchaseBookComponent({ type }) {
  const dispatch = useDispatch();
  const transactions = useSelector((state) =>
    type === "sale" ? state.sales.items : state.purchases.items
  );
  const status = useSelector((state) =>
    type === "sale" ? state.sales.status : state.purchases.status
  );
  const error = useSelector((state) =>
    type === "sale" ? state.sales.error : state.purchases.error
  );
  const totalPages = useSelector((state) =>
    type === "sale" ? state.sales.totalPages : state.purchases.totalPages
  );
  const currentPage = useSelector((state) =>
    type === "sale" ? state.sales.currentPage : state.purchases.currentPage
  );

  const userRole = useSelector(selectUserRole);

  const [editingSale, setEditingSale] = useState(null);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const limit = 10;

  useEffect(() => {
    if (type === "sale") {
      dispatch(fetchSales({ page: currentPage, limit }));
    } else {
      dispatch(fetchPurchases({ page: currentPage, limit }));
    }
  }, [dispatch, currentPage, limit, type]);

  const handlePageChange = (page) => {
    if (type === "sale") {
      dispatch(fetchSales({ page, limit }));
    } else {
      dispatch(fetchPurchases({ page, limit }));
    }
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

  // Format currency with error handling
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "N/A";
    return `
    ₹ ${Number(value)
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Define columns for the table
  const columns = [
    {
      accessorKey: "date",
      // header: "Date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => format(new Date(row.original.date), "dd/MM/yyyy"),
    },
    {
      accessorKey: "invoiceNumber",
      // header: "Invoice Number",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Invoice Number
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "partyName",
      // header: "Party Name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Party Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    ...(type === "purchase"
      ? [
          {
            accessorKey: "totalQuantity",
            // header: "Total Quantity",
            header: ({ column }) => {
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                >
                  Total Quantity
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: "totalAmount",
      // header: () => (type === "sale" ? "Amount" : "Total Amount"),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {type === "sale" ? "Amount" : "Total Amount"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => (
        <div className="text-right">{formatCurrency(getValue())}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center">
          <InvoiceGenerator transaction={{ ...row.original, type }} />
          {type === "sale" && userRole === "admin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditSale(row.original)}
              className="ml-2"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Create table instance
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

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
        <CardTitle>
          {type === "sale" ? "Sales Book" : "Purchase Book"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Party Name</TableHead>
              {type === "purchase" && <TableHead>Total Quantity</TableHead>}
              <TableHead className="text-right">
                {type === "sale" ? "Amount" : "Total Amount"}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>
                  {format(new Date(transaction.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{transaction.invoiceNumber}</TableCell>
                <TableCell>{transaction.partyName}</TableCell>
                {type === "purchase" && (
                  <TableCell>{transaction.totalQuantity}</TableCell>
                )}
                <TableCell className="text-right">
                  {formatCurrency(transaction.totalAmount)}
                </TableCell>
                <TableCell>
                  <InvoiceGenerator transaction={{ ...transaction, type }} />
                  {type === "sale" && userRole === "admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSale(transaction)}
                      className="ml-2"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table> */}
        <ScrollArea className="w-full rounded-md border">
          <div className="flex items-center py-4 px-4 space-between border-b border-gray-200">
            <Input
              placeholder="Filter customer..."
              value={table.getColumn("partyName")?.getFilterValue() ?? ""} 
              onChange={(event) =>
                table.getColumn("partyName")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </CardContent>
      {editingSale && userRole === "admin" && (
        <EditSaleModal
          sale={editingSale}
          onClose={() => setEditingSale(null)}
          onUpdate={handleUpdateSale}
        />
      )}
    </Card>
  );
}
