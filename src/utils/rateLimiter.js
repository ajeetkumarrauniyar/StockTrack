import rateLimit from "express-rate-limit";

// Create a rate limiter
export const createRateLimiter = (options = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    ...options, // Allow overriding default options
  });

// Middleware to apply rate limiting to Next.js API routes
export const applyMiddleware = (middleware) => (request, response) =>
  new Promise((resolve, reject) => {
    middleware(request, response, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
    );
  });

// Helper function to handle rate limit errors
export const handleRateLimitError = (error, res) => {
  if (
    error.message === "Too many requests from this IP, please try again later."
  ) {
    return res.status(429).json({
      success: false,
      error: error.message,
    });
  }
  throw error;
};
