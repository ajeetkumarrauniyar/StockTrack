import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    packaging:{
      type: String,
      required: true,
    },
    unit: {
      type: String,
      default: 'Pcs'
    },
    rate: {
      type: Number,
      required: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    openingStock: {
      type: Number,
      required: true,
      default: 0,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
