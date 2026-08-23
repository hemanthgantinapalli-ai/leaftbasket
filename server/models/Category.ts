import mongoose, { Schema } from "mongoose";

export interface ICategory {
  id: string;
  name: string;
  teluguName?: string;
  hindiName?: string;
  icon: string;
  image: string;
  accentColor: string;
  subcategories: string[];
  itemCount: number;
  isPopular?: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    teluguName: { type: String },
    hindiName: { type: String },
    icon: { type: String, required: true },
    image: { type: String, required: true },
    accentColor: { type: String, default: "#10b981" },
    subcategories: [{ type: String }],
    itemCount: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CategoryModel = (mongoose.models.Category as mongoose.Model<ICategory>) || mongoose.model<ICategory>("Category", CategorySchema);
