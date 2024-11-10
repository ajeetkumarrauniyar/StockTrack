import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { Sale } from "@/models/SalePurchase";
import { startSession } from "mongoose";

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

          const totalSales = await Sale.countDocuments();
          const totalPages = Math.ceil(totalSales / limit);

          const sales = await Sale.find({})
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate("products.product");

          return res.status(200).json({
            success: true,
            data: sales,
            currentPage: page,
            totalPages,
            totalItems: totalSales,
          });
        } catch (error) {
          console.error("Error fetching sales:", error);
          return res.status(400).json({
            success: false,
            message: "Failed to fetch sales",
            error: error.message,
          });
        }

      case "POST":
        let session;
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
                invoiceNumber: invoiceNumber
                  ? null
                  : "Invoice number is required",
                partyName: partyName ? null : "Party name is required",
                date: date ? null : "Date is required",
                products:
                  products && products.length > 0
                    ? null
                    : "At least one product is required",
              },
            });
          }

          // Validate products data
          const productErrors = products
            .map((product, index) => {
              if (!product.product || !product.quantity || !product.rate) {
                return {
                  index,
                  productId: !product.product ? "Product is required" : null,
                  quantity: !product.quantity ? "Quantity is required" : null,
                  rate: !product.rate ? "Rate is required" : null,
                  mrp: !product.mrp ? "MRP is required" : null,
                };
              }
              return null;
            })
            .filter(Boolean);

          if (productErrors.length > 0) {
            return res.status(400).json({
              success: false,
              message: "Invalid product data",
              details: { products: productErrors },
            });
          }

          // Start a session for the transaction
          session = await startSession();
          session.startTransaction();

          // Create the sale
          const sale = await Sale.create(
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
                    amount,
                    mrp,
                  })
                ),
                totalQuantity,
                totalAmount,
              },
            ],
            { session }
          );

          // Update product stock
          for (const item of products) {
            const product = await Product.findById(item.product).session(
              session
            );

            if (!product) {
              throw new Error(`Product with ID ${item.product} not found`);
            }

            if (product.stockQuantity < item.quantity) {
              throw new Error(
                `Insufficient stock for product: ${product.name}`
              );
            }

            const updatedProduct = await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stockQuantity: -item.quantity } },
              { session, new: true }
            );

            if (!updatedProduct) {
              throw new Error(`Failed to update product ${item.product}`);
            }
          }

          await session.commitTransaction();
          return res.status(201).json({
            success: true,
            data: sale[0],
          });
        } catch (error) {
          console.error("Error creating sale:", error);
          if (session) {
            await session.abortTransaction();
          }
          return res.status(400).json({
            success: false,
            message: "Failed to create sale",
            error: error.message,
          });
        } finally {
          if (session) {
            session.endSession();
          }
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
