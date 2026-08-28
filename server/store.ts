import mongoose from "mongoose";
import { ProductModel, IProduct } from "./models/Product.js";
import { OrderModel, IOrder } from "./models/Order.js";
import { CategoryModel, ICategory } from "./models/Category.js";
import { RiderModel, IRider } from "./models/Rider.js";
import { UserModel } from "./models/User.js";
import { AdminModel } from "./models/Admin.js";
import { CouponModel, ICoupon } from "./models/Coupon.js";
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_RIDERS,
  INITIAL_SAMPLE_ORDERS,
} from "./seedData.js";

// In-Memory store fallback
let memCategories: any[] = [...INITIAL_CATEGORIES];
let memProducts: any[] = [...INITIAL_PRODUCTS];
let memCoupons: any[] = [...INITIAL_COUPONS];
let memRiders: any[] = [...INITIAL_RIDERS];
let memOrders: any[] = [...INITIAL_SAMPLE_ORDERS];

export function isMongoActive(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function updateUserProfile(userId: string, profile: any) {
  const updates = {
    name: String(profile.name || "").trim(),
    phone: String(profile.phone || "").trim(),
    email: profile.email ? String(profile.email).trim() : undefined,
    savedAddresses: Array.isArray(profile.savedAddresses) ? profile.savedAddresses : [],
  };
  if (!updates.name || !updates.phone) return null;

  if (isMongoActive()) {
    try {
      const updated = await UserModel.findOneAndUpdate(
        { id: userId },
        { $set: updates, $setOnInsert: { id: userId } },
        { new: true, upsert: true, lean: true }
      ).exec();
      if (profile.previousPhone) {
        await (OrderModel as any).updateMany(
          { customerPhone: profile.previousPhone },
          { $set: { customerName: updates.name, customerPhone: updates.phone, updatedAt: new Date() } }
        ).exec();
      }
      return updated;
    } catch (e) {
      console.warn("MongoDB updateUserProfile error:", e);
    }
  }

  if (profile.previousPhone) {
    memOrders = memOrders.map((order) =>
      order.customerPhone === profile.previousPhone
        ? { ...order, customerName: updates.name, customerPhone: updates.phone, updatedAt: new Date() }
        : order
    );
  }
  return { id: userId, ...updates };
}

export async function updateAdminProfile(adminId: string, profile: any) {
  const updates = {
    name: String(profile.name || "").trim(),
    email: String(profile.email || "").trim(),
    hub: String(profile.hub || "").trim(),
    role: String(profile.role || "Store Operations Director").trim(),
  };
  if (!updates.name || !updates.email || !updates.hub) return null;
  if (isMongoActive()) {
    try {
      return await AdminModel.findOneAndUpdate({ id: adminId }, { $set: updates, $setOnInsert: { id: adminId } }, { new: true, upsert: true, lean: true }).exec();
    } catch (e) {
      console.warn("MongoDB updateAdminProfile error:", e);
    }
  }
  return { id: adminId, ...updates };
}

export async function updateRiderProfile(riderId: string, profile: any) {
  const updates = {
    name: String(profile.name || "").trim(),
    phone: String(profile.phone || "").trim(),
    vehicleNumber: String(profile.vehicleNumber || "").trim(),
    hub: String(profile.hub || "").trim(),
  };
  if (!updates.name || !updates.phone || !updates.vehicleNumber || !updates.hub) return null;
  if (isMongoActive()) {
    try {
      const updated = await (RiderModel as any).findOneAndUpdate({ riderId }, { $set: updates }, { new: true }).lean().exec();
      if (updated) return updated;
    } catch (e) {
      console.warn("MongoDB updateRiderProfile error:", e);
    }
  }
  const idx = memRiders.findIndex((rider) => rider.riderId === riderId);
  if (idx !== -1) {
    memRiders[idx] = { ...memRiders[idx], ...updates };
    return memRiders[idx];
  }
  return { riderId, ...updates };
}

export async function registerRider(profile: any) {
  const rider = {
    riderId: `rider-${Date.now()}`,
    name: String(profile.name || "").trim(),
    phone: String(profile.phone || "").trim(),
    pin: String(profile.pin || "").trim(),
    vehicleType: "Electric Scooter",
    vehicleNumber: String(profile.vehicleNumber || "").trim(),
    hub: String(profile.hub || "Dark Store #04 - Indiranagar, Bengaluru").trim(),
    rating: 5,
    completedDeliveries: 0,
    currentStatus: "offline",
    isApproved: false,
    currentLocation: { lat: 12.9716, lng: 77.6412, heading: 0, speedKmH: 0, lastUpdated: new Date() },
    batteryPercentage: 100,
  };
  if (!rider.name || !rider.phone || !rider.vehicleNumber || rider.pin.length < 4) return null;
  if (isMongoActive()) {
    try {
      const created = await RiderModel.create(rider);
      return created.toObject();
    } catch (e) {
      console.warn("MongoDB registerRider error:", e);
    }
  }
  memRiders.push(rider);
  return rider;
}

export async function approveRider(riderId: string) {
  if (isMongoActive()) {
    try {
      const updated = await (RiderModel as any).findOneAndUpdate({ riderId }, { $set: { isApproved: true, currentStatus: "idle" } }, { new: true }).lean().exec();
      if (updated) return updated;
    } catch (e) {
      console.warn("MongoDB approveRider error:", e);
    }
  }
  const idx = memRiders.findIndex((rider) => rider.riderId === riderId);
  if (idx === -1) return null;
  memRiders[idx] = { ...memRiders[idx], isApproved: true, currentStatus: "idle" };
  return memRiders[idx];
}

export async function updateRiderAvailability(riderId: string, online: boolean) {
  const currentStatus = online ? "idle" : "offline";
  if (isMongoActive()) {
    try {
      const updated = await (RiderModel as any).findOneAndUpdate({ riderId, isApproved: true }, { $set: { currentStatus } }, { new: true }).lean().exec();
      if (updated) return updated;
    } catch (e) {
      console.warn("MongoDB updateRiderAvailability error:", e);
    }
  }
  const idx = memRiders.findIndex((rider) => rider.riderId === riderId && rider.isApproved !== false);
  if (idx === -1) return null;
  memRiders[idx].currentStatus = currentStatus;
  return memRiders[idx];
}

export async function seedMongoIfEmpty() {
  if (!isMongoActive()) return;

  try {
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      console.log("🌱 [MongoDB] Seeding initial database catalog...");
      await ProductModel.insertMany(memProducts as any);
      await CategoryModel.insertMany(memCategories as any);
      await CouponModel.insertMany(memCoupons as any);
      await RiderModel.insertMany(memRiders as any);
      if (memOrders.length > 0) {
        await OrderModel.insertMany(memOrders as any);
      }
      console.log("✅ [MongoDB] Seed complete: products, categories, coupons, riders & orders added.");
    }
  } catch (err) {
    console.error("⚠️ [MongoDB] Error during initial seed:", err);
  }
}

// Product operations
export async function getProducts(category?: string, search?: string, tag?: string) {
  if (isMongoActive()) {
    try {
      const query: any = {};
      if (category && category !== "all") {
        query.category = category;
      }
      if (tag) {
        query.tags = tag;
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [{ name: regex }, { teluguName: regex }, { hindiName: regex }, { description: regex }, { tags: regex }];
      }
      return await ProductModel.find(query).sort({ createdAt: -1 }).lean().exec();
    } catch (e) {
      console.warn("MongoDB getProducts failed, fallback to memory:", e);
    }
  }

  // Memory fallback
  let list = [...memProducts];
  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }
  if (tag) {
    list = list.filter((p) => p.tags && p.tags.includes(tag));
  }
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.teluguName && p.teluguName.includes(q)) ||
        (p.hindiName && p.hindiName.includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }
  return list;
}

export async function getProductById(id: string) {
  if (isMongoActive()) {
    try {
      const doc = await ProductModel.findOne({ id } as any).lean().exec();
      if (doc) return doc;
    } catch (e) {
      console.warn("MongoDB getProductById fallback:", e);
    }
  }
  return memProducts.find((p) => p.id === id) || null;
}

export async function createProduct(productData: any) {
  const newProduct = {
    ...productData,
    id: productData.id || `prod-${Date.now()}`,
    createdAt: new Date(),
    rating: productData.rating || 5.0,
    reviewsCount: productData.reviewsCount || 1,
  };

  if (isMongoActive()) {
    try {
      const doc = await ProductModel.create(newProduct);
      return doc.toObject();
    } catch (e) {
      console.warn("MongoDB createProduct error:", e);
    }
  }

  memProducts.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, updates: any) {
  if (isMongoActive()) {
    try {
      const updated = await (ProductModel as any).findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean().exec();
      if (updated) return updated;
    } catch (e) {
      console.warn("MongoDB updateProduct error:", e);
    }
  }

  const idx = memProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    memProducts[idx] = { ...memProducts[idx], ...updates, updatedAt: new Date() };
    return memProducts[idx];
  }
  return null;
}

export async function deleteProduct(id: string) {
  if (isMongoActive()) {
    try {
      await (ProductModel as any).deleteOne({ id });
    } catch (e) {
      console.warn("MongoDB deleteProduct error:", e);
    }
  }
  memProducts = memProducts.filter((p) => p.id !== id);
  return true;
}

// Product Review Operations
export async function addProductReview(
  productId: string,
  reviewData: {
    userName: string;
    rating: number;
    title?: string;
    comment: string;
    verifiedPurchase?: boolean;
    tags?: string[];
  }
) {
  const newReview = {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    productId,
    userName: reviewData.userName || "Verified Buyer",
    rating: Math.max(1, Math.min(5, Number(reviewData.rating) || 5)),
    title: reviewData.title || "",
    comment: reviewData.comment || "",
    verifiedPurchase: reviewData.verifiedPurchase !== false,
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
    tags: Array.isArray(reviewData.tags) ? reviewData.tags : [],
  };

  if (isMongoActive()) {
    try {
      const prod = await ProductModel.findOne({ id: productId } as any).exec();
      if (prod) {
        const currentReviews = prod.reviews || [];
        const currentCount = prod.reviewsCount || currentReviews.length || 0;
        const currentRating = prod.rating || 5.0;
        
        // Calculate new rating
        const newRating = Number(((currentRating * currentCount + newReview.rating) / (currentCount + 1)).toFixed(1));
        const newCount = currentCount + 1;

        const reviews = (prod.reviews || []) as any[];
        reviews.unshift(newReview as any);
        (prod as any).reviews = reviews;
        prod.rating = newRating;
        prod.reviewsCount = newCount;
        await prod.save();
        return { product: prod.toObject(), review: newReview };
      }
    } catch (e) {
      console.warn("MongoDB addProductReview error:", e);
    }
  }

  // Fallback to memory
  const idx = memProducts.findIndex((p) => p.id === productId);
  if (idx !== -1) {
    const prod = memProducts[idx];
    const currentReviews = prod.reviews || [];
    const currentCount = prod.reviewsCount || currentReviews.length || 0;
    const currentRating = prod.rating || 5.0;
    
    const newRating = Number(((currentRating * currentCount + newReview.rating) / (currentCount + 1)).toFixed(1));
    const newCount = currentCount + 1;

    prod.reviews = [newReview, ...currentReviews];
    prod.rating = newRating;
    prod.reviewsCount = newCount;
    return { product: prod, review: newReview };
  }

  return null;
}

export async function voteReviewHelpful(productId: string, reviewId: string) {
  if (isMongoActive()) {
    try {
      const prod = await ProductModel.findOne({ id: productId } as any).exec();
      if (prod && prod.reviews) {
        const rev = prod.reviews.find((r) => r.id === reviewId);
        if (rev) {
          rev.helpfulCount = (rev.helpfulCount || 0) + 1;
          await prod.save();
          return { success: true, helpfulCount: rev.helpfulCount };
        }
      }
    } catch (e) {
      console.warn("MongoDB voteReviewHelpful error:", e);
    }
  }

  const prod = memProducts.find((p) => p.id === productId);
  if (prod && prod.reviews) {
    const rev = prod.reviews.find((r: any) => r.id === reviewId);
    if (rev) {
      rev.helpfulCount = (rev.helpfulCount || 0) + 1;
      return { success: true, helpfulCount: rev.helpfulCount };
    }
  }
  return { success: false };
}

// Categories
export async function getCategories() {
  if (isMongoActive()) {
    try {
      const list = await CategoryModel.find().lean().exec();
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("MongoDB getCategories error:", e);
    }
  }
  return memCategories;
}

// Orders
export async function getOrders(phone?: string) {
  if (isMongoActive()) {
    try {
      const query: any = phone ? { customerPhone: phone } : {};
      return await OrderModel.find(query).sort({ createdAt: -1 }).lean().exec();
    } catch (e) {
      console.warn("MongoDB getOrders error:", e);
    }
  }

  if (phone) {
    return memOrders.filter((o) => o.customerPhone === phone);
  }
  return memOrders;
}

export async function getOrderById(orderId: string) {
  if (isMongoActive()) {
    try {
      const doc = await OrderModel.findOne({ orderId } as any).lean().exec();
      if (doc) return doc;
    } catch (e) {
      console.warn("MongoDB getOrderById error:", e);
    }
  }
  return memOrders.find((o) => o.orderId === orderId) || null;
}

export async function createOrder(orderPayload: any) {
  const generatedId = `LB-${Math.floor(10000 + Math.random() * 90000)}`;
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  
  const newOrder = {
    ...orderPayload,
    orderId: generatedId,
    otp,
    orderStatus: "placed",
    statusTimeline: [
      {
        status: "placed",
        timestamp: new Date(),
        note: "Order confirmed at Leafbasket Indiranagar Dark Store #04",
      },
    ],
    etaMinutes: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (isMongoActive()) {
    try {
      const doc = await OrderModel.create(newOrder);
      return doc.toObject();
    } catch (e) {
      console.warn("MongoDB createOrder error:", e);
    }
  }

  memOrders.unshift(newOrder);
  return newOrder;
}

export async function assignOrderRider(orderId: string, riderId: string) {
  let rider: any = memRiders.find((item) => item.riderId === riderId);
  if (isMongoActive()) {
    try {
      rider = await RiderModel.findOne({ riderId }).lean().exec();
    } catch (e) {
      console.warn("MongoDB find rider for assignment error:", e);
    }
  }
  if (!rider || rider.isApproved === false || rider.currentStatus === "offline") return null;

  const riderDetails = {
    riderId: rider.riderId,
    name: rider.name,
    phone: rider.phone,
    vehicleNumber: rider.vehicleNumber,
    rating: rider.rating,
    photo: rider.photo,
    lat: rider.currentLocation?.lat || 12.9724,
    lng: rider.currentLocation?.lng || 77.6385,
  };
  const timelineItem = {
    status: "assigned",
    timestamp: new Date(),
    note: `Order assigned to ${rider.name}. Waiting for rider acceptance.`,
  };

  if (isMongoActive()) {
    try {
      const updated = await (OrderModel as any).findOneAndUpdate(
        { orderId },
        { $set: { orderStatus: "assigned", riderDetails, updatedAt: new Date() }, $push: { statusTimeline: timelineItem } },
        { new: true }
      ).lean().exec();
      if (updated) return updated;
    } catch (e) {
      console.warn("MongoDB assignOrderRider error:", e);
    }
  }

  const idx = memOrders.findIndex((order) => order.orderId === orderId);
  if (idx === -1) return null;
  memOrders[idx].orderStatus = "assigned";
  memOrders[idx].riderDetails = riderDetails;
  memOrders[idx].updatedAt = new Date();
  memOrders[idx].statusTimeline = [...(memOrders[idx].statusTimeline || []), timelineItem];
  return memOrders[idx];
}

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  const timelineItem = {
    status,
    timestamp: new Date(),
    note: note || `Status updated to ${status}`,
  };

  if (isMongoActive()) {
    try {
      const updated = await (OrderModel as any).findOneAndUpdate(
        { orderId },
        {
          $set: { orderStatus: status, updatedAt: new Date() },
          $push: { statusTimeline: timelineItem },
        },
        { new: true }
      ).lean().exec();
      if (updated) return updated;
    } catch (e) {
      console.warn("MongoDB updateOrderStatus error:", e);
    }
  }

  const idx = memOrders.findIndex((o) => o.orderId === orderId);
  if (idx !== -1) {
    memOrders[idx].orderStatus = status;
    memOrders[idx].updatedAt = new Date();
    memOrders[idx].statusTimeline = [...(memOrders[idx].statusTimeline || []), timelineItem];
    return memOrders[idx];
  }
  return null;
}

export async function updateOrderRiderLocation(orderId: string, lat: number, lng: number, etaMinutes?: number) {
  const updates: any = { "riderDetails.lat": lat, "riderDetails.lng": lng, updatedAt: new Date() };
  if (typeof etaMinutes === "number") {
    updates.etaMinutes = etaMinutes;
  }

  if (isMongoActive()) {
    try {
      const updated = await (OrderModel as any).findOneAndUpdate({ orderId }, { $set: updates }, { new: true }).lean().exec();
      if (updated) return updated;
    } catch (e) {
      console.warn("MongoDB updateOrderRiderLocation error:", e);
    }
  }

  const idx = memOrders.findIndex((o) => o.orderId === orderId);
  if (idx !== -1) {
    if (!memOrders[idx].riderDetails) memOrders[idx].riderDetails = {};
    memOrders[idx].riderDetails.lat = lat;
    memOrders[idx].riderDetails.lng = lng;
    if (typeof etaMinutes === "number") {
      memOrders[idx].etaMinutes = etaMinutes;
    }
    memOrders[idx].updatedAt = new Date();
    return memOrders[idx];
  }
  return null;
}

// Coupons
export async function getCoupons() {
  if (isMongoActive()) {
    try {
      return await CouponModel.find({ isActive: true } as any).lean().exec();
    } catch (e) {
      console.warn("MongoDB getCoupons error:", e);
    }
  }
  return memCoupons;
}

// Riders
export async function getRiders() {
  if (isMongoActive()) {
    try {
      return await RiderModel.find().lean().exec();
    } catch (e) {
      console.warn("MongoDB getRiders error:", e);
    }
  }
  return memRiders;
}
