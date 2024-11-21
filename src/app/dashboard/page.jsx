"use client";

import { SalesChart } from "./(components)/sales-chart";
import { PurchaseChart } from "./(components)/purchase-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { sales, purchases, products, isLoading, error } = useDashboardData();

  // Function to calculate totals and monthly percentage changes for sales/purchases
  const calculateTotalAndPercentage = (items, key) => {
    const currentDate = new Date();
    const lastMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const twoMonthsAgoDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 2,
      1
    );

    // Total for all items
    const total = items.reduce((sum, item) => sum + item[key], 0);

    // Total for last month
    const lastMonthTotal = items
      .filter(
        (item) =>
          new Date(item.date) >= lastMonthDate &&
          new Date(item.date) < currentDate
      )
      .reduce((sum, item) => sum + item[key], 0);

    // Total for two months ago
    const twoMonthsAgoTotal = items
      .filter(
        (item) =>
          new Date(item.date) >= twoMonthsAgoDate &&
          new Date(item.date) < lastMonthDate
      )
      .reduce((sum, item) => sum + item[key], 0);

    // Calculate percentage change comparing last month and two months ago
    const percentageChange =
      twoMonthsAgoTotal !== 0
        ? ((lastMonthTotal - twoMonthsAgoTotal) / twoMonthsAgoTotal) * 100
        : lastMonthTotal > 0
        ? 100
        : 0;

    return { total, lastMonthTotal, percentageChange };
  };

  // Calculate totals and monthly percentage changes for sales
  const {
    total: totalSales,
    lastMonthTotal: lastMonthSales,
    percentageChange: salesPercentageChange,
  } = calculateTotalAndPercentage(sales, "totalAmount");
  // Calculate totals and monthly percentage changes for purchases
  const {
    total: totalPurchases,
    lastMonthTotal: lastMonthPurchases,
    percentageChange: purchasesPercentageChange,
  } = calculateTotalAndPercentage(purchases, "totalAmount");

  // Function to calculate current stock value and monthly percentage change in stock value
  const calculateStockValue = (productsData, salesData, purchasesData) => {
    const currentDate = new Date();
    const lastMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );

    // Calculate total stock value based on Rate and stock quantity
    const currentStockValue = productsData.reduce(
      (sum, product) => sum + (product.rate || 0) * product.stockQuantity,
      0
    );

    // Create maps for last month's sales and purchases quantities
    const lastMonthSalesMap = salesData
      .filter((sale) => new Date(sale.date) >= lastMonthDate)
      .reduce((map, sale) => {
        sale.products.forEach((item) => {
          map[item.product] = (map[item.product] || 0) + item.quantity;
        });
        return map;
      }, {});

    const lastMonthPurchasesMap = purchasesData
      .filter((purchase) => new Date(purchase.date) >= lastMonthDate)
      .reduce((map, purchase) => {
        purchase.products.forEach((item) => {
          map[item.product] = (map[item.product] || 0) + item.quantity;
        });
        return map;
      }, {});

    // Calculate last month's stock value after adjustments
    const lastMonthStockValue = productsData.reduce((sum, product) => {
      const lastMonthQuantity =
        product.stockQuantity +
        (lastMonthSalesMap[product._id] || 0) -
        (lastMonthPurchasesMap[product._id] || 0);
      return sum + (product.mrp || 0) * Math.max(lastMonthQuantity, 0);
    }, 0);

    // Calculate percentage change in stock value compared to last month
    const stockValuePercentageChange =
      lastMonthStockValue !== 0
        ? ((currentStockValue - lastMonthStockValue) / lastMonthStockValue) *
          100
        : currentStockValue > 0
        ? 100
        : 0;

    return { currentStockValue, stockValuePercentageChange };
  };

  // Calculate current stock value and monthly percentage change
  const { currentStockValue, stockValuePercentageChange } = calculateStockValue(
    products,
    sales,
    purchases
  );

  // Calculate low stock items based on a threshold value
  const lowStockThreshold = 10;
  const lowStockItems = products.filter(
    (product) => product.stockQuantity < lowStockThreshold
  ).length;

  // Calculate low stock items change from last week
  const lastWeekDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekSalesMap = sales
    .filter((sale) => new Date(sale.date) >= lastWeekDate)
    .reduce((map, sale) => {
      sale.products.forEach((item) => {
        map[item.product] = (map[item.product] || 0) + item.quantity;
      });
      return map;
    }, {});

  const lastWeekPurchasesMap = purchases
    .filter((purchase) => new Date(purchase.date) >= lastWeekDate)
    .reduce((map, purchase) => {
      purchase.products.forEach((item) => {
        map[item.product] = (map[item.product] || 0) + item.quantity;
      });
      return map;
    }, {});

  const lastWeekLowStockItems = products.filter((product) => {
    const lastWeekQuantity =
      product.stockQuantity +
      (lastWeekSalesMap[product._id] || 0) -
      (lastWeekPurchasesMap[product._id] || 0);
    return lastWeekQuantity < lowStockThreshold;
  }).length;

  const lowStockItemsChange = lowStockItems - lastWeekLowStockItems;

  // Render loader if data is still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render error alert if any data fetch fails
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Render the dashboard with calculated metrics
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {salesPercentageChange > 0 ? "+" : ""}
              {salesPercentageChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalPurchases.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {purchasesPercentageChange > 0 ? "+" : ""}
              {purchasesPercentageChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Stock Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{currentStockValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stockValuePercentageChange > 0 ? "+" : ""}
              {stockValuePercentageChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockItemsChange > 0 ? "+" : ""}
              {lowStockItemsChange} from last week
            </p>
          </CardContent>
        </Card>
      </div>
      <SalesChart />
      <PurchaseChart />
    </div>
  );
}
