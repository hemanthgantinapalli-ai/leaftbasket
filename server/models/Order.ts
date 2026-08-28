import mongoose, { Schema } from "mongoose";

export interface IOrderItem {
  productId: string;
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface IOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    flat?: string;
    landmark?: string;
    area: string;
    city: string;
    state?: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
  items: IOrderItem[];
  itemTotal: number;
  deliveryFee: number;
  packagingFee: number;
  tipAmount: number;
  couponDiscount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: "cod" | "upi" | "card" | "wallet";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "placed" | "assigned" | "accepted" | "packed" | "out_for_delivery" | "delivered" | "cancelled";
  statusTimeline: {
    status: string;
    timestamp: Date;
    note?: string;
  }[];
  riderDetails?: {
    riderId: string;
    name: string;
    phone: string;
    vehicleNumber: string;
    rating: number;
    photo: string;
    lat: number;
    lng: number;
  };
  etaMinutes: number;
  otp: string;
  notes?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: {
      street: { type: String, required: true },
      flat: { type: String },
      landmark: { type: String },
      area: { type: String, default: "Indiranagar" },
      city: { type: String, default: "Bengaluru" },
      state: { type: String, default: "Karnataka" },
      pincode: { type: String, default: "560038" },
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
    },
    items: [
      {
        productId: { type: String, required: true },
        itemId: { type: String },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        image: { type: String, required: true },
      },
    ],
    itemTotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    packagingFee: { type: Number, default: 5 },
    tipAmount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "upi" },
    paymentStatus: { type: String, default: "paid" },
    orderStatus: {
      type: String,
      enum: ["placed", "assigned", "accepted", "packed", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },
    statusTimeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    riderDetails: {
      riderId: { type: String },
      name: { type: String },
      phone: { type: String },
      vehicleNumber: { type: String },
      rating: { type: Number },
      photo: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    etaMinutes: { type: Number, default: 10 },
    otp: { type: String, default: "8492" },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = (mongoose.models.Order as mongoose.Model<IOrder>) || mongoose.model<IOrder>("Order", OrderSchema);
