"use server";

import { generateEmailContent } from "@/emails/stock-alert-template";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { sendEmail } from "@/service/emailService";

function formatStockMessage(product) {
  const stockDifference = product.stockQuantity - product.minimumStockThreshold;
  const urgencyLevel = getUrgencyLevel(stockDifference);

  return {
    productId: product._id.toString(),
    name: product.name,
    message: `${product.name}: Current stock ${
      product.stockQuantity
    } (${Math.abs(stockDifference)} ${
      stockDifference < 0 ? "below" : "above"
    } threshold of ${product.minimumStockThreshold})`,
    urgencyLevel,
    stockQuantity: product.stockQuantity,
    minimumStockThreshold: product.minimumStockThreshold,
  };
}

function getUrgencyLevel(stockDifference) {
  if (stockDifference < -10) return "CRITICAL";
  if (stockDifference < -5) return "HIGH";
  if (stockDifference < 0) return "MEDIUM";
  return "LOW";
}

function groupByUrgency(alerts) {
  return alerts.reduce((acc, alert) => {
    if (!acc[alert.urgencyLevel]) {
      acc[alert.urgencyLevel] = [];
    }
    acc[alert.urgencyLevel].push(alert);
    return acc;
  }, {});
}

export async function checkLowStockAndSendAlerts() {
  try {
    await dbConnect();

    // Find all products where stock is at or below threshold
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stockQuantity", "$minimumStockThreshold"] },
    }).sort({ stockQuantity: 1 }); // Sort by lowest stock first

    if (lowStockProducts.length > 0) {
      const productAlerts = lowStockProducts.map((product) =>
        formatStockMessage(product)
      );

      const emailContent = generateEmailContent(productAlerts);

      await sendEmail({
        subject: `Stock Alert: ${lowStockProducts.length} Products Need Attention`,
        content: {
          html: emailContent,
        },
      });

      return {
        alertsSent: true,
        productsCount: lowStockProducts.length,
        urgencyBreakdown: Object.entries(groupByUrgency(productAlerts)).reduce(
          (acc, [key, value]) => ({ ...acc, [key]: value.length }),
          {}
        ),
        productDetails: productAlerts, // Include detailed product information
      };
    }

    return {
      alertsSent: false,
      productsCount: 0,
      urgencyBreakdown: {},
      productDetails: [],
    };
  } catch (error) {
    console.error("Error in stock alert system:", error);
    throw new Error(`Stock alert system error: ${error.message}`);
  }
}

// Optional: Add a function to manually trigger stock check
export async function manualStockCheck() {
  return checkLowStockAndSendAlerts();
}
