export interface ProductReview {
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

export interface Product {
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
  ratingCount?: number;
  reviewsCount: number;
  reviews?: ProductReview[];
  description: string;
  nutritionalInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
  nutrition?: {
    calories?: number | string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
  origin?: string;
  isOrganic?: boolean;
  harvestDate?: string;
  farmLocation?: string;
  shelfLife?: string;
  shelfLifeDays?: number;
  organicCertified?: boolean;
  deliveryTimeMinutes: number;
  tags: string[];
}

export interface Category {
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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryAddress {
  street: string;
  flat?: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface OrderTimelineItem {
  status: string;
  timestamp: string | Date;
  note?: string;
}

export interface RiderDetails {
  riderId: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  rating: number;
  photo?: string;
  lat: number;
  lng: number;
}

export interface Order {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
  }[];
  itemTotal: number;
  deliveryFee: number;
  packagingFee: number;
  tipAmount: number;
  couponDiscount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: "cod" | "upi" | "card" | "wallet";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "placed" | "packed" | "out_for_delivery" | "delivered" | "cancelled";
  statusTimeline: OrderTimelineItem[];
  riderDetails?: RiderDetails;
  riderLocation?: {
    lat: number;
    lng: number;
    name?: string;
  };
  etaMinutes: number;
  otp: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountPercentage: number;
  maxDiscount: number;
  minOrderAmount: number;
  validUntil: string;
  usageCount: number;
  isActive: boolean;
}

export interface Rider {
  riderId: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  rating: number;
  completedDeliveries: number;
  currentStatus: "idle" | "assigned" | "en_route" | "offline";
  currentLocation: {
    lat: number;
    lng: number;
    heading: number;
    speedKmH: number;
    lastUpdated: string;
  };
  activeOrderId?: string;
  batteryPercentage: number;
}

export interface DatabaseStatus {
  isConnected: boolean;
  readyState: number;
  readyStateLabel: string;
  hasUriConfigured: boolean;
  maskedUri: string | null;
  error: string | null;
  isIpWhitelistIssue?: boolean;
  mode?: string;
}

export interface AppNotification {
  id: string;
  orderId?: string;
  type: "order_status" | "delivery" | "promo" | "system";
  title: string;
  message: string;
  status?: "placed" | "packed" | "out_for_delivery" | "delivered" | "cancelled";
  etaMinutes?: number;
  timestamp: string;
  read: boolean;
  riderName?: string;
}

export type ViewTab = "shop" | "category" | "product-detail" | "cart" | "tracking" | "orders-history" | "rider-portal" | "admin-hub" | "mongo-config";
