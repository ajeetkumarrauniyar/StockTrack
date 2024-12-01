"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addProduct } from "@/store/productsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUserRole } from "@/store/authSlice";

export function AddProductForm() {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [packaging, setPackaging] = useState("");
  const [rate, setRate] = useState("");
  const [mrp, setMrp] = useState("");
  const [openingStock, setOpeningStock] = useState("");
  const [minimumStockThreshold, setMinimumStockThreshold] = useState("12");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const userRole = useSelector(selectUserRole);

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Product name is required";
    if (!packaging.trim()) errors.packaging = "Packaging is required";
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
          name,
          description,
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
      setDescription("");
      setPackaging("");
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
      {/* Description and Packaging */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
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
      {/* MRP, Rate, Stock Quantity, Minimum Stock Threshold */}
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
            Sell Rate
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
            htmlFor="openingStock"
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
    </form>
  );
}
