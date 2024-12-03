"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { manualStockCheck } from "@/utils/stockCheckUtil";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export default function ManualStockCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStockCheck = async () => {
    setIsLoading(true);
    try {
      const result = await manualStockCheck();

      if (result.alertsSent) {
        toast({
          title: "Stock Alert Sent",
          description: `Alert sent for ${result.productsCount} products`,
          variant: "default",
        });
      } else {
        toast({
          title: "No Low Stock",
          description: "No products below stock threshold",
          variant: "secondary",
        });
      }
    } catch (error) {
      toast({
        title: "Stock Alert Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleStockCheck} disabled={isLoading} className="w-full h-2 px-[3px] py-3 mr-7">
        {isLoading ? "Sending Alert..." : "Send Stock Alert"}
      </Button>

      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    </>
  );
}
