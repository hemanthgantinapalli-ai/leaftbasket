import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  PackageCheck,
  RotateCcw,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Receipt,
  Bike,
  Plus,
  LogOut,
  Edit3,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Order, Product, CartItem } from "../types";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  savedAddresses?: string[];
  ordersCount?: number;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onSaveProfile: (user: UserProfile) => Promise<void>;
  orders: Order[];
  products: Product[];
  onReorderAll: (items: { productId: string; name: string; price: number; quantity: number; unit: string; image: string }[]) => void;
  onReorderSingleItem: (item: { productId: string; name: string; price: number; quantity: number; unit: string; image: string }) => void;
  onTrackOrder: (orderId: string) => void;
  onOpenCart: () => void;
  onOpenReviewProduct?: (productTarget: { id: string; name: string; image: string; unit?: string; price?: number }) => void;
  initialTab?: "orders" | "profile" | "addresses";
}

// Sample realistic past orders to show if current session has no past orders yet
const SAMPLE_PAST_ORDERS: Partial<Order>[] = [
  {
    orderId: "LB-94821",
    customerName: "Priya Sharma",
    customerPhone: "+91 98765 43210",
    orderStatus: "delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday
    totalAmount: 318,
    itemTotal: 298,
    deliveryFee: 0,
    packagingFee: 5,
    tipAmount: 15,
    couponDiscount: 0,
    paymentMethod: "upi",
    paymentStatus: "paid",
    deliveryAddress: {
      street: "Flat 402, Oakwood Heights, 12th Main Rd",
      flat: "402",
      area: "Indiranagar",
      city: "Bengaluru",
      pincode: "560038",
      lat: 12.9716,
      lng: 77.6412,
    },
    items: [
      {
        productId: "prod-1",
        name: "Fresh Desi Farm Tomatoes (Tamatar)",
        price: 34,
        quantity: 2,
        unit: "1 kg",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "prod-2",
        name: "Crisp English Cucumber (Kheera)",
        price: 28,
        quantity: 1,
        unit: "500 g",
        image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "prod-8",
        name: "Farm Fresh A2 Desi Cow Milk",
        price: 48,
        quantity: 2,
        unit: "1 Litre Pouch",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "prod-11",
        name: "Artisanal Sourdough Country Loaf",
        price: 120,
        quantity: 1,
        unit: "400 g",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    orderId: "LB-88319",
    customerName: "Priya Sharma",
    customerPhone: "+91 98765 43210",
    orderStatus: "delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    totalAmount: 462,
    itemTotal: 487,
    deliveryFee: 0,
    packagingFee: 5,
    tipAmount: 0,
    couponDiscount: 30,
    couponCode: "SUPERFAST",
    paymentMethod: "card",
    paymentStatus: "paid",
    deliveryAddress: {
      street: "Flat 402, Oakwood Heights, 12th Main Rd",
      flat: "402",
      area: "Indiranagar",
      city: "Bengaluru",
      pincode: "560038",
      lat: 12.9716,
      lng: 77.6412,
    },
    items: [
      {
        productId: "prod-5",
        name: "Fresh Tender Coconut (Nariyal)",
        price: 55,
        quantity: 2,
        unit: "1 pc (~350ml water)",
        image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "prod-6",
        name: "Shimla Golden Delicious Apples",
        price: 165,
        quantity: 1,
        unit: "1 kg (4-5 pcs)",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "prod-3",
        name: "Baby Spinach Leaves (Palak)",
        price: 22,
        quantity: 2,
        unit: "250 g bunch",
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "prod-7",
        name: "Fresh Organic Hass Avocado",
        price: 90,
        quantity: 1,
        unit: "1 pc (180-220g)",
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&auto=format&fit=crop&q=80",
      },
    ],
  },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onLoginSuccess,
  onSaveProfile,
  orders,
  products,
  onReorderAll,
  onReorderSingleItem,
  onTrackOrder,
  onOpenCart,
  onOpenReviewProduct,
  initialTab = "orders",
}) => {
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses">(initialTab);
  const [reorderedOrderId, setReorderedOrderId] = useState<string | null>(null);
  const [reorderedItemId, setReorderedItemId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | Partial<Order> | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", email: "" });
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingAddresses, setIsEditingAddresses] = useState(false);
  const [addressForm, setAddressForm] = useState("");

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email || "",
      });
      setAddressForm((currentUser.savedAddresses || []).join("\n"));
    }
  }, [currentUser]);

  // Quick Sign In state if user is not logged in
  const [loginPhone, setLoginPhone] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginOtp, setLoginOtp] = useState("7492");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Combine real user orders and sample seed orders
  const displayOrders: (Order | Partial<Order>)[] =
    orders.length > 0
      ? orders
      : (SAMPLE_PAST_ORDERS as (Order | Partial<Order>)[]);

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || loginPhone.length < 10) {
      setAuthError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!isOtpSent) {
      setIsOtpSent(true);
      setAuthError(null);
      return;
    }
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: loginName.trim() || "Priya Sharma",
      phone: `+91 ${loginPhone.replace(/^\+91/, "").trim()}`,
      email: "priya.sharma@example.com",
      savedAddresses: [
        "Flat 402, Oakwood Heights, 12th Main Rd, Indiranagar, Bengaluru - 560038",
        "Prestige Tech Park, Marathahalli Outer Ring Rd, Bengaluru",
      ],
      ordersCount: displayOrders.length,
    };
    onLoginSuccess(user);
    setIsOtpSent(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !profileForm.name.trim() || !profileForm.phone.trim()) {
      setProfileSaveError("Name and phone are required.");
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      await onSaveProfile({
        ...currentUser,
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        email: profileForm.email.trim() || undefined,
      });
      setIsEditingProfile(false);
    } catch (error: any) {
      setProfileSaveError(error.message || "Could not save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAddresses = async () => {
    if (!currentUser) return;
    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      const savedAddresses = addressForm.split("\n").map((address) => address.trim()).filter(Boolean);
      await onSaveProfile({ ...currentUser, savedAddresses });
      setIsEditingAddresses(false);
    } catch (error: any) {
      setProfileSaveError(error.message || "Could not save addresses.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleTriggerReorderAll = (order: Order | Partial<Order>) => {
    if (!order.items || order.items.length === 0) return;
    onReorderAll(order.items as any);
    setReorderedOrderId(order.orderId || "reordered");

    setTimeout(() => {
      setReorderedOrderId(null);
    }, 4000);
  };

  const handleTriggerReorderSingle = (item: any) => {
    onReorderSingleItem(item);
    setReorderedItemId(item.productId);

    setTimeout(() => {
      setReorderedItemId(null);
    }, 2500);
  };

  const formatOrderDate = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case "out_for_delivery":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-md animate-pulse">
            <Bike className="w-3 h-3 text-amber-700" />
            <span>Out for Delivery</span>
          </span>
        );
      case "packed":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
            <PackageCheck className="w-3 h-3 text-blue-600" />
            <span>Packed</span>
          </span>
        );
      case "placed":
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-purple-600" />
            <span>Order Placed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
            <span>{status || "Processed"}</span>
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-transparent"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 35 }}
          className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden z-10 my-0 sm:my-4 flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

          {/* Header Banner */}
          <div className="p-3.5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg sm:text-xl font-black text-amber-300 shadow-inner shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "👤"}
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="text-sm sm:text-lg font-extrabold font-['Outfit'] text-white truncate max-w-[140px] sm:max-w-none">
                    {currentUser?.name || "Leafbasket Member"}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
                    <span>Club</span>
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-200 flex items-center gap-1.5 sm:gap-2 mt-0.5">
                  <span>{currentUser?.phone || "+91 98765 43210"}</span>
                  <span>•</span>
                  <span>{displayOrders.length} Orders</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex border-b border-stone-200 bg-stone-50 px-4 sm:px-6 shrink-0">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold border-b-2 transition cursor-pointer ${
                activeTab === "orders"
                  ? "border-emerald-700 text-emerald-900 bg-white shadow-2xs"
                  : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <span>Past Orders & Reorder</span>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-black">
                {displayOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold border-b-2 transition cursor-pointer ${
                activeTab === "profile"
                  ? "border-emerald-700 text-emerald-900 bg-white shadow-2xs"
                  : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>Account Details</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold border-b-2 transition cursor-pointer ${
                activeTab === "addresses"
                  ? "border-emerald-700 text-emerald-900 bg-white shadow-2xs"
                  : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Saved Addresses</span>
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            
            {/* TAB 1: PAST ORDERS & QUICK REORDER */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {/* Reorder Success Banner */}
                {reorderedOrderId && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-emerald-800 text-white rounded-2xl shadow-md flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold">All items added to your cart!</div>
                        <div className="text-[11px] text-emerald-200">Fresh harvest ready for 10-minute dispatch</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenCart();
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>View Cart</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {/* Sub-header info */}
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Showing {displayOrders.length} previous grocery orders</span>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>1-Click Reorder Enabled</span>
                  </span>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {displayOrders.map((order, idx) => {
                    const isReordered = reorderedOrderId === order.orderId;
                    const items = order.items || [];
                    const itemCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

                    return (
                      <div
                        key={order.orderId || idx}
                        className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Order Card Header */}
                        <div className="p-3.5 sm:p-4 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                              📦
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                                  #{order.orderId}
                                </span>
                                {getStatusBadge(order.orderStatus)}
                              </div>
                              <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-stone-400" />
                                  {formatOrderDate(order.createdAt)}
                                </span>
                                <span>•</span>
                                <span className="font-bold text-stone-700">
                                  ₹{order.totalAmount}
                                </span>
                                <span>•</span>
                                <span className="uppercase text-[10px] text-stone-400 font-mono">
                                  {order.paymentMethod}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Reorder All Button */}
                          <div className="flex items-center gap-2">
                            {order.orderStatus !== "delivered" && order.orderId && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onTrackOrder(order.orderId!);
                                }}
                                className="px-3 py-1.5 rounded-xl border border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Bike className="w-3.5 h-3.5" />
                                <span>Live Track</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleTriggerReorderAll(order)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                                isReordered
                                  ? "bg-emerald-800 text-white"
                                  : "bg-emerald-700 hover:bg-emerald-800 text-white"
                              }`}
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${isReordered ? "animate-spin" : ""}`} />
                              <span>{isReordered ? "Reordered!" : "Reorder All"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Items Preview Grid */}
                        <div className="p-3.5 sm:p-4 space-y-3">
                          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                            Items in this harvest ({itemCount} total items)
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {items.map((item, itemIdx) => {
                              const isSingleReordered = reorderedItemId === item.productId;

                              return (
                                <div
                                  key={itemIdx}
                                  className="flex items-center justify-between p-2 rounded-xl bg-stone-50/80 border border-stone-100 hover:border-emerald-200 transition"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-stone-900 truncate">
                                        {item.name}
                                      </div>
                                      <div className="text-[11px] text-stone-500">
                                        {item.quantity} × {item.unit} · <strong className="text-emerald-800">₹{item.price * item.quantity}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    {onOpenReviewProduct && (
                                      <button
                                        onClick={() => {
                                          onOpenReviewProduct({
                                            id: item.productId,
                                            name: item.name,
                                            image: item.image,
                                            unit: item.unit,
                                            price: item.price,
                                          });
                                        }}
                                        title="Rate & Review this product"
                                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                                      >
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <span className="hidden sm:inline">Rate</span>
                                      </button>
                                    )}

                                    {/* Quick Add Single Item to Cart */}
                                    <button
                                      onClick={() => handleTriggerReorderSingle(item)}
                                      title="Add this item to cart"
                                      className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                                        isSingleReordered
                                          ? "bg-emerald-700 text-white border-emerald-700"
                                          : "bg-white text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 border-stone-200"
                                      }`}
                                    >
                                      {isSingleReordered ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        <Plus className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer Details: Delivery address & invoice breakdown */}
                          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                            <div className="flex items-center gap-1.5 truncate max-w-sm">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="truncate">
                                {order.deliveryAddress?.street || order.deliveryAddress?.area},{" "}
                                {order.deliveryAddress?.city}
                              </span>
                            </div>

                            <button
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 underline cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>View Receipt</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ACCOUNT DETAILS */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>Personal Profile Details</span>
                    </div>
                    {!isEditingProfile && currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileSaveError(null);
                          setIsEditingProfile(true);
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label>
                        <span className="text-[11px] font-bold text-stone-500 block mb-1">Full Name</span>
                        <input
                          value={profileForm.name}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-emerald-600"
                          required
                        />
                      </label>
                      <label>
                        <span className="text-[11px] font-bold text-stone-500 block mb-1">Mobile Number</span>
                        <input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-emerald-600"
                          required
                        />
                      </label>
                      <label>
                        <span className="text-[11px] font-bold text-stone-500 block mb-1">Email Address</span>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-emerald-600"
                        />
                      </label>
                      <div className="flex items-end gap-2">
                        <button type="submit" disabled={isSavingProfile} className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-60 cursor-pointer">
                          {isSavingProfile ? "Saving..." : "Save Changes"}
                        </button>
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-white cursor-pointer">
                          Cancel
                        </button>
                      </div>
                      {profileSaveError && <div className="sm:col-span-2 text-rose-700 font-semibold">{profileSaveError}</div>}
                    </form>
                  ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-stone-500 block mb-1">Full Name</label>
                      <div className="p-2.5 bg-white border border-stone-200 rounded-xl font-bold text-stone-900">
                        {currentUser?.name || "Priya Sharma"}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-500 block mb-1">Verified Mobile</label>
                      <div className="p-2.5 bg-white border border-stone-200 rounded-xl font-mono text-stone-900">
                        {currentUser?.phone || "+91 98765 43210"}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-500 block mb-1">Registered Email</label>
                      <div className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900">
                        {currentUser?.email || "priya.sharma@example.com"}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-500 block mb-1">Account Tier</label>
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Leafbasket Priority Fresh (10 Mins)</span>
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Loyalty & Impact stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                    <div className="text-xs font-bold text-emerald-900">Total Orders</div>
                    <div className="text-xl font-black text-emerald-700 mt-0.5">{displayOrders.length}</div>
                    <div className="text-[10px] text-emerald-600">100% on-time delivery</div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                    <div className="text-xs font-bold text-amber-950">Green Savings</div>
                    <div className="text-xl font-black text-amber-700 mt-0.5">₹340</div>
                    <div className="text-[10px] text-amber-800">Coupons & discounts</div>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-center col-span-2 sm:col-span-1">
                    <div className="text-xs font-bold text-teal-950">Carbon Saved</div>
                    <div className="text-xl font-black text-teal-700 mt-0.5">4.8 kg</div>
                    <div className="text-[10px] text-teal-800">100% EV deliveries</div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SAVED ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-stone-900 flex items-center justify-between">
                  <span>Saved Delivery Locations</span>
                  <button type="button" onClick={() => setIsEditingAddresses((value) => !value)} className="text-xs font-bold text-emerald-700 flex items-center gap-1 cursor-pointer">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {isEditingAddresses && (
                  <div className="space-y-2">
                    <textarea
                      value={addressForm}
                      onChange={(e) => setAddressForm(e.target.value)}
                      rows={4}
                      placeholder="One delivery address per line"
                      className="w-full p-3 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-emerald-600"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={handleSaveAddresses} disabled={isSavingProfile} className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs disabled:opacity-60 cursor-pointer">{isSavingProfile ? "Saving..." : "Save Addresses"}</button>
                      <button type="button" onClick={() => setIsEditingAddresses(false)} className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs cursor-pointer">Cancel</button>
                    </div>
                    {profileSaveError && <div className="text-xs text-rose-700 font-semibold">{profileSaveError}</div>}
                  </div>
                )}

                <div className="space-y-2">
                  {(currentUser?.savedAddresses || [
                    "Flat 402, Oakwood Heights, 12th Main Rd, Indiranagar, Bengaluru - 560038",
                    "Prestige Tech Park, Block B, Outer Ring Rd, Marathahalli, Bengaluru - 560103",
                  ]).map((address, index) => (
                  <div key={address} className={`p-3.5 bg-white rounded-2xl border ${index === 0 ? "border-emerald-400" : "border-stone-200"} shadow-xs flex items-start justify-between`}>
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        {index === 0 ? "🏠" : "🏢"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                          <span>{index === 0 ? "Home (Default)" : `Saved Address ${index + 1}`}</span>
                          {index === 0 && <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Primary</span>}
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5">
                          {address}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                          ⚡ 8-10 Mins Dispatch Dark Store
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-1.5 text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>100% Encrypted Customer Data</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>

        {/* Invoice Breakdown Modal Popup */}
        {selectedInvoiceOrder && (
          <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
            <div
              onClick={() => setSelectedInvoiceOrder(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <div className="relative bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-stone-200 z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-extrabold text-sm text-stone-900">
                    Tax Invoice #{selectedInvoiceOrder.orderId}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Item Subtotal</span>
                  <span>₹{selectedInvoiceOrder.itemTotal || selectedInvoiceOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Partner Fee</span>
                  <span className="text-emerald-700 font-bold">FREE (Club)</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Eco-friendly Packaging</span>
                  <span>₹{selectedInvoiceOrder.packagingFee || 5}</span>
                </div>
                {(selectedInvoiceOrder.couponDiscount ?? 0) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount ({selectedInvoiceOrder.couponCode || "SUPERFAST"})</span>
                    <span>-₹{selectedInvoiceOrder.couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-2 border-t border-stone-200">
                  <span>Total Amount Paid</span>
                  <span className="text-emerald-800">₹{selectedInvoiceOrder.totalAmount}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
