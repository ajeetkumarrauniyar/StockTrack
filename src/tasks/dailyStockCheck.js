import cron from "node-cron";
import { checkLowStockAndSendAlerts } from "../utils/stockCheckUtil.js";

// Schedule the task to run every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  console.log("Running daily stock check at", new Date().toLocaleString());
  try {
    const result = await checkLowStockAndSendAlerts();

    console.log("Daily stock check completed:", {
      alertsSent: result.alertsSent,
      productsCount: result.productsCount,
      urgencyBreakdown: result.urgencyBreakdown,
    });
  } catch (error) {
    console.error("Critical error in daily stock check:", error);

    // Optional: Send an error notification email
    try {
      await sendEmail({
        subject: "Daily Stock Check Failed",
        content: {
          text: `Daily stock check failed with error: ${error.message}`,
          html: `
            <html>
              <body>
                <h2>Inventory Management System Alert</h2>
                <p>The daily stock check scheduled task encountered an error:</p>
                <pre>${error.message}</pre>
                <p>Please investigate the issue immediately.</p>
              </body>
            </html>
          `,
        },
      });
    } catch (emailError) {
      console.error("Failed to send error notification email:", emailError);
    }
  }
});

console.log("Daily stock check scheduled to run at 8 AM every day.");
