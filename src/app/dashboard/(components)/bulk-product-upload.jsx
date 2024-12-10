"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMultipleProducts } from "@/store/productsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Download } from "lucide-react";
import { selectUserRole } from "@/store/authSlice";

export function BulkProductUpload() {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const userRole = useSelector(selectUserRole);
  const bulkUploadStatus = useSelector(
    (state) => state.products.bulkUploadStatus
  );
  const bulkUploadError = useSelector(
    (state) => state.products.bulkUploadError
  );

  useEffect(() => {
    if (bulkUploadStatus === "succeeded") {
      setSuccess(true);
      setFile(null);
    } else if (bulkUploadStatus === "failed") {
      setError(
        bulkUploadError || "Failed to upload products. Please try again."
      );
    }
  }, [bulkUploadStatus, bulkUploadError]);

  const handleFileChange = useCallback((e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(false);
  }, []);

  const handleUpload = useCallback(async () => {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      await dispatch(addMultipleProducts(result.products)).unwrap();
      setSuccess(`Successfully added ${result.products.length} products`);
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload products. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [file, dispatch]);

  const handleDownloadSampleCSV = useCallback(() => {
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
  }, []);

  const isUploadDisabled =
    !file ||
    isUploading ||
    bulkUploadStatus === "loading" ||
    userRole !== "admin";

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={userRole !== "admin" || isUploading}
          key={file ? file.name : "empty"}
        />
        <Button onClick={handleUpload} disabled={isUploadDisabled}>
          {isUploading || bulkUploadStatus === "loading" ? (
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
