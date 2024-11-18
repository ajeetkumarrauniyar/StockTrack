import { checkLowStockAndSendAlerts } from "@/utils/stockCheckUtil.js";
import {
  createRateLimiter,
  applyMiddleware,
  handleRateLimitError,
} from "@/utils/rateLimiter";

// Create a rate limiter for this specific endpoint
const limiter = createRateLimiter();

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST"],
    });
  }

  try {
    // Apply rate limiting
    await applyMiddleware(limiter)(req, res);

    const result = await checkLowStockAndSendAlerts();

    return res.status(200).json({
      success: true,
      message: result.alertsSent
        ? `Stock check completed: ${result.productsCount} products need attention`
        : "Stock check completed: All stock levels are adequate",
      ...result,
    });
  } catch (error) {
    try {
      // Handle rate limit errors
      return handleRateLimitError(error, res);
    } catch (nonRateLimitError) {
      console.error("Stock check API error:", nonRateLimitError);
      return res.status(500).json({
        success: false,
        error: "Failed to complete stock check",
        details: nonRateLimitError.message,
      });
    }
  }
}

export default handler;
