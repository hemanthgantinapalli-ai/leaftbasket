import mongoose, { Schema } from "mongoose";

export interface IProductReview {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  helpfulCount?: number;
  tags?: string[];
}

export interface IProduct {
  id: string;
  name: string;
  teluguName?: string;
  hindiName?: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  unit: string;
  inStock: boolean;
  stockCount: number;
  image: string;
  gallery?: string[];
  badge?: string;
  rating: number;
  reviewsCount: number;
  reviews?: IProductReview[];
  description: string;
  nutritionalInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  origin?: string;
  isOrganic?: boolean;
  shelfLife?: string;
  deliveryTimeMinutes: number;
  tags: string[];
}

const ProductReviewSchema = new Schema<IProductReview>(
  {
    id: { type: String, required: true },
    productId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    helpfulCount: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    teluguName: { type: String },
    hindiName: { type: String },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    unit: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 50 },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    badge: { type: String },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    reviews: [ProductReviewSchema],
    description: { type: String, required: true },
    nutritionalInfo: {
      calories: { type: String },
      protein: { type: String },
      carbs: { type: String },
      fat: { type: String },
    },
    origin: { type: String, default: "Local Organic Farms" },
    isOrganic: { type: Boolean, default: false },
    shelfLife: { type: String, default: "3-5 Days" },
    deliveryTimeMinutes: { type: Number, default: 10 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const ProductModel = (mongoose.models.Product as mongoose.Model<IProduct>) || mongoose.model<IProduct>("Product", ProductSchema);
