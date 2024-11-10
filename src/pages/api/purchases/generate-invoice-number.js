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

    if (latestPurchase) {
      // Check if the latest invoice number follows the PUR-XXXXXX format
      const match = latestPurchase.invoiceNumber.match(/^PUR-(\d+)$/);
      if (match) {
        // If it matches, increment the number
        const latestNumber = parseInt(match[1]);
        nextInvoiceNumber = `PUR-${(latestNumber + 1)
          .toString()
          .padStart(6, "0")}`;
      } else {
        // If it doesn't match, start a new sequence
        nextInvoiceNumber = "PUR-000001";
      }
    } else {
      // If no purchases exist, start with PUR-000001
      nextInvoiceNumber = "PUR-000001";
    }

    res.status(200).json({ success: true, invoiceNumber: nextInvoiceNumber });
    ˇ;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    res
      .status(500)
      .json({ success: false, message: "Error generating invoice number" });
  }
}
