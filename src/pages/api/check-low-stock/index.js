import { checkLowStockAndSendAlerts } from "@/utils/stockCheckUtil.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST"],
    });
  }

  try {
    const result = await checkLowStockAndSendAlerts();

    return res.status(200).json({
      success: true,
      message: result.alertsSent
        ? `Stock check completed: ${result.productsCount} products need attention`
        : "Stock check completed: All stock levels are adequate",
      ...result,
    });
  } catch (error) {
    console.error("Stock check API error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to complete stock check",
      details: error.message,
    });
  }
}
