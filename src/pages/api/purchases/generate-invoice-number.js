import dbConnect from "@/lib/dbConnect";
import { Purchase } from "@/models/SalePurchase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    // Find the latest purchase and get its invoice number
    const latestPurchase = await Purchase.findOne().sort({ invoiceNumber: -1 });
    let nextInvoiceNumber;
    let hasSkippedNumbers = false;
    let lastUsedNumber;

    if (latestPurchase) {
      // Extract the number from the latest invoice number
      const match = latestPurchase.invoiceNumber.match(/^PUR-(\d+)$/);
      if (match) {
        lastUsedNumber = parseInt(match[1]);
        const expectedNextNumber = lastUsedNumber + 1;
        nextInvoiceNumber = `PUR-${expectedNextNumber
          .toString()
          .padStart(6, "0")}`;

        // Find all existing invoice numbers
        const existingPurchases = await Purchase.find({
          invoiceNumber: { $regex: /^PUR-\d+$/ },
        }).select("invoiceNumber");

        const existingNumbers = existingPurchases
          .map((p) => parseInt(p.invoiceNumber.match(/PUR-(\d+)/)[1]))
          .sort((a, b) => a - b);

        // Check for any gaps in the sequence
        for (let i = 0; i < existingNumbers.length - 1; i++) {
          if (existingNumbers[i + 1] - existingNumbers[i] > 1) {
            hasSkippedNumbers = true;
            nextInvoiceNumber = `PUR-${(existingNumbers[i] + 1)
              .toString()
              .padStart(6, "0")}`;
            break;
          }
        }
      } else {
        // If the format is incorrect, start a new sequence
        nextInvoiceNumber = "PUR-000001";
      }
    } else {
      // If no purchases exist, start with PUR-000001
      nextInvoiceNumber = "PUR-000001";
    }

    res.status(200).json({
      success: true,
      invoiceNumber: nextInvoiceNumber,
      hasSkippedNumbers,
      lastUsedNumber: lastUsedNumber
        ? `PUR-${lastUsedNumber.toString().padStart(6, "0")}`
        : null,
    });
  } catch (error) {
    console.error("Error generating invoice number:", error);
    res
      .status(500)
      .json({ success: false, message: "Error generating invoice number" });
  }
}
