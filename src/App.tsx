import React, { useState, useEffect, useRef } from "react";
import {
  Product,
  Category,
  CartItem,
  Order,
  Coupon,
  Rider,
  DatabaseStatus,
  ViewTab,
  AppNotification,
} from "./types";
import {
  fetchProducts,
  fetchCategories,
  fetchOrders,
  fetchCoupons,
  fetchRiders,
  fetchDBStatus,
  configureMongoURI,
  placeOrder,
  updateOrderStatus,
  updateOrderLocation,
  createProduct,
  updateProduct,
  deleteProduct,
  submitProductReview,
  voteReviewHelpful,
} from "./services/api";

import { Navbar } from "./components/Navbar";
import { HeroBanners } from "./components/HeroBanners";
import { CategoryGrid } from "./components/CategoryGrid";
import { ProductCard } from "./components/ProductCard";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { ReviewModal } from "./components/ReviewModal";
import { CartDrawer } from "./components/CartDrawer";
import { LiveOrderTracking } from "./components/LiveOrderTracking";
import { RiderPortal } from "./components/RiderPortal";
import { AdminHub } from "./components/AdminHub";
import { MongoConfigModal } from "./components/MongoConfigModal";
import { AIChefAssistant } from "./components/AIChefAssistant";
import { LocationPickerModal, DeliveryLocation } from "./components/LocationPickerModal";
import { AboutModal } from "./components/AboutModal";
import { AuthModal } from "./components/AuthModal";
import { UserProfileModal, UserProfile } from "./components/UserProfileModal";
import { PhonePeQrModal, UPIAppType } from "./components/PhonePeQrModal";
import { NotificationToasts } from "./components/NotificationToasts";
import { OrderStatusOverlayBadge } from "./components/OrderStatusOverlayBadge";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { MobileCartBar } from "./components/MobileCartBar";
import { LeafBasketLogo } from "./components/LeafBasketLogo";
import { detectUserLocation } from "./utils/geolocation";
import { playNotificationChime } from "./utils/audioChime";

import {
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Truck,
  Leaf,
  Heart,
  Phone,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState<ViewTab>("shop");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMongoModalOpen, setIsMongoModalOpen] = useState(false);
  const [isAIChefOpen, setIsAIChefOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<"orders" | "profile" | "addresses">("orders");
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [productDetailInitialTab, setProductDetailInitialTab] = useState<"overview" | "reviews">("overview");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetProduct, setReviewTargetProduct] = useState<{
    id: string;
    name: string;
    image: string;
    unit?: string;
    price?: number;
  } | null>(null);
  const [isPhonePeQrModalOpen, setIsPhonePeQrModalOpen] = useState(false);
  const [phonePeQrInitialApp, setPhonePeQrInitialApp] = useState<UPIAppType>("phonepe");

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("leafbasket_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation>(() => {
    try {
      const saved = localStorage.getItem("leafbasket_location");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: "loc-indiranagar",
      name: "Indiranagar 100ft Rd",
      area: "Indiranagar",
      city: "Bengaluru",
      pincode: "560038",
      deliveryTime: "8-10 mins",
      lat: 12.9716,
      lng: 77.6412,
      isAvailable: true,
    };
  });

  const [selectedAddress, setSelectedAddress] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("leafbasket_location");
      if (saved) {
        const loc = JSON.parse(saved);
        return `${loc.name}, ${loc.area}, ${loc.city}`;
      }
    } catch {}
    return "12th Main Rd, Indiranagar, Bengaluru";
  });

  // Attempt non-blocking location detection on initial app load if not customized
  useEffect(() => {
    const hasSaved = localStorage.getItem("leafbasket_location");
    if (!hasSaved) {
      detectUserLocation().then((loc) => {
        if (loc) {
          const newLoc: DeliveryLocation = {
            id: `loc-${Date.now()}`,
            name: loc.name,
            area: loc.area,
            city: loc.city,
            pincode: loc.pincode,
            deliveryTime: loc.deliveryTime,
            lat: loc.lat,
            lng: loc.lng,
            isAvailable: true,
            fullAddress: loc.fullAddress,
          };
          setSelectedLocation(newLoc);
          setSelectedAddress(`${newLoc.name}, ${newLoc.area}, ${newLoc.city}`);
          try {
            localStorage.setItem("leafbasket_location", JSON.stringify(newLoc));
          } catch {}
        }
      });
    }
  }, []);

  // App Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  // Shopping Cart & Coupon State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("leafbasket_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>("SUPERFAST");

  // Track active order
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // In-App Notifications & Live Order Alert System
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("leafbasket_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const previousOrderStatusesRef = useRef<Record<string, string>>({});

  // Notification Trigger Helper
  const triggerOrderStatusAlert = (
    order: Order,
    newStatus: string,
    customNote?: string
  ) => {
    let title = "Order Status Update";
    let message = customNote || `Your order #${order.orderId} is now ${newStatus.replace(/_/g, " ")}.`;
    let soundType: "status_update" | "delivered" | "out_for_delivery" | "placed" = "status_update";

    if (newStatus === "placed") {
      title = "Order Confirmed & Received! ⚡";
      message = customNote || `Order #${order.orderId} received at Indiranagar Dark Store #04. Sourcing 4 AM harvest.`;
      soundType = "placed";
    } else if (newStatus === "packed") {
      title = "Order Packed & Sealed 📦";
      message = customNote || `Carefully packed with cold-chain ice gel packs and assigned for dispatch.`;
      soundType = "status_update";
    } else if (newStatus === "out_for_delivery") {
      title = "Out for Delivery! 🛵";
      const riderName = order.riderDetails?.name || "Rider Rajesh K.";
      const eta = order.etaMinutes || 4;
      message = customNote || `${riderName} picked up your order on Ather EV and is en route (ETA: ~${eta} mins).`;
      soundType = "out_for_delivery";
    } else if (newStatus === "delivered") {
      title = "Order Delivered 🎉";
      message = customNote || `Farm-fresh groceries delivered at your doorstep. Verified with OTP. Enjoy!`;
      soundType = "delivered";
    } else if (newStatus === "cancelled") {
      title = "Order Cancelled";
      message = customNote || `Order #${order.orderId} has been cancelled.`;
      soundType = "status_update";
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.orderId,
      type: "order_status",
      title,
      message,
      status: newStatus as any,
      etaMinutes: order.etaMinutes,
      timestamp: `Today, ${timeString}`,
      read: false,
      riderName: order.riderDetails?.name,
    };

    // Play pleasant audio chime
    playNotificationChime(soundType);

    // Add to toasts stack (auto-dismissed in 7s)
    setActiveToasts((prev) => [newNotification, ...prev.slice(0, 4)]);

    // Add to persistent notification history
    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, 30);
      try {
        localStorage.setItem("leafbasket_notifications", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem("leafbasket_notifications", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem("leafbasket_notifications");
    } catch {}
  };

  const handleSelectNotification = (notif: AppNotification) => {
    if (notif.orderId) {
      setActiveTrackingOrderId(notif.orderId);
      setCurrentTab("tracking");
    }
  };

  // Save user changes
  const handleUserLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("leafbasket_user", JSON.stringify(user));
    } catch (e) {
      console.warn("Could not persist user", e);
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("leafbasket_user");
    } catch (e) {
      console.warn("Could not remove user", e);
    }
  };

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem("leafbasket_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Could not persist cart", e);
    }
  }, [cartItems]);

  // Initial Data Load
  const loadInitialData = async () => {
    try {
      const [prods, cats, ords, cps, rds, db] = await Promise.allSettled([
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchCoupons(),
        fetchRiders(),
        fetchDBStatus(),
      ]);

      if (prods.status === "fulfilled") setProducts(prods.value);
      if (cats.status === "fulfilled") setCategories(cats.value);
      if (ords.status === "fulfilled") {
        setOrders(ords.value);
        ords.value.forEach((o) => {
          previousOrderStatusesRef.current[o.orderId] = o.orderStatus;
        });
        if (ords.value.length > 0 && !activeTrackingOrderId) {
          setActiveTrackingOrderId(ords.value[0].orderId);
        }
      }
      if (cps.status === "fulfilled") setCoupons(cps.value);
      if (rds.status === "fulfilled") setRiders(rds.value);
      if (db.status === "fulfilled") setDbStatus(db.value);
    } catch (err) {
      console.error("Initial load error:", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Background polling for order status changes
  useEffect(() => {
    const hasActiveOrders = orders.some((o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled");
    if (!hasActiveOrders && orders.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const freshOrders = await fetchOrders();
        freshOrders.forEach((fresh) => {
          const prevStatus = previousOrderStatusesRef.current[fresh.orderId];
          if (prevStatus && prevStatus !== fresh.orderStatus) {
            const lastNote = fresh.statusTimeline?.[fresh.statusTimeline.length - 1]?.note;
            triggerOrderStatusAlert(fresh, fresh.orderStatus, lastNote);
          }
          previousOrderStatusesRef.current[fresh.orderId] = fresh.orderStatus;
        });
        setOrders(freshOrders);
      } catch (e) {
        // silent polling catch
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orders]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const handleAddMultipleToCart = (prods: Product[]) => {
    setCartItems((prev) => {
      const updated = [...prev];
      prods.forEach((prod) => {
        const existing = updated.find((it) => it.product.id === prod.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          updated.push({ product: prod, quantity: 1 });
        }
      });
      return updated;
    });
    setIsAIChefOpen(false);
    setIsCartOpen(true);
  };

  // Quick Reorder Handlers for User Profile Past Orders
  const handleReorderAll = (
    items: { productId: string; name: string; price: number; quantity: number; unit: string; image: string }[]
  ) => {
    setCartItems((prev) => {
      const updated = [...prev];
      items.forEach((item) => {
        const foundProduct = products.find((p) => p.id === item.productId);
        const productToUse: Product = foundProduct || {
          id: item.productId,
          name: item.name,
          hindiName: "",
          category: "vegetables",
          price: item.price,
          originalPrice: Math.round(item.price * 1.25),
          discountPercentage: 18,
          unit: item.unit || "1 unit",
          image: item.image,
          inStock: true,
          stockCount: 50,
          rating: 4.8,
          ratingCount: 142,
          reviewsCount: 142,
          tags: ["Fresh", "Reordered"],
          description: `${item.name} - Handpicked 10-minute dispatch quality`,
          harvestDate: "Today 4:00 AM",
          farmLocation: "Certified Regional Organic Farm",
          nutrition: { calories: 45, carbs: "8g", protein: "2g", fat: "0.2g", fiber: "2.5g" },
          shelfLifeDays: 5,
          organicCertified: true,
          deliveryTimeMinutes: 10,
        };

        const existing = updated.find((it) => it.product.id === productToUse.id);
        if (existing) {
          existing.quantity += item.quantity || 1;
        } else {
          updated.push({ product: productToUse, quantity: item.quantity || 1 });
        }
      });
      return updated;
    });
  };

  const handleReorderSingleItem = (
    item: { productId: string; name: string; price: number; quantity: number; unit: string; image: string }
  ) => {
    const foundProduct = products.find((p) => p.id === item.productId);
    const productToUse: Product = foundProduct || {
      id: item.productId,
      name: item.name,
      hindiName: "",
      category: "vegetables",
      price: item.price,
      originalPrice: Math.round(item.price * 1.25),
      discountPercentage: 18,
      unit: item.unit || "1 unit",
      image: item.image,
      inStock: true,
      stockCount: 50,
      rating: 4.8,
      ratingCount: 142,
      reviewsCount: 142,
      tags: ["Fresh", "Reordered"],
      description: `${item.name} - Handpicked 10-minute dispatch quality`,
      harvestDate: "Today 4:00 AM",
      farmLocation: "Certified Regional Organic Farm",
      nutrition: { calories: 45, carbs: "8g", protein: "2g", fat: "0.2g", fiber: "2.5g" },
      shelfLifeDays: 5,
      organicCertified: true,
      deliveryTimeMinutes: 10,
    };

    handleAddToCart(productToUse);
  };

  // Order Placement
  const handlePlaceOrder = async (orderPayload: any) => {
    const created = await placeOrder(orderPayload);
    previousOrderStatusesRef.current[created.orderId] = created.orderStatus;
    setOrders((prev) => [created, ...prev]);
    setActiveTrackingOrderId(created.orderId);
    setCartItems([]);
    setCurrentTab("tracking");

    // Trigger instant placed alert
    triggerOrderStatusAlert(created, "placed");
  };

  // Order Status Updates
  const handleUpdateOrderStatus = async (orderId: string, status: string, note?: string) => {
    const updated = await updateOrderStatus(orderId, status, note);
    previousOrderStatusesRef.current[orderId] = status;
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));

    // Trigger status transition notification & sound chime
    triggerOrderStatusAlert(updated, status, note);
  };

  // Rider location update simulation
  const handleUpdateOrderLocation = async (orderId: string, lat: number, lng: number, etaMinutes?: number) => {
    const updated = await updateOrderLocation(orderId, lat, lng, etaMinutes);
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
  };

  // Admin Catalog Operations
  const handleAddProduct = async (productData: Partial<Product>) => {
    const newProd = await createProduct(productData);
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = await updateProduct(id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Product Review Operations
  const handleOpenWriteReview = (productTarget: {
    id: string;
    name: string;
    image: string;
    unit?: string;
    price?: number;
  }) => {
    setReviewTargetProduct(productTarget);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (
    productId: string,
    reviewData: {
      userName: string;
      rating: number;
      comment: string;
      verifiedPurchase?: boolean;
    }
  ) => {
    const reviewResult = await submitProductReview(productId, reviewData);
    if (reviewResult) {
      const updatedProduct = reviewResult.product;
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updatedProduct : p))
      );
      if (selectedProductDetail && selectedProductDetail.id === productId) {
        setSelectedProductDetail(updatedProduct);
      }
    }
  };

  const handleVoteReviewHelpful = async (productId: string, reviewId: string) => {
    const result = await voteReviewHelpful(productId, reviewId);
    if (result && result.success) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId || !p.reviews) return p;
          return {
            ...p,
            reviews: p.reviews.map((r) =>
              r.id === reviewId ? { ...r, helpfulCount: result.helpfulCount } : r
            ),
          };
        })
      );
      if (selectedProductDetail && selectedProductDetail.id === productId && selectedProductDetail.reviews) {
        setSelectedProductDetail((prev) => {
          if (!prev || !prev.reviews) return prev;
          return {
            ...prev,
            reviews: prev.reviews.map((r) =>
              r.id === reviewId ? { ...r, helpfulCount: result.helpfulCount } : r
            ),
          };
        });
      }
    }
  };

  // Open Product Detail with initial tab
  const handleOpenProductDetail = (
    product: Product,
    tab: "overview" | "reviews" = "overview"
  ) => {
    setProductDetailInitialTab(tab);
    setSelectedProductDetail(product);
  };

  // Product filtering logic
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) {
      return false;
    }
    if (activeTagFilter && (!p.tags || !p.tags.includes(activeTagFilter))) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchHindi = p.hindiName && p.hindiName.includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      return matchName || matchHindi || matchCat || matchDesc;
    }
    return true;
  });

  const activeTrackingOrder =
    orders.find((o) => o.orderId === activeTrackingOrderId) || orders[0] || null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLocationPicker={() => setIsLocationModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode || "login");
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={(tab) => {
          setProfileInitialTab(tab || "orders");
          setIsProfileModalOpen(true);
        }}
        currentUser={currentUser}
        onLogout={handleUserLogout}
        selectedAddress={selectedAddress}
        onOpenAIChef={() => setIsAIChefOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        products={products}
        onSelectProduct={(p) => setSelectedProductDetail(p)}
        activeOrderCount={orders.filter((o) => o.orderStatus !== "delivered").length}
        notifications={notifications}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onClearNotifications={handleClearNotifications}
        onSelectNotification={handleSelectNotification}
      />


      {/* Main Screen View Content */}
      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3.5 sm:py-6 pb-32 lg:pb-8">
        {currentTab === "shop" && (
          <div>
            {/* Hero Banner & Flash Coupons */}
            <HeroBanners
              onApplyCoupon={(code) => {
                setAppliedCoupon(code);
                setIsCartOpen(true);
              }}
              onOpenAIChef={() => setIsAIChefOpen(true)}
            />

            {/* Quick Aisles Categories */}
            <CategoryGrid
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                setActiveTagFilter(null);
              }}
            />

            {/* Quick Tag Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar text-xs font-semibold">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] pl-1">
                Filter:
              </span>
              <button
                onClick={() => setActiveTagFilter(null)}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  activeTagFilter === null
                    ? "bg-emerald-800 text-white"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                }`}
              >
                All Aisles ({filteredProducts.length})
              </button>
              <button
                onClick={() => setActiveTagFilter("bestseller")}
                className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1 ${
                  activeTagFilter === "bestseller"
                    ? "bg-emerald-800 text-white"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                }`}
              >
                <span>🔥 Best Sellers</span>
              </button>
              <button
                onClick={() => setActiveTagFilter("organic")}
                className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1 ${
                  activeTagFilter === "organic"
                    ? "bg-emerald-800 text-white"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                }`}
              >
                <span>🌱 100% Organic</span>
              </button>
              <button
                onClick={() => setActiveTagFilter("breakfast")}
                className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1 ${
                  activeTagFilter === "breakfast"
                    ? "bg-emerald-800 text-white"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                }`}
              >
                <span>🥛 Breakfast & Dairy</span>
              </button>
              <button
                onClick={() => setActiveTagFilter("daily-essentials")}
                className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1 ${
                  activeTagFilter === "daily-essentials"
                    ? "bg-emerald-800 text-white"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                }`}
              >
                <span>⚡ Daily Essentials</span>
              </button>
            </div>

            {/* Product Grid Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900 font-['Outfit']">
                  {selectedCategory === "all"
                    ? "Farm-Fresh Grocery Aisles"
                    : categories.find((c) => c.id === selectedCategory)?.name || "Fresh Picks"}
                </h3>
                <p className="text-xs text-stone-500">
                  {filteredProducts.length} items ready for 10-minute dispatch
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Next Delivery: 10 mins</span>
              </div>
            </div>

            {/* Product Grid Cards */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8">
                <div className="text-4xl mb-2">🔍</div>
                <h4 className="text-base font-extrabold text-stone-900">No matching items found</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Try searching for another keyword like "milk", "tomatoes", "sourdough", or reset filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setActiveTagFilter(null);
                  }}
                  className="mt-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Reset Catalog Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredProducts.map((product) => {
                  const cartItem = cartItems.find((ci) => ci.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      cartQuantity={qty}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      onOpenDetail={(p) => handleOpenProductDetail(p, "overview")}
                      onOpenReviews={(p) => handleOpenProductDetail(p, "reviews")}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Live Order Tracking View */}
        {currentTab === "tracking" && (
          <LiveOrderTracking
            order={activeTrackingOrder}
            onBackToShop={() => setCurrentTab("shop")}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdateLocation={handleUpdateOrderLocation}
            onOpenReviewProduct={handleOpenWriteReview}
          />
        )}

        {/* Rider Portal View */}
        {currentTab === "rider-portal" && (
          <RiderPortal
            orders={orders}
            riders={riders}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdateLocation={handleUpdateOrderLocation}
          />
        )}

        {/* Store Manager & Admin Hub View */}
        {currentTab === "admin-hub" && (
          <AdminHub
            products={products}
            orders={orders}
            categories={categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
          cartQuantity={
            cartItems.find((ci) => ci.product.id === selectedProductDetail.id)?.quantity || 0
          }
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          initialTab={productDetailInitialTab}
          onOpenWriteReview={handleOpenWriteReview}
          onVoteHelpful={handleVoteReviewHelpful}
        />
      )}

      {/* Review & Rating Submission Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        targetProduct={reviewTargetProduct}
        currentUser={currentUser}
        onSubmitReview={handleSubmitReview}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={() => setCartItems([])}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(code) => setAppliedCoupon(code)}
        onRemoveCoupon={() => setAppliedCoupon(null)}
        coupons={coupons}
        onPlaceOrder={handlePlaceOrder}
        selectedLocation={selectedLocation}
        onOpenLocationPicker={() => setIsLocationModalOpen(true)}
        onOpenPastOrders={() => {
          setProfileInitialTab("orders");
          setIsProfileModalOpen(true);
        }}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentAddress={selectedAddress}
        onSelectLocation={(loc: DeliveryLocation) => {
          setSelectedLocation(loc);
          setSelectedAddress(`${loc.name}, ${loc.area}, ${loc.city}`);
          try {
            localStorage.setItem("leafbasket_location", JSON.stringify(loc));
          } catch {}
        }}
      />

      {/* About Leafbasket Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* User Profile & Past Orders Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleUserLogout}
        onLoginSuccess={handleUserLogin}
        orders={orders}
        products={products}
        onReorderAll={handleReorderAll}
        onReorderSingleItem={handleReorderSingleItem}
        onTrackOrder={(orderId) => {
          setActiveTrackingOrderId(orderId);
          setCurrentTab("tracking");
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReviewProduct={handleOpenWriteReview}
        initialTab={profileInitialTab}
      />

      {/* Auth Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          handleUserLogin(user);
          setProfileInitialTab("orders");
        }}
        initialMode={authMode}
      />

      {/* AI Chef Assistant Modal */}
      <AIChefAssistant
        isOpen={isAIChefOpen}
        onClose={() => setIsAIChefOpen(false)}
        products={products}
        onAddMultipleToCart={handleAddMultipleToCart}
      />

      {/* Instant PhonePe / Multi-UPI Live QR Modal */}
      <PhonePeQrModal
        isOpen={isPhonePeQrModalOpen}
        onClose={() => setIsPhonePeQrModalOpen(false)}
        amount={cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0) || 199}
        initialApp={phonePeQrInitialApp}
        onPaymentSuccess={() => {
          setIsPhonePeQrModalOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* Premium Privacy-First Customer Footer */}
      <footer className="mt-12 bg-white border-t border-stone-200 pt-10 pb-28 lg:pb-8 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-3">
              <LeafBasketLogo variant="horizontal" size="sm" showTagline={true} />
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              India's premier 10-minute farm-fresh grocery delivery platform. Harvested daily at 4 AM directly from certified regional farms.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>FSSAI Certified · 100% Cold Chain</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
              10-Minute Dark Stores
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-500">
              <li>📍 Indiranagar Hub #04</li>
              <li>📍 Koramangala Hub #02</li>
              <li>📍 HSR Layout Sector 1 Hub #08</li>
              <li>📍 Jubilee Hills Hub #07</li>
              <li>📍 Gachibowli Financial Hub #09</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
              Customer Guarantees
            </h4>
            <div className="space-y-2 text-xs text-stone-500">
              <div className="flex items-center gap-1.5 text-stone-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Organic & Chemical Free</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Spoilage Cold Chain Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Hassle-Free Refunds</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Emission 100% Electric EV Fleet</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
              Security & Privacy
            </h4>
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Privacy Protected Experience</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                All order details, payments, and location signals are securely encrypted end-to-end.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-medium">
                <span>🔒 256-bit SSL</span>
                <span>•</span>
                <span>🛡️ PCI-DSS Level 1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>© {new Date().getFullYear()} Leaf Basket Technologies Pvt. Ltd. All rights reserved.</span>
            <span className="hidden sm:inline text-stone-300">•</span>
            <span className="inline-flex items-center gap-1 text-stone-500 font-medium">
              Designed by{" "}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=hemanthgantinapalli%40gmail.com&su=Inquiry%20from%20Leaf%20Basket%20App&body=Hi%20Hemanth%2C%0A%0AI%20am%20reaching%20out%20regarding%20Leaf%20Basket..."
                target="_blank"
                rel="noreferrer"
                id="footer-designer-email-link"
                className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-1 transition"
                title="Send email to hemanthgantinapalli@gmail.com"
              >
                <span>hemanthgantinapalli</span>
                <span className="text-rose-500 hover:scale-125 transition-transform">❤️</span>
              </a>
            </span>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <span onClick={() => setIsAboutModalOpen(true)} className="hover:text-stone-600 cursor-pointer">
              About Us
            </span>
            <span className="hover:text-stone-600 cursor-pointer">Privacy & Security</span>
            <span className="hover:text-stone-600 cursor-pointer">Terms of Service</span>

            <div className="h-3 w-px bg-stone-200 hidden sm:block" />

            <span
              onClick={() => {
                setPhonePeQrInitialApp("phonepe");
                setIsPhonePeQrModalOpen(true);
              }}
              id="footer-phonepe-qr-link"
              className="text-purple-800 hover:text-purple-950 font-semibold cursor-pointer flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 hover:border-purple-300 transition"
              title="Scan direct PhonePe UPI QR"
            >
              <span>🟣</span>
              <span>PhonePe UPI QR</span>
            </span>

            {/* Restricted Staff & Partner Access Gates */}
            <span
              onClick={() => setCurrentTab("admin-hub")}
              id="footer-admin-hub-link"
              className="text-stone-600 hover:text-emerald-800 font-semibold cursor-pointer flex items-center gap-1 bg-stone-100 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-stone-200 hover:border-emerald-300 transition"
            >
              <span>🔐</span>
              <span>Store Manager Portal</span>
            </span>
            <span
              onClick={() => setCurrentTab("rider-portal")}
              id="footer-rider-portal-link"
              className="text-stone-600 hover:text-amber-800 font-semibold cursor-pointer flex items-center gap-1 bg-stone-100 hover:bg-amber-50 px-2.5 py-1 rounded-lg border border-stone-200 hover:border-amber-300 transition"
            >
              <span>🛵</span>
              <span>Delivery Partner Gate</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Active Order Status Overlay Badge */}
      <OrderStatusOverlayBadge
        activeOrder={currentTab !== "tracking" ? activeTrackingOrder : null}
        onOpenTracking={(orderId) => {
          setActiveTrackingOrderId(orderId);
          setCurrentTab("tracking");
        }}
      />

      {/* Real-time Order Update Toast Alerts */}
      <NotificationToasts
        notifications={activeToasts}
        onDismiss={handleDismissToast}
        onSelectNotification={handleSelectNotification}
      />

      {/* Floating Sticky Bottom Cart Bar for Mobile Viewport */}
      <MobileCartBar
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        isOpen={isCartOpen}
      />

      {/* Persistent Native-Feel Bottom Navigation Bar for Mobile */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAIChef={() => setIsAIChefOpen(true)}
        onOpenProfile={(tab) => {
          setProfileInitialTab(tab || "orders");
          setIsProfileModalOpen(true);
        }}
        onOpenAuth={(mode) => {
          setAuthMode(mode || "login");
          setIsAuthModalOpen(true);
        }}
        currentUser={currentUser}
        activeOrderCount={orders.filter((o) => o.orderStatus !== "delivered").length}
        onScrollToCategories={() => {
          if (currentTab !== "shop") {
            setCurrentTab("shop");
          }
          setTimeout(() => {
            const el = document.getElementById("categories-section-anchor");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 50);
        }}
      />

    </div>
  );
}
