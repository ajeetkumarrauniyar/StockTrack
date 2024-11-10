import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        res.status(200).json({
          success: true,
          data: products,
          currentPage: page,
          totalPages: totalPages,
        });
      } catch (error) {
        res
          .status(400)
          .json({ success: false, error: "Failed to fetch products" });
      }
      break;
    case "POST":
      try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
      } catch (error) {
        res
          .status(400)
          .json({ success: false, error: "Failed to create product" });
      }
      break;
    default:
      res.status(405).json({ success: false, error: "Method not allowed" });
      break;
  }
}
