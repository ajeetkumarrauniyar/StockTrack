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
        const productId = req.query.productId;

        const skip = (page - 1) * limit;


        if (!productId) {
          return res.status(400).json({
            success: false,
            error: "Product ID is required",
          });
        }

        // Fetch purchases and sales for the specific product
        const purchases = await Purchase.find({
          "products.product": productId,
        }).sort({ date: 1 });
        const sales = await Sale.find({ "products.product": productId }).sort({
          date: 1,
        });

        // Combine and sort transactions
        const allTransactions = [...purchases, ...sales].sort(
          (a, b) => a.date - b.date
        );

        // Calculate running balance for the specific product
        let balance = 0;

        const inventoryTransactions = allTransactions.map((transaction) => {
          const productItem = transaction.products.find(
            (item) => item.product.toString() === productId
          );

          const quantity =
            transaction.constructor.modelName === "Purchase"
              ? productItem.quantity
              : -productItem.quantity;
          balance += quantity;

          return {
            _id: `${transaction._id}-${productId}`,
            date: transaction.date,
            invoiceNumber: transaction.invoiceNumber,
            partyName: transaction.partyName,
            type: transaction.constructor.modelName.toLowerCase(),
            quantity: productItem.quantity,
            balance: balance,
          };
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
      break; // const inventoryTransactions = allTransactions.flatMap((transaction) => {
  }
}
