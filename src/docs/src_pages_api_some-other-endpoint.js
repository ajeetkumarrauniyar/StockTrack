// To use this rate limiter in other API endpoints, you can simply import the utility functions and apply them as needed. For example:
import { createRateLimiter, applyMiddleware, handleRateLimitError } from "@/utils/rateLimiter";

const limiter = createRateLimiter({ max: 10, windowMs: 30 * 60 * 1000 }); // Custom options

async function handler(req, res) {
  try {
    await applyMiddleware(limiter)(req, res);
    // Your API logic here
  } catch (error) {
    try {
      return handleRateLimitError(error, res);
    } catch (nonRateLimitError) {
      // Handle other errors
    }
  }
}

export default handler;