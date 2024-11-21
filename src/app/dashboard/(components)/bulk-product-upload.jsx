"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addMultipleProducts } from "@/store/productsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Download } from "lucide-react";

export function BulkProductUpload() {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/products/bulk-product-upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error messages
        throw new Error(result.message || "Upload failed");
      }

      // Dispatch the products to Redux store
      await dispatch(addMultipleProducts(result.products)).unwrap();

      setSuccess(true);
      // Optional: show number of products added
      setSuccess(`Successfully added ${result.productsAdded} products`);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload products. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = `name,description,packaging,mrp,rate,stockQuantity,minimumStockThreshold
                        Product A,Description for A,Box,100,90,50,10
                        Product B,Description for B,Bottle,200,180,30,5
                        Product C,Description for C,Pack,150,135,40,8`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "sample_products.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input type="file" accept=".csv" onChange={handleFileChange} />
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload CSV"
          )}
        </Button>
        <Button onClick={handleDownloadSampleCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Sample CSV
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
