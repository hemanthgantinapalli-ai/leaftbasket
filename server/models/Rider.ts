import mongoose, { Schema } from "mongoose";

export interface IRider {
  riderId: string;
  name: string;
  phone: string;
  pin?: string;
  vehicleType: string;
  vehicleNumber: string;
  hub?: string;
  isApproved?: boolean;
  isBlocked?: boolean;
  rating: number;
  completedDeliveries: number;
  currentStatus: string;
  currentLocation: {
    lat: number;
    lng: number;
    heading: number;
    speedKmH: number;
    lastUpdated: Date;
  };
  activeOrderId?: string;
  batteryPercentage: number;
}

const RiderSchema = new Schema<IRider>(
  {
    riderId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    pin: { type: String },
    vehicleType: { type: String, default: "Electric Scooter" },
    vehicleNumber: { type: String, default: "KA 01 EK 4920" },
    hub: { type: String, default: "Dark Store #04 - Indiranagar, Bengaluru" },
    isApproved: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    rating: { type: Number, default: 4.9 },
    completedDeliveries: { type: Number, default: 840 },
    currentStatus: { type: String, default: "idle" },
    currentLocation: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
      heading: { type: Number, default: 45 },
      speedKmH: { type: Number, default: 28 },
      lastUpdated: { type: Date, default: Date.now },
    },
    activeOrderId: { type: String },
    batteryPercentage: { type: Number, default: 92 },
  },
  { timestamps: true }
);

export const RiderModel = (mongoose.models.Rider as mongoose.Model<IRider>) || mongoose.model<IRider>("Rider", RiderSchema);
