"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSale } from "@/store/salesSlice";
import { addPurchase } from "@/store/purchasesSlice";
import { fetchProducts } from "@/store/productsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function TransactionForm({ type }) {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [partyName, setPartyName] = useState(type === "sale" ? "CASH" : "");
  const [billDate, setBillDate] = useState(new Date());
  const [transactionItems, setTransactionItems] = useState([
    { product: "", quantity: 1, rate: 0, mrp: 0, amount: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 100 }));
    generateInvoiceNumber();
  }, [dispatch, type]);

  const generateInvoiceNumber = async () => {
    try {
      const response = await fetch(`/api/${type}s/generate-invoice-number`);
      if (!response.ok) {
        throw new Error(`Failed to generate invoice number for ${type}`);
      }
      const data = await response.json();
      setInvoiceNumber(data.invoiceNumber);
    } catch (error) {
      console.error(`Error generating ${type} invoice number:`, error);
      setError(
        "Failed to generate invoice number. Please refresh the page or contact support."
      );
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!invoiceNumber.trim()) {
      errors.invoiceNumber = "Invoice number is required";
    }
    if (!partyName.trim()) {
      errors.partyName = "Party name is required";
    }
    if (!billDate) {
      errors.billDate = "Bill date is required";
    }

    // Validate transaction items
    const itemErrors = [];
    transactionItems.forEach((item, index) => {
      const currentErrors = {};
      if (!item.product) {
        currentErrors.product = "Product selection is required";
      }
      if (!item.quantity || item.quantity <= 0) {
        currentErrors.quantity = "Valid quantity is required";
      }
      if (!item.rate || item.rate <= 0) {
        currentErrors.rate = "Valid rate is required";
      }
      if (type === "purchase" && (!item.mrp || item.mrp <= 0)) {
        currentErrors.mrp = "Valid MRP is required";
      }
      if (Object.keys(currentErrors).length > 0) {
        itemErrors[index] = currentErrors;
      }
    });

    if (itemErrors.length > 0) {
      errors.items = itemErrors;
    }

    if (transactionItems.length === 0) {
      errors.items = "At least one product is required";
    }

    return errors;
  };

  const parseErrorResponse = (error) => {
    if (error.response?.data?.details) {
      // Handle structured validation errors from the API
      return {
        message: error.response.data.message,
        details: error.response.data.details,
      };
    } else if (error.response?.data?.message) {
      // Handle general API errors
      return { message: error.response.data.message };
    } else if (error.message) {
      // Handle JavaScript errors
      return { message: error.message };
    }
    // Fallback error message
    return { message: "An unexpected error occurred. Please try again." };
  };

  const handleProductChange = (index, productId) => {
    const product = products.find((p) => p._id === productId);
    const updatedItems = [...transactionItems];
    updatedItems[index] = {
      ...updatedItems[index],
      product: productId,
      rate: product.rate,
      mrp: product.mrp,
      amount: product.rate * updatedItems[index].quantity,
    };
    setTransactionItems(updatedItems);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...transactionItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: Number(quantity),
      amount: updatedItems[index].rate * Number(quantity),
    };
    setTransactionItems(updatedItems);
  };

  const handleRateChange = (index, newRate) => {
    const updatedItems = [...transactionItems];
    updatedItems[index] = {
      ...updatedItems[index],
      rate: Number(newRate),
      amount: Number(newRate) * updatedItems[index].quantity,
    };
    setTransactionItems(updatedItems);
  };

  const handleMRPChange = (index, mrp) => {
    if (type === "purchase") {
      const updatedItems = [...transactionItems];
      updatedItems[index] = {
        ...updatedItems[index],
        mrp: Number(mrp),
      };
      setTransactionItems(updatedItems);
    }
  };

  const addTransactionItem = () => {
    setTransactionItems([
      ...transactionItems,
      { product: "", quantity: 1, rate: 0, mrp: 0, amount: 0 },
    ]);
  };

  const removeTransactionItem = (index) => {
    const updatedItems = transactionItems.filter((_, i) => i !== index);
    setTransactionItems(updatedItems);
  };

  const calculateTotals = () => {
    return transactionItems.reduce(
      (totals, item) => ({
        quantity: totals.quantity + item.quantity,
        amount: totals.amount + item.amount,
      }),
      { quantity: 0, amount: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    // Validate form before submission
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      setError("Please correct the highlighted errors before submitting.");
      return;
    }

    const { quantity: totalQuantity, amount: totalAmount } = calculateTotals();

    try {
      const transaction = {
        invoiceNumber,
        partyName,
        date: billDate,
        products: transactionItems.map(
          ({ product, quantity, rate, mrp, amount }) => ({
            product,
            quantity,
            rate,
            mrp,
            amount,
          })
        ),
        totalQuantity,
        totalAmount,
      };

      if (type === "sale") {
        await dispatch(addSale(transaction)).unwrap();
      } else {
        await dispatch(addPurchase(transaction)).unwrap();
      }

      // Reset form
      setPartyName("");
      setBillDate(new Date());
      setTransactionItems([{ product: "", quantity: 1, rate: 0, amount: 0 }]);
      generateInvoiceNumber();
    } catch (err) {
      const errorInfo = parseErrorResponse(err);
      // setError(`Failed to add ${type}. Please try again.`);
      setError(errorInfo.message);
      if (errorInfo.details) {
        setFieldErrors(errorInfo.details);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="invoiceNumber"
            className={fieldErrors.invoiceNumber ? "text-destructive" : ""}
          >
            Invoice Number
          </Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            readOnly={type === "sale"}
            required
            className={fieldErrors.invoiceNumber ? "border-destructive" : ""}
          />
          {fieldErrors.invoiceNumber && (
            <p className="text-sm text-destructive">
              {fieldErrors.invoiceNumber}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="partyName"
            className={fieldErrors.partyName ? "text-destructive" : ""}
          >
            Party Name
          </Label>
          <Input
            id="partyName"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            required
            className={fieldErrors.partyName ? "border-destructive" : ""}
          />
          {fieldErrors.partyName && (
            <p className="text-sm text-destructive">{fieldErrors.partyName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="billDate"
            className={fieldErrors.billDate ? "text-destructive" : ""}
          >
            Bill Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !billDate && "text-muted-foreground",
                  fieldErrors.billDate && "border-destructive"
                )}
              >
                {billDate ? format(billDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={billDate}
                onSelect={setBillDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {fieldErrors.billDate && (
            <p className="text-sm text-destructive">{fieldErrors.billDate}</p>
          )}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>MRP</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Net Rate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionItems.map((item, index) => (
            <TableRow
              key={index}
              className={fieldErrors.items?.[index] ? "bg-destructive/5" : ""}
            >
              {/* Select a Product */}
              <TableCell>
                <Select
                  value={item.product}
                  onValueChange={(value) => handleProductChange(index, value)}
                >
                  <SelectTrigger
                    className={
                      fieldErrors.items?.[index]?.product
                        ? "border-destructive"
                        : ""
                    }
                  >
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
                {fieldErrors.items?.[index]?.product && (
                  <p className="text-sm text-destructive mt-1">
                    {fieldErrors.items[index].product}
                  </p>
                )}
              </TableCell>
              {/* MRP */}
              <TableCell>
                {type === "purchase" ? (
                  <div>
                    <Input
                      type="number"
                      value={item.mrp}
                      onChange={(e) => handleMRPChange(index, e.target.value)}
                      min="0"
                      step="0.01"
                      className={
                        fieldErrors.items?.[index]?.mrp
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {fieldErrors.items?.[index]?.mrp && (
                      <p className="text-sm text-destructive mt-1">
                        {fieldErrors.items[index].mrp}
                      </p>
                    )}
                  </div>
                ) : (
                  (item.mrp || 0).toFixed(2)
                )}
              </TableCell>
              {/* Quantity */}
              <TableCell>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  min="1"
                  className={
                    fieldErrors.items?.[index]?.quantity
                      ? "border-destructive"
                      : ""
                  }
                />
                {fieldErrors.items?.[index]?.quantity && (
                  <p className="text-sm text-destructive mt-1">
                    {fieldErrors.items[index].quantity}
                  </p>
                )}
              </TableCell>
              {/* Net Rate */}
              <TableCell>
                <Input
                  type="number"
                  value={item.rate}
                  onChange={(e) => handleRateChange(index, e.target.value)}
                  min="0"
                  step="0.01"
                  className={
                    fieldErrors.items?.[index]?.rate ? "border-destructive" : ""
                  }
                />
                {fieldErrors.items?.[index]?.rate && (
                  <p className="text-sm text-destructive mt-1">
                    {fieldErrors.items[index].rate}
                  </p>
                )}
              </TableCell>
              {/* Amount */}
              <TableCell>{(item.amount || 0).toFixed(2)}</TableCell>
              {/* Action */}
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTransactionItem(index)}
                  className="text-muted-foreground"
                  aria-label="Remove item"
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {/* //TODO: Add a Edit option */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableHeader>
          <TableRow>
            <TableHead className="font-extrabold">Total</TableHead>
            <TableHead className="font-extrabold">{totals.quantity}</TableHead>
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead className="font-extrabold">
              {totals.amount.toFixed(2)}
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Button type="button" onClick={addTransactionItem} variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            `Submit ${type.charAt(0).toUpperCase() + type.slice(1)}`
          )}
        </Button>
      </div>
    </form>
  );
}
