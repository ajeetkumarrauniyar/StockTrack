"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProduct } from "@/store/productsSlice";
import { selectUserRole } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { addMonths, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function AddProductForm() {
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);

  const [name, setName] = useState("");
  // const [description, setDescription] = useState("");
  const [packaging, setPackaging] = useState("");
  const [rate, setRate] = useState("");
  const [mrp, setMrp] = useState("");
  const [openingStock, setOpeningStock] = useState("");
  const [minimumStockThreshold, setMinimumStockThreshold] = useState("12");
  const [mfgDate, setMfgDate] = useState(undefined);
  const [monthsUpToExpiry, setMonthsUpToExpiry] = useState("3");
  const [expDate, setExpDate] = useState(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!expDate && mfgDate && monthsUpToExpiry) {
      const calculatedExpDate = addMonths(
        mfgDate,
        parseInt(monthsUpToExpiry, 10)
      );
      setExpDate(calculatedExpDate);
    }
  }, [mfgDate, monthsUpToExpiry, expDate]);

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Product name is required";
    if (!packaging.trim()) errors.packaging = "Packaging is required";
    // if (!mfgDate.trim()) errors.mfgDate = "Manufacturing Date is required";
    // if (!monthsUpToExpiry.trim()) errors.monthsUpToExpiry = "Months is required";
    if (!expDate || isNaN(expDate.getTime()))
      errors.expDate = "Expiry Date is required";
    if (!rate.trim() || parseFloat(rate) <= 0)
      errors.rate = "Valid rate is required";
    if (!mrp || parseFloat(mrp) <= 0) errors.mrp = "Valid MRP is required";
    if (openingStock && parseInt(openingStock) < 0)
      errors.openingStock = "Opening Stock quantity cannot be negative";
    if (!minimumStockThreshold || parseInt(minimumStockThreshold) < 0)
      errors.minimumStockThreshold =
        "Minimum stock threshold must be a non-negative number";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      setError("Please correct the highlighted errors before submitting.");
      return;
    }

    try {
      const initialStock = openingStock ? parseInt(openingStock) : 0;

      await dispatch(
        addProduct({
          name: name.trim().toUpperCase(),
          // description,
          mfgDate,
          expDate,
          packaging,
          mrp: parseFloat(mrp),
          rate: rate ? parseFloat(rate) : 0,
          openingStock: initialStock, // Set opening stock
          stockQuantity: initialStock, // Initialize current stock to opening stock
          minimumStockThreshold: minimumStockThreshold
            ? parseInt(minimumStockThreshold)
            : 12,
        })
      ).unwrap();

      // Reset form
      setName("");
      // setDescription("");
      setPackaging("");
      setMfgDate(null);
      setExpDate(null);
      setMonthsUpToExpiry("");
      setMrp("");
      setRate("");
      setOpeningStock("");
      setMinimumStockThreshold("12");
    } catch (err) {
      setError("Failed to add product. Please try again.");
      if (err.response?.data?.details) {
        setFieldErrors(err.response.data.details);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Product Name */}
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className={fieldErrors.name ? "text-destructive" : ""}
        >
          Product Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={fieldErrors.name ? "border-destructive" : ""}
        />
        {fieldErrors.name && (
          <p className="text-sm text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      {/* Manufacturing Date, Months Upto Expiry, Expiry Date and Packaging */}
      <div className="grid grid-cols-4 gap-4">
        {/* Manufacturing Date */}
        <div className="space-y-2">
          <Label htmlFor="mfgDate">Mfg. Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !mfgDate && "text-muted-foreground"
                )}
              >
                {mfgDate ? format(mfgDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={mfgDate}
                onSelect={(date) => {
                  setMfgDate(date);
                }}
                disabled={(date) => date > new Date()} // Prevent future dates from being selected
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Months Upto Expiry */}
        <div className="space-y-2">
          <Label htmlFor="monthsUpToExpiry">Expiry (Months)</Label>
          <Input
            id="monthsUpToExpiry"
            type="number"
            value={monthsUpToExpiry}
            onChange={(e) => setMonthsUpToExpiry(e.target.value)}
          />
        </div>

        {/* Expiry Date */}
        <div className="space-y-2">
          <Label
            htmlFor="expDate"
            className={fieldErrors.expDate ? "text-destructive" : ""}
          >
            Exp. Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !expDate && "text-muted-foreground"
                )}
              >
                {expDate ? format(expDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expDate}
                onSelect={setExpDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {fieldErrors.expDate && (
            <p className="text-sm text-destructive">{fieldErrors.expDate}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="packaging">Packaging</Label>
          <Input
            id="packaging"
            value={packaging}
            onChange={(e) => setPackaging(e.target.value)}
          />
        </div>
      </div>

      {/* MRP, Net Rate, Stock Quantity, Minimum Stock Threshold */}
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="mrp"
            className={fieldErrors.mrp ? "text-destructive" : ""}
          >
            MRP
          </Label>
          <Input
            id="mrp"
            type="number"
            step="0.01"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            required
            className={fieldErrors.mrp ? "border-destructive" : ""}
          />
          {fieldErrors.mrp && (
            <p className="text-sm text-destructive">{fieldErrors.mrp}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="rate"
            className={fieldErrors.rate ? "text-destructive" : ""}
          >
            Net Sell Rate
          </Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
            className={fieldErrors.rate ? "border-destructive" : ""}
          />
          {fieldErrors.rate && (
            <p className="text-sm text-destructive">{fieldErrors.rate}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="openingStock"
            className={fieldErrors.stockQuantity ? "text-destructive" : ""}
          >
            Opening Stock
          </Label>
          <Input
            id="openingStock"
            type="number"
            value={openingStock}
            onChange={(e) => setOpeningStock(e.target.value)}
            className={fieldErrors.openingStock ? "border-destructive" : ""}
          />
          {fieldErrors.openingStock && (
            <p className="text-sm text-destructive">
              {fieldErrors.openingStock}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="minimumStockThreshold"
            className={
              fieldErrors.minimumStockThreshold ? "text-destructive" : ""
            }
          >
            Minimum Stock Threshold
          </Label>
          <Input
            id="minimumStockThreshold"
            type="number"
            value={minimumStockThreshold}
            onChange={(e) => setMinimumStockThreshold(e.target.value)}
            className={
              fieldErrors.minimumStockThreshold ? "border-destructive" : ""
            }
          />
          {fieldErrors.minimumStockThreshold && (
            <p className="text-sm text-destructive">
              {fieldErrors.minimumStockThreshold}
            </p>
          )}
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || userRole !== "admin"}
        className="w-full mt-4"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding Product...
          </>
        ) : (
          "Add Product"
        )}
      </Button>
      {userRole !== "admin" && (
        <p className="text-sm text-destructive mt-2">
          You do not have permission to add products. Please contact an
          administrator.
        </p>
      )}
    </form>
  );
}
