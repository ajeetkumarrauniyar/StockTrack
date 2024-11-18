import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  rate: {
    type: Number,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
  minimumStockThreshold: {
    type: Number,
    default: 12, // Default threshold
  },
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
