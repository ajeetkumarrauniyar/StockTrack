import dbConnect from "@/lib/dbConnect";
import { Sale } from "@/models/SalePurchase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const lastSale = await Sale.findOne().sort({ invoiceNumber: -1 });
    let newInvoiceNumber = "INV-0001";

    if (lastSale && lastSale.invoiceNumber) {
      // Extract the numeric part using regex to ensure we only get numbers
      const matches = lastSale.invoiceNumber.match(/INV-(\d+)/);

      if (matches && matches[1]) {
        // Convert the matched number to integer and increment
        const lastNumber = parseInt(matches[1], 10);
        if (!isNaN(lastNumber)) {
          newInvoiceNumber = `INV-${(lastNumber + 1)
            .toString()
            .padStart(4, "0")}`;
        }
      }
    }

    res.status(200).json({ success: true, invoiceNumber: newInvoiceNumber });
  } catch (error) {
    res.status(500).json({ message: "Error generating invoice number" });
  }
}
