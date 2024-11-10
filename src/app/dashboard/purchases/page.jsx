import { TransactionForm } from "@/app/dashboard/(components)/transaction-form";

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">New Purchase</h2>

      <TransactionForm type="purchase" />
    </div>
  );
}
