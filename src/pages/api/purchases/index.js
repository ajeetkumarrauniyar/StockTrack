import dbConnect from "@/lib/dbConnect";
import { Purchase } from "@/models/SalePurchase";
import Product from "@/models/Product";

export default async function handler(req, res) {
  const { method } = req;

  try {
    await dbConnect();

    switch (method) {
      case "GET":
        try {
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;
          const skip = (page - 1) * limit;

          const totalPurchases = await Purchase.countDocuments();
          const totalPages = Math.ceil(totalPurchases / limit);

          const purchases = await Purchase.find({})
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate("products.product");

          return res.status(200).json({
            success: true,
            data: purchases,
            currentPage: page,
            totalPages,
            totalItems: totalPurchases,
          });
        } catch (error) {
          console.error("Error fetching purchases:", error);
          return res.status(400).json({
            success: false,
            message: "Failed to fetch purchases",
            error: error.message,
          });
        }

      case "POST":
        try {
          const {
            invoiceNumber,
            partyName,
            date,
            products,
            totalQuantity,
            totalAmount,
          } = req.body;

          // Validate required fields
          if (!invoiceNumber || !partyName || !date || !products?.length) {
            return res.status(400).json({
              success: false,
              message: "Missing required fields",
              details: {
                invoiceNumber: !invoiceNumber,
                partyName: !partyName,
                date: !date,
                products: !products?.length,
              },
            });
          }

          // Validate products data
          for (const product of products) {
            if (!product.product || !product.quantity || !product.rate) {
              return res.status(400).json({
                success: false,
                message: "Invalid product data",
                details: {
                  productId: !product.product,
                  quantity: !product.quantity,
                  rate: !product.rate,
                },
              });
            }
          }

          // Start a session for the transaction
          const session = await Purchase.startSession();
          let purchase;

          try {
            await session.withTransaction(async () => {
              // Create the purchase
              purchase = await Purchase.create(
                [
                  {
                    invoiceNumber,
                    partyName,
                    date,
                    products: products.map(
                      ({ product, quantity, rate, mrp, amount }) => ({
                        product,
                        quantity,
                        rate,
                        mrp,
                        amount,
                      })
                    ),
                    totalQuantity,
                    totalAmount,
                  },
                ],
                { session }
              );

              purchase = purchase[0];

              // Update product stock
              for (const item of products) {
                const updatedProduct = await Product.findByIdAndUpdate(
                  item.product,
                  { $inc: { stockQuantity: item.quantity } },
                  { session, new: true }
                );

                if (!updatedProduct) {
                  throw new Error(`Product with ID ${item.product} not found`);
                }
              }
            });

            await session.endSession();
            return res.status(201).json({
              success: true,
              data: purchase,
            });
          } catch (error) {
            await session.abortTransaction();
            throw error;
          } finally {
            session.endSession();
          }
        } catch (error) {
          console.error("Error creating purchase:", error);
          return res.status(400).json({
            success: false,
            message: "Failed to create purchase",
            error: error.message,
          });
        }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({
          success: false,
          message: `Method ${method} Not Allowed`,
        });
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
}
