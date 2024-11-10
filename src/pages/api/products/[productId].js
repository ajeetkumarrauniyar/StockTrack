import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export default async function handler(req, res) {
  const {
    query: { productId },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case "PATCH":
      try {
        const product = await Product.findByIdAndUpdate(productId, req.body, {
          new: true,
          runValidators: true,
        });
        if (!product) {
          return res
            .status(404)
            .json({ success: false, error: "Product not found" });
        }
        res.status(200).json({ success: true, data: product });
      } catch (error) {
        res
          .status(400)
          .json({ success: false, error: "Failed to update product" });
      }
      break;
    default:
      res.status(405).json({ success: false, error: "Method not allowed" });
      break;
  }
}
