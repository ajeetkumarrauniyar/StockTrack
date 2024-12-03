"use server";

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
    minimumStockThreshold: product.minimumStockThreshold
  };
}

function getUrgencyLevel(stockDifference) {
  if (stockDifference < -10) return "CRITICAL";
  if (stockDifference < -5) return "HIGH";
  if (stockDifference < 0) return "MEDIUM";
  return "LOW";
}

function formatEmailContent(productAlerts) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const urgencyColors = {
    CRITICAL: "#FF0000",
    HIGH: "#FF6B6B",
    MEDIUM: "#FFA500",
    LOW: "#4CAF50",
  };

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Stock Alert Report - ${date}</h2>
        <p>The following products require attention:</p>
        
        ${Object.entries(groupByUrgency(productAlerts))
          .map(
            ([urgency, products]) => `
            <div style="margin-bottom: 20px;">
              <h3 style="color: ${
                urgencyColors[urgency]
              };">${urgency} Priority</h3>
              <ul style="list-style-type: none; padding-left: 0;">
                ${products
                  .map(
                    (p) => `
                  <li style="padding: 8px; margin: 5px 0; background-color: #f8f9fa; border-left: 4px solid ${urgencyColors[urgency]};">
                    ${p.message}
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `
          )
          .join("")}
        
        <p>Please take necessary action to replenish the inventory.</p>
        <hr>
        <footer style="font-size: 12px; color: #666;">
          This is an automated message from your inventory management system.
        </footer>
      </body>
    </html>
  `;
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
    // Find all products where stock is at or below threshold
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stockQuantity", "$minimumStockThreshold"] },
    }).sort({ stockQuantity: 1 }); // Sort by lowest stock first

    if (lowStockProducts.length > 0) {
      const productAlerts = lowStockProducts.map((product) =>
        formatStockMessage(product)
      );

      const emailContent = formatEmailContent(productAlerts);

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
  try {
    // Ensure database connection
    await dbConnect();

    // Find all products where stock is at or below threshold
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stockQuantity", "$minimumStockThreshold"] },
    }).sort({ stockQuantity: 1 }); 

    if (lowStockProducts.length > 0) {
      const productAlerts = lowStockProducts.map((product) =>
        formatStockMessage(product)
      );

      const emailContent = formatEmailContent(productAlerts);

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
        productDetails: productAlerts,
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
