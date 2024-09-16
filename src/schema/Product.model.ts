import mongoose, { Schema } from "mongoose";
import {
  ProductStatus,
  ProductSize,
  ProductType,
} from "../libs/enums/product.enum";

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productType: {
      type: String,
      enum: ProductType,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productLeftCount: {
      type: Number,
      required: true,
    },

    productSize: {
      type: String,
      enum: ProductSize,
      required: true,
    },

    productDesc: {
      type: String,
    },

    productImages: {
      type: [String],
      default: [],
    },

    productViews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // updatedAt, createdAt
);

productSchema.index(
  { productName: 1, productSize: 1, ProductType: 1 },
  { unique: true }
);
export default mongoose.model("Product", productSchema);
