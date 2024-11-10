import { TransactionForm } from "@/app/dashboard/(components)/transaction-form";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">New Sale</h2>
      <TransactionForm type="sale" />
    </div>
  );
}
