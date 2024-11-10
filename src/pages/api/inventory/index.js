import dbConnect from "@/lib/dbConnect";
import { Purchase, Sale } from "@/models/SalePurchase";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Fetch purchases and sales
        const purchases = await Purchase.find({}).sort({ date: 1 });
        const sales = await Sale.find({}).sort({ date: 1 });

        // Combine and sort transactions
        const allTransactions = [...purchases, ...sales].sort(
          (a, b) => a.date - b.date
        );

        // Calculate running balance for each product
        const productBalances = {};
        const inventoryTransactions = allTransactions.flatMap((transaction) => {
          return transaction.products.map((item) => {
            const productId = item.product.toString();
            if (!productBalances[productId]) {
              productBalances[productId] = 0;
            }

            const quantity =
              transaction.constructor.modelName === "Purchase"
                ? item.quantity
                : -item.quantity;
            productBalances[productId] += quantity;

            return {
              _id: `${transaction._id}-${item.product}`,
              date: transaction.date,
              invoiceNumber: transaction.invoiceNumber,
              partyName: transaction.partyName,
              productId: item.product,
              productName: item.productName,
              type: transaction.constructor.modelName.toLowerCase(),
              quantity: item.quantity,
              balance: productBalances[productId],
            };
          });
        });

        // Apply pagination
        const paginatedTransactions = inventoryTransactions.slice(
          skip,
          skip + limit
        );

        const totalTransactions = inventoryTransactions.length;
        const totalPages = Math.ceil(totalTransactions / limit);

        res.status(200).json({
          success: true,
          data: paginatedTransactions,
          currentPage: page,
          totalPages: totalPages,
        });
      } catch (error) {
        console.error("Error fetching inventory transactions:", error);
        res.status(400).json({
          success: false,
          error: "Failed to fetch inventory transactions",
        });
      }
      break;

    default:
      res.status(405).json({ success: false, error: "Method not allowed" });
      break;
  }
}
