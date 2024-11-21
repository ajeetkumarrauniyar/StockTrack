import { parse } from "csv-parse";
import Product from "@/models/Product";
import dbConnect from "@/lib/dbConnect";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parse error:", err);
          res.status(500).json({ message: "Error processing form data" });
          return resolve();
        }

        // Debug logging
        console.log("Files received:", files);

        // Handle array of files or single file
        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file) {
          console.error("No file uploaded");
          res.status(400).json({ message: "No file uploaded" });
          return resolve();
        }

        // Prefer filepath, but fallback to other path properties
        const filePath = file.filepath || file.path;

        if (!filePath) {
          console.error("No valid file path found");
          res.status(400).json({ message: "Invalid file upload" });
          return resolve();
        }

        try {
          const fileContent = await fs.readFile(filePath, "utf-8");

          return new Promise((parseResolve, parseReject) => {
            const parser = parse({
              columns: true,
              skip_empty_lines: true,
            });

            const records = [];
            parser.on("readable", () => {
              let record;
              while ((record = parser.read()) !== null) {
                records.push(record);
              }
            });

            parser.on("error", (parseErr) => {
              console.error("CSV parsing error:", parseErr);
              res.status(400).json({ message: "Error parsing CSV file" });
              parseResolve();
            });

            parser.on("end", async () => {
              try {
                // Validate records before insertion
                const products = records.map((record) => {
                  // Add validation checks
                  if (!record.name || !record.rate) {
                    throw new Error(
                      `Invalid product data: ${JSON.stringify(record)}`
                    );
                  }

                  return {
                    name: record.name,
                    description: record.description || "",
                    packaging: record.packaging || "",
                    mrp: parseFloat(record.mrp),
                    rate: parseFloat(record.rate),
                    stockQuantity: parseInt(record.stockQuantity) || 0,
                    minimumStockThreshold:
                      parseInt(record.minimumStockThreshold) || 0,
                  };
                });

                const result = await Product.insertMany(products);

                // Remove the uploaded file after processing
                await fs.unlink(filePath);

                res.status(200).json({
                  message: "Products uploaded successfully",
                  productsAdded: result.length,
                  products: result,
                });
                parseResolve();
              } catch (error) {
                console.error("Product insertion error:", error);
                res.status(500).json({
                  message: "Error inserting products",
                  error: error.message,
                });
                parseResolve();
              }
            });

            parser.write(fileContent);
            parser.end();
          });
        } catch (readError) {
          console.error("File read error:", readError);
          res.status(500).json({
            message: "Error reading uploaded file",
            error: readError.message,
          });
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Server-side error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
