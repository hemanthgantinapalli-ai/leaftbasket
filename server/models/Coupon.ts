import mongoose, { Schema } from "mongoose";

export interface ICoupon {
  code: string;
  description: string;
  discountPercentage: number;
  maxDiscount: number;
  minOrderAmount: number;
  validUntil: Date;
  usageCount: number;
  isActive: boolean;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountPercentage: { type: Number, required: true },
    maxDiscount: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    validUntil: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CouponModel = (mongoose.models.Coupon as mongoose.Model<ICoupon>) || mongoose.model<ICoupon>("Coupon", CouponSchema);
