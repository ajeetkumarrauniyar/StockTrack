import React from "react";
import SalePurchaseBookComponent from "@/app/dashboard/(components)/sale-purchase-book";

const PurchaseBookPage = () => {
  return (
    <div className="space-y-6">
      <SalePurchaseBookComponent type="sale" />
    </div>
  );
};

export default PurchaseBookPage;
