"use client";

// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { fetchSales } from "@/store/salesSlice";
import { Loader2 } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

export function SalesChart() {
  const { sales, isLoading, error } = useDashboardData();

  // const dispatch = useDispatch();
  // const sales = useSelector((state) => state.sales.items);
  // const status = useSelector((state) => state.sales.status);
  // const error = useSelector((state) => state.sales.error);

  // useEffect(() => {
  //   if (status === "idle") {
  //     dispatch(fetchSales({ page: 1, limit: 30 })); // Fetch last 30 days of sales
  //   }
  // }, [status, dispatch]);

  // if (status === "loading") {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // if (status === "failed") {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Safeguard against undefined sales
  if (!sales || sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription>
              No sales data available to display.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Create a new array instead of mutating the original
  const chartData = [...sales]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((sale) => ({
      date: new Date(sale.date).toLocaleDateString(),
      amount: sale.totalAmount,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
