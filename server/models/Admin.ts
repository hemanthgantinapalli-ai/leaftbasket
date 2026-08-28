import mongoose, { Schema } from "mongoose";

export interface IAdmin {
  id: string;
  name: string;
  email: string;
  hub: string;
  role: string;
}

const AdminSchema = new Schema<IAdmin>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    hub: { type: String, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

export const AdminModel = (mongoose.models.Admin as mongoose.Model<IAdmin>) || mongoose.model<IAdmin>("Admin", AdminSchema);