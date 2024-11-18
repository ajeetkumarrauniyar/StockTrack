import cron from "node-cron";
import fetch from "node-fetch";
import { BASE_URL } from "../config";

// Schedule the task to run every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  console.log("Running daily stock check at", new Date().toLocaleString());
  try {
    const response = await fetch(`${BASE_URL}/api/check-low-stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API request failed: ${errorData.error || response.statusText}`
      );
    }

    const result = await response.json();
    console.log("Daily stock check completed:", result);
  } catch (error) {
    console.error("Error in daily stock check:", error);
  }
});

console.log("Daily stock check scheduled to run at 8 AM every day.");
