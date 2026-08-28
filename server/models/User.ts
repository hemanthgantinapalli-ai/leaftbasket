import mongoose, { Schema } from "mongoose";

export interface IUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  savedAddresses?: string[];
  ordersCount?: number;
  isBlocked?: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    savedAddresses: [{ type: String }],
    ordersCount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", UserSchema);