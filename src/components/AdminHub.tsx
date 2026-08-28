import React, { useState } from "react";
import { Product, Order, Category, Rider } from "../types";
import { UserProfile } from "./UserProfileModal";
import {
  PackagePlus,
  TrendingUp,
  Clock,
  DollarSign,
  Layers,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Search,
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  LogOut,
  UserCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Store,
  Building,
  Activity,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Box,
  Truck,
  Users,
  RefreshCw,
  BadgePercent,
  Check,
  Download,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { LeafBasketLogo } from "./LeafBasketLogo";
import { motion, AnimatePresence } from "motion/react";

const PRIVATE_ADMIN_EMAIL = "admin@123.com";
const PRIVATE_ADMIN_PASSWORD = "admin123";

interface AdminHubProps {
  products: Product[];
  orders: Order[];
  riders: Rider[];
  categories: Category[];
  onAddProduct: (product: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: string, note?: string) => Promise<void>;
  onAssignOrderRider: (orderId: string, riderId: string) => Promise<void>;
  onSaveAdminProfile: (profile: { name: string; email: string; hub: string; role: string }) => Promise<void>;
  onApproveRider: (riderId: string) => Promise<void>;
  onSetRiderBlocked: (riderId: string, blocked: boolean) => Promise<void>;
  onDeleteRider: (riderId: string) => Promise<void>;
  users: UserProfile[];
  onSetUserBlocked: (userId: string, blocked: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export const AdminHub: React.FC<AdminHubProps> = ({
  products,
  orders,
  riders,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onAssignOrderRider,
  onSaveAdminProfile,
  onApproveRider,
  onSetRiderBlocked,
  onDeleteRider,
  users,
  onSetUserBlocked,
  onDeleteUser,
}) => {
  // Session Authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("leafbasket_admin_authenticated") === "true";
    } catch {
      return false;
    }
  });

  // Admin Auth & Registration States
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [adminName, setAdminName] = useState("Leafbasket Administrator");
  const [adminEmail, setAdminEmail] = useState(PRIVATE_ADMIN_EMAIL);
  const [adminHubLocation, setAdminHubLocation] = useState(() => {
    try {
      return sessionStorage.getItem("leafbasket_admin_hub") || "Dark Store #04 - Indiranagar, Bengaluru";
    } catch {
      return "Dark Store #04 - Indiranagar, Bengaluru";
    }
  });
  const [adminRoleSelection, setAdminRoleSelection] = useState("Store Operations Director");
  const [adminPassword, setAdminPassword] = useState("");
  const [employeeAuthKey, setEmployeeAuthKey] = useState("LEAF-ADMIN-2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [activeAdminRole, setActiveAdminRole] = useState<string>(() => {
    try {
      return sessionStorage.getItem("leafbasket_admin_role") || "Store Operations Director";
    } catch {
      return "Store Operations Director";
    }
  });

  // Dashboard Navigation & Filters
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "catalog" | "analytics" | "profile" | "users">("overview");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  // New product form state
  const [newProdName, setNewProdName] = useState("");
  const [newProdTeluguName, setNewProdTeluguName] = useState("");
  const [newProdHindiName, setNewProdHindiName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id || "vegetables-fruits");
  const [newProdPrice, setNewProdPrice] = useState("45");
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState("60");
  const [newProdUnit, setNewProdUnit] = useState("500 g");
  const [newProdStockCount, setNewProdStockCount] = useState("65");
  const [newProdImage, setNewProdImage] = useState(
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80"
  );
  const [newProdDescription, setNewProdDescription] = useState("Farm-fresh harvest sourced locally directly from verified orchards.");
  const [newProdIsOrganic, setNewProdIsOrganic] = useState(true);

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditingAdminProfile, setIsEditingAdminProfile] = useState(false);
  const [adminProfileError, setAdminProfileError] = useState<string | null>(null);
  const [isSavingAdminProfile, setIsSavingAdminProfile] = useState(false);

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAdminProfile(true);
    setAdminProfileError(null);
    try {
      await onSaveAdminProfile({ name: adminName, email: adminEmail, hub: adminHubLocation, role: activeAdminRole });
      setIsEditingAdminProfile(false);
    } catch (error: any) {
      setAdminProfileError(error.message || "Could not save administrator profile.");
    } finally {
      setIsSavingAdminProfile(false);
    }
  };

  // Metrics Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === "paid" ? o.totalAmount : 0), 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);
  const activeOrdersCount = orders.filter((o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled").length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === "delivered").length;
  const outOfStockCount = products.filter((p) => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0)).length;
  const onlineRidersCount = riders.filter((rider) => rider.isApproved !== false && !rider.isBlocked && rider.currentStatus !== "offline").length;
  const pendingRidersCount = riders.filter((rider) => rider.isApproved === false).length;
  const blockedRidersCount = riders.filter((rider) => rider.isBlocked).length;
  const unassignedOrdersCount = orders.filter((order) => !order.riderDetails && order.orderStatus !== "delivered" && order.orderStatus !== "cancelled").length;
  const pendingOrdersCount = orders.filter((order) => order.orderStatus === "placed").length;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const isMatch = adminEmail.trim().toLowerCase() === PRIVATE_ADMIN_EMAIL && adminPassword === PRIVATE_ADMIN_PASSWORD;

    if (isMatch) {
      setAdminName("Leafbasket Administrator");
      setAdminEmail(PRIVATE_ADMIN_EMAIL);
      setActiveAdminRole("Store Operations Director");
      setIsAdminLoggedIn(true);
      try {
        sessionStorage.setItem("leafbasket_admin_authenticated", "true");
        sessionStorage.setItem("leafbasket_admin_email", PRIVATE_ADMIN_EMAIL);
        sessionStorage.setItem("leafbasket_admin_role", "Store Operations Director");
      } catch (err) {
        console.error(err);
      }
    } else {
      setLoginError("Private admin credentials did not match. Only the platform owner can access this console.");
    }
  };

  const handleAdminRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("Admin registration is restricted. Use the private owner credentials on the Sign In tab.");
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminPassword("");
    setRegisterSuccess(null);
    try {
      sessionStorage.removeItem("leafbasket_admin_authenticated");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const price = Number(newProdPrice) || 30;
    const origPrice = Number(newProdOriginalPrice) || price;
    const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
    const stock = Number(newProdStockCount) || 50;

    await onAddProduct({
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      teluguName: newProdTeluguName.trim() || undefined,
      hindiName: newProdHindiName.trim() || undefined,
      category: newProdCategory,
      price,
      originalPrice: origPrice,
      discountPercentage: discount,
      unit: newProdUnit,
      inStock: stock > 0,
      stockCount: stock,
      image: newProdImage,
      description: newProdDescription,
      isOrganic: newProdIsOrganic,
      deliveryTimeMinutes: 10,
      rating: 4.9,
      reviewsCount: 1,
      tags: ["fresh", "new-arrival", newProdIsOrganic ? "organic" : "farm-direct"],
    });

    setIsAddModalOpen(false);
    setNewProdName("");
    setNewProdTeluguName("");
    setNewProdHindiName("");
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    await onUpdateProduct(editingProduct.id, {
      name: editingProduct.name,
      teluguName: editingProduct.teluguName,
      hindiName: editingProduct.hindiName,
      category: editingProduct.category,
      price: Number(editingProduct.price),
      originalPrice: Number(editingProduct.originalPrice),
      stockCount: Number(editingProduct.stockCount || 0),
      inStock: Number(editingProduct.stockCount || 0) > 0,
      unit: editingProduct.unit,
      image: editingProduct.image,
      description: editingProduct.description,
      isOrganic: editingProduct.isOrganic,
    });

    setEditingProduct(null);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.teluguName && p.teluguName.includes(searchQuery)) ||
      (p.hindiName && p.hindiName.includes(searchQuery)) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === "all") return true;
    return o.orderStatus === orderStatusFilter;
  });

  // ----------------------------------------------------
  // Unauthenticated State: Modern Professional Dark Hub Gate
  // ----------------------------------------------------
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-xl mx-auto my-6 sm:my-10 px-4">
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Security Branding Header */}
          <div className="text-center space-y-3 mb-8 relative z-10">
            <div className="inline-flex p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 mb-2">
                <Lock className="w-3 h-3" />
                <span>Private Owner Access · 256-Bit TLS</span>
              </div>
              <h2 className="text-2xl font-black font-['Outfit'] text-white tracking-tight">
                Dark Store Operations Console
              </h2>
              <p className="text-xs text-stone-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Bengaluru operations console for orders, inventory, rider access, and delivery control.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1.5 bg-stone-800/90 border border-stone-700/80 rounded-2xl max-w-xs mx-auto mt-4 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setLoginError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  authMode === "login"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                Executive Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setLoginError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  authMode === "register"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                Owner Access Only
              </button>
            </div>
          </div>

          {registerSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-2.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{registerSuccess}</span>
            </motion.div>
          )}

          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-rose-950/90 border border-rose-500/50 rounded-2xl text-rose-200 text-xs flex items-center gap-2.5 shadow-md"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">{loginError}</span>
            </motion.div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10 text-xs">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1.5 uppercase tracking-wider">
                  Corporate Staff Email / Admin ID
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@leafbasket.com"
                    className="w-full px-4 py-3 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-medium focus:outline-emerald-500 focus:border-emerald-500 text-xs transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Master Security Passcode / PIN
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Private Owner Account
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter private owner password"
                    className="w-full px-4 py-3 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-mono tracking-widest focus:outline-emerald-500 focus:border-emerald-500 text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60 text-[11px] text-stone-400 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-200">Owner-only controls:</span> order dispatch, inventory, rider approvals, delivery overrides, and profile permissions.
                </div>
              </div>

              <button
                type="submit"
                id="admin-login-submit-btn"
                    className="w-full py-3.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Authorize & Open Dark Store Console</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminRegister} className="space-y-3.5 relative z-10 text-xs">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                  Full Administrator Name
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Operations Lead"
                  className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-medium focus:outline-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                    Official Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="staff@leafbasket.com"
                    className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-medium focus:outline-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                    Role & Permissions
                  </label>
                  <select
                    value={adminRoleSelection}
                    onChange={(e) => setAdminRoleSelection(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white font-medium focus:outline-emerald-500 text-xs cursor-pointer"
                  >
                    <option value="Store Operations Director">Store Operations Director</option>
                    <option value="Catalog & Inventory Lead">Catalog & Inventory Lead</option>
                    <option value="Regional Dark Store Manager">Regional Dark Store Manager</option>
                    <option value="Dispatch Control Specialist">Dispatch Control Specialist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                  Assigned Dark Store Fulfillment Hub
                </label>
                <input
                  type="text"
                  required
                  value={adminHubLocation}
                  onChange={(e) => setAdminHubLocation(e.target.value)}
                  placeholder="Dark Store #04 - Indiranagar, Bengaluru"
                  className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-medium focus:outline-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                    Set Security Master PIN
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Set 4+ digit PIN"
                    className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-mono focus:outline-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                    Staff Authorization Key
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeAuthKey}
                    onChange={(e) => setEmployeeAuthKey(e.target.value)}
                    placeholder="LEAF-ADMIN-2026"
                    className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-mono focus:outline-emerald-500 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="admin-register-submit-btn"
                className="w-full py-3.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Create Staff Account & Sign In</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Authenticated State: Full-Featured Enterprise Admin Dashboard
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 px-3 sm:px-6">
      {/* Top Operations Header Bar */}
      <div className="bg-stone-900 text-white p-5 sm:p-6 rounded-3xl border border-stone-800 shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black font-['Outfit'] text-white">
                Dark Store Control Center
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Dispatch #04 (Indiranagar)
              </span>
            </div>
            <div className="text-xs text-stone-300 flex flex-wrap items-center gap-2.5 mt-1">
              <span className="font-semibold text-emerald-400">👤 {adminEmail}</span>
              <span className="text-stone-600">|</span>
              <span className="text-stone-300 font-medium">{activeAdminRole}</span>
              <span className="text-stone-600">|</span>
              <span className="text-emerald-300 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>256-Bit Encrypted Session</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setIsAddModalOpen(true)}
            id="admin-add-product-quick-btn"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Add Fresh SKU</span>
          </button>
          <button
            onClick={handleAdminLogout}
            id="admin-logout-btn"
            className="px-3.5 py-2.5 bg-stone-800 hover:bg-rose-950/80 hover:text-rose-200 text-stone-300 border border-stone-700 hover:border-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Lock session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-stone-400">Orders Waiting</div>
          <div className="text-xl font-black text-amber-700 mt-1">{pendingOrdersCount}</div>
          <div className="text-[10px] text-stone-500">Newly placed</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-stone-400">Needs Rider</div>
          <div className="text-xl font-black text-rose-700 mt-1">{unassignedOrdersCount}</div>
          <div className="text-[10px] text-stone-500">Unassigned drops</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-stone-400">Drivers Online</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{onlineRidersCount}</div>
          <div className="text-[10px] text-stone-500">Ready for dispatch</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-stone-400">Approval Queue</div>
          <div className="text-xl font-black text-blue-700 mt-1">{pendingRidersCount}</div>
          <div className="text-[10px] text-stone-500">Rider applications</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-stone-400">Access Holds</div>
          <div className="text-xl font-black text-stone-700 mt-1">{blockedRidersCount}</div>
          <div className="text-[10px] text-stone-500">Blocked profiles</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-stone-900">Administrator Profile & Permissions</div>
            <div className="text-[11px] text-stone-500 mt-1">{adminName || "Store administrator"} · {adminEmail}</div>
          </div>
          <button type="button" onClick={() => setIsEditingAdminProfile((value) => !value)} className="text-xs font-bold text-emerald-700 flex items-center gap-1 cursor-pointer">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        {isEditingAdminProfile && (
          <form onSubmit={handleSaveAdminProfile} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Full name" required className="p-2.5 border border-stone-300 rounded-xl text-xs" />
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Email" required className="p-2.5 border border-stone-300 rounded-xl text-xs" />
            <input value={adminHubLocation} onChange={(e) => setAdminHubLocation(e.target.value)} placeholder="Hub address" required className="p-2.5 border border-stone-300 rounded-xl text-xs" />
            <div className="flex gap-2">
              <select value={activeAdminRole} onChange={(e) => setActiveAdminRole(e.target.value)} className="min-w-0 flex-1 p-2.5 border border-stone-300 rounded-xl text-xs">
                <option>Store Operations Director</option>
                <option>Dispatch Lead</option>
                <option>Catalog Curator</option>
              </select>
              <button type="submit" disabled={isSavingAdminProfile} className="px-3 rounded-xl bg-emerald-700 text-white text-xs font-bold disabled:opacity-60 cursor-pointer">{isSavingAdminProfile ? "Saving" : "Save"}</button>
            </div>
            {adminProfileError && <div className="sm:col-span-2 lg:col-span-4 text-xs text-rose-700 font-semibold">{adminProfileError}</div>}
          </form>
        )}
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Gross Settled Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 font-['Outfit'] mt-2">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100%
            </span>
            <span>via Instant UPI & COD</span>
          </div>
        </div>

        {/* Metric 2: Orders Activity */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Live & Fulfilled Orders</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-['Outfit'] mt-2 flex items-baseline gap-2">
            <span>{orders.length}</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {activeOrdersCount} in transit
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {totalItemsSold} harvest items packed in Pods
          </div>
        </div>

        {/* Metric 3: SLA Dispatch Speed */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Average Dispatch SLA</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800 font-['Outfit'] mt-2">
            7.8 mins
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>98.6% orders under 10m promise</span>
          </div>
        </div>

        {/* Metric 4: Dark Store SKUs */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Inventory SKUs</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-['Outfit'] mt-2 flex items-baseline gap-2">
            <span>{products.length}</span>
            {outOfStockCount > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {outOfStockCount} OOS
              </span>
            )}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Certified Organic & Farm-Direct
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hub Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Orders Queue ({orders.length})</span>
            {activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-stone-950 font-bold text-[10px] rounded-full">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "catalog"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Inventory SKUs ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "analytics"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>SLA Performance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admin Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "users" ? "bg-emerald-800 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Users ({users.length})</span>
          </button>
        </div>

        {/* Global Dark Store Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-stone-500 pr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Cold-Chain Sensors: 4°C Nominal</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          TAB 1: HUB OVERVIEW (Command Deck)
      ---------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Operations Snapshot Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-time Order Dispatch Status */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">
                    Active Pod Dispatches
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  No active orders in dark store queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 4).map((o) => (
                    <div
                      key={o.orderId}
                      className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 flex flex-wrap items-center justify-between gap-3 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-stone-900">
                            #{o.orderId}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                              o.orderStatus === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.orderStatus === "out_for_delivery"
                                ? "bg-indigo-100 text-indigo-800 animate-pulse"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {o.orderStatus.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-stone-700 mt-1">
                          {o.customerName} · {o.deliveryAddress.area}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {o.items.length} items ({o.items.map((i) => i.name).slice(0, 2).join(", ")}...) · ₹{o.totalAmount}
                        </div>
                        {!o.riderDetails && o.orderStatus !== "delivered" && o.orderStatus !== "cancelled" && (
                          <div className="text-[10px] font-black text-rose-700 uppercase tracking-wider mt-1">Action required: assign a rider</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => onUpdateOrderStatus(o.orderId, e.target.value)}
                          className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-emerald-600 cursor-pointer shadow-2xs"
                        >
                          <option value="placed">Placed (Received)</option>
                          <option value="assigned">Assigned to Rider</option>
                          <option value="accepted">Rider Accepted</option>
                          <option value="packed">Packed in Pod</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Dark Store Health & Inventory Alert */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">
                  Stock Health & Alerts
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-900">Cold Chain Storage</div>
                    <div className="text-[11px] text-emerald-700">Storage Pods 1-8 at 4.2°C</div>
                  </div>
                  <span className="text-xs font-black text-emerald-800">100% OK</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-800">Riders on Standby</div>
                    <div className="text-[11px] text-stone-500">Ather EV Fleet ready at Hub</div>
                  </div>
                  <span className="text-xs font-black text-stone-900">{onlineRidersCount} Online</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-800">Driver Access & Availability</div>
                  {riders.map((rider) => (
                    <div key={rider.riderId} className="flex items-center justify-between gap-2 border-t border-stone-100 pt-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-800 truncate">{rider.name}</div>
                        <div className="text-[10px] text-stone-500">{rider.phone} · {rider.isBlocked ? "Blocked" : rider.currentStatus === "offline" ? "Offline" : "Online"}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {rider.isApproved === false ? (
                          <button type="button" onClick={() => onApproveRider(rider.riderId)} className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-black text-[10px] cursor-pointer">Approve</button>
                        ) : (
                          <button type="button" onClick={() => onSetRiderBlocked(rider.riderId, !rider.isBlocked)} className={`px-2.5 py-1.5 rounded-lg font-black text-[10px] cursor-pointer ${rider.isBlocked ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {rider.isBlocked ? "Unblock" : "Block"}
                          </button>
                        )}
                        <button type="button" onClick={() => { if (confirm(`Delete rider profile for ${rider.name}?`)) onDeleteRider(rider.riderId); }} className="px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-rose-100 hover:text-rose-800 font-black text-[10px] cursor-pointer">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-amber-900">Low Stock SKUs</div>
                    <div className="text-[11px] text-amber-700">Fresh organic avocados & spinach</div>
                  </div>
                  <span className="text-xs font-black text-amber-800">3 Items</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Restock / Add Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: LIVE ORDERS MANAGEMENT
      ---------------------------------------------------- */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Order Filters */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-stone-500 uppercase tracking-wider text-[11px]">
                Filter Status:
              </span>
              {["all", "placed", "assigned", "accepted", "packed", "out_for_delivery", "delivered", "cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition cursor-pointer ${
                    orderStatusFilter === st
                      ? "bg-emerald-800 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {st.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            <div className="text-stone-400 text-xs">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Order ID & PIN</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Basket Items</th>
                    <th className="p-4">Amount & Mode</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4">Fast Transition</th>
                    <th className="p-4">Rider</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map((o) => (
                    <tr key={o.orderId} className="hover:bg-stone-50/70 transition">
                      <td className="p-4 font-mono font-black text-stone-900 whitespace-nowrap">
                        <div>#{o.orderId}</div>
                        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          Delivery PIN: {o.otp || "4829"}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-stone-900">{o.customerName}</div>
                        <div className="text-[11px] text-stone-500">{o.deliveryAddress.area}, {o.deliveryAddress.city}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{o.customerPhone}</div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-stone-800 truncate">
                          {o.items.length} items: {o.items.map((i) => i.name).join(", ")}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {o.items.reduce((s, it) => s + it.quantity, 0)} total units
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="font-black text-stone-900 text-sm">₹{o.totalAmount}</div>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">
                          {o.paymentMethod} · {o.paymentStatus}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            o.orderStatus === "delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : o.orderStatus === "out_for_delivery"
                              ? "bg-indigo-100 text-indigo-800"
                              : o.orderStatus === "packed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {o.orderStatus.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => onUpdateOrderStatus(o.orderId, e.target.value)}
                          className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 focus:outline-emerald-600 cursor-pointer shadow-2xs"
                        >
                          <option value="placed">Placed</option>
                          <option value="assigned">Assigned</option>
                          <option value="accepted">Rider Accepted</option>
                          <option value="packed">Packed in Pod</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <select
                          value={o.riderDetails?.riderId || ""}
                          onChange={(e) => e.target.value && onAssignOrderRider(o.orderId, e.target.value)}
                          className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 focus:outline-emerald-600 cursor-pointer shadow-2xs"
                        >
                          <option value="">Assign rider...</option>
                          {riders.filter((rider) => rider.isApproved !== false && !rider.isBlocked && rider.currentStatus !== "offline").map((rider) => (
                            <option key={rider.riderId} value={rider.riderId}>
                              {rider.name} · {rider.currentStatus}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForDetail(o)}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Invoice / Items
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: INVENTORY CATALOG MANAGEMENT
      ---------------------------------------------------- */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-1 min-w-60">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search SKU name, Telugu / Hindi name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-medium"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 focus:outline-emerald-600 cursor-pointer"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fresh Item</span>
            </button>
          </div>

          {/* Catalog Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Fresh SKU</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Unit Pricing</th>
                    <th className="p-4">Dark Store Stock</th>
                    <th className="p-4">Attributes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt=""
                            className="w-12 h-12 rounded-2xl object-cover border border-stone-200 shadow-2xs shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-stone-900 text-sm">{p.name}</div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-1">
                              {p.teluguName && <span className="font-semibold text-emerald-800">{p.teluguName}</span>}
                              {p.hindiName && <span>· {p.hindiName}</span>}
                              <span>({p.unit})</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-stone-600 capitalize">{p.category}</td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="font-black text-stone-900 text-sm">₹{p.price}</div>
                        {p.originalPrice > p.price && (
                          <div className="text-[10px] text-stone-400 line-through">
                            ₹{p.originalPrice} ({p.discountPercentage}% OFF)
                          </div>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProduct(p.id, {
                                inStock: !p.inStock,
                                stockCount: p.inStock ? 0 : 50,
                              })
                            }
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition cursor-pointer ${
                              p.inStock
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                            }`}
                          >
                            {p.inStock ? `In Stock (${p.stockCount || 50})` : "Out of Stock"}
                          </button>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.isOrganic && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              🌱 Organic
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                            ⚡ 10m Pod
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="p-2 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                            title="Edit product SKU"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${p.name} from the active inventory catalog?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 4: SLA & OPERATIONAL ANALYTICS
      ---------------------------------------------------- */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>10-Minute SLA Compliance Breakdown</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-stone-700 mb-1">
                    <span>Order Pick & Pod Packing (&lt; 2 mins)</span>
                    <span className="text-emerald-700">1.4 mins avg (99.2%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[99%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-stone-700 mb-1">
                    <span>Rider Handover (&lt; 1 min)</span>
                    <span className="text-emerald-700">45 secs avg (98.5%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[98%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-stone-700 mb-1">
                    <span>Ather EV Road Transit (&lt; 7 mins)</span>
                    <span className="text-emerald-700">5.8 mins avg (97.8%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[97%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Cold-Chain Freshness Audit</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Leaf Basket Indiranagar Dark Store #04 maintains 100% active farm traceability. All leafy greens, exotic mushrooms, and dairy are harvested daily at 4:00 AM and kept under active climate control.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="text-stone-400 font-bold text-[10px] uppercase">Daily Harvest Ratio</div>
                  <div className="text-lg font-black text-stone-900 mt-0.5">100% Direct</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="text-stone-400 font-bold text-[10px] uppercase">Waste / Shrinkage</div>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">&lt; 0.8%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="max-w-3xl space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6">
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-black font-['Outfit'] text-stone-900">Administrator Profile</h3>
                <p className="text-xs text-stone-500 mt-1">Manage the private owner account, hub location, and dashboard permissions.</p>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div>
                <div className="text-xs font-black text-emerald-950">{adminName || "Leafbasket Administrator"}</div>
                <div className="text-[11px] text-emerald-800 mt-0.5">{adminEmail} · {adminHubLocation}</div>
              </div>
              <button type="button" onClick={() => setIsEditingAdminProfile(true)} className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>

            {isEditingAdminProfile && (
              <form onSubmit={handleSaveAdminProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <label className="text-xs font-bold text-stone-700">Full name<input value={adminName} onChange={(e) => setAdminName(e.target.value)} required className="mt-1 w-full p-2.5 border border-stone-300 rounded-xl font-normal" /></label>
                <label className="text-xs font-bold text-stone-700">Email<input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required className="mt-1 w-full p-2.5 border border-stone-300 rounded-xl font-normal" /></label>
                <label className="text-xs font-bold text-stone-700">Bengaluru hub location<input value={adminHubLocation} onChange={(e) => setAdminHubLocation(e.target.value)} required className="mt-1 w-full p-2.5 border border-stone-300 rounded-xl font-normal" /></label>
                <label className="text-xs font-bold text-stone-700">Role permissions<select value={activeAdminRole} onChange={(e) => setActiveAdminRole(e.target.value)} className="mt-1 w-full p-2.5 border border-stone-300 rounded-xl font-normal"><option>Store Operations Director</option><option>Dispatch Lead</option><option>Catalog Curator</option></select></label>
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" disabled={isSavingAdminProfile} className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold disabled:opacity-60 cursor-pointer">{isSavingAdminProfile ? "Saving..." : "Save Profile"}</button>
                  <button type="button" onClick={() => setIsEditingAdminProfile(false)} className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold cursor-pointer">Cancel</button>
                </div>
                {adminProfileError && <div className="sm:col-span-2 text-xs text-rose-700 font-semibold">{adminProfileError}</div>}
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6">
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-black font-['Outfit'] text-stone-900">All Accounts</h3>
                <p className="text-xs text-stone-500 mt-1">Review customer, rider, and administrator account information.</p>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl">{users.length + riders.length + 1} total</span>
            </div>
            {users.length === 0 ? (
              <div className="py-12 text-center text-sm text-stone-400">No saved user profiles yet. Profiles appear after a user saves their account.</div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                    <tr><th className="p-3">User</th><th className="p-3">Contact</th><th className="p-3">Addresses</th><th className="p-3">Status</th><th className="p-3 text-right">Access</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-stone-50/70">
                        <td className="p-3"><div className="font-bold text-stone-900">{user.name}</div><div className="text-[10px] text-stone-400 font-mono">{user.id}</div></td>
                        <td className="p-3"><div className="text-stone-700">{user.phone}</div><div className="text-[10px] text-stone-400">{user.email || "No email"}</div></td>
                        <td className="p-3 text-stone-600">{user.savedAddresses?.length || 0} saved</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${user.isBlocked ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>{user.isBlocked ? "Blocked" : "Active"}</span></td>
                        <td className="p-3 text-right whitespace-nowrap"><button type="button" onClick={() => onSetUserBlocked(user.id, !user.isBlocked)} className={`px-2.5 py-1.5 rounded-lg font-black text-[10px] cursor-pointer ${user.isBlocked ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{user.isBlocked ? "Unblock" : "Block"}</button><button type="button" onClick={() => { if (confirm(`Delete user profile for ${user.name}?`)) onDeleteUser(user.id); }} className="ml-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-rose-100 hover:text-rose-800 font-black text-[10px] cursor-pointer">Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6">
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-black font-['Outfit'] text-stone-900">Rider Accounts</h3>
                <p className="text-xs text-stone-500 mt-1">Review delivery partners, approval, availability, and hub details.</p>
              </div>
              <span className="text-xs font-black text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl">{riders.length} riders</span>
            </div>
            {riders.length === 0 ? (
              <div className="py-10 text-center text-sm text-stone-400">No rider accounts registered yet.</div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                    <tr><th className="p-3">Rider</th><th className="p-3">Contact</th><th className="p-3">Vehicle / Hub</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {riders.map((rider) => (
                      <tr key={rider.riderId} className="hover:bg-stone-50/70">
                        <td className="p-3"><div className="font-bold text-stone-900">{rider.name}</div><div className="text-[10px] text-stone-400 font-mono">{rider.riderId}</div></td>
                        <td className="p-3 text-stone-700">{rider.phone}</td>
                        <td className="p-3"><div className="text-stone-700">{rider.vehicleNumber}</div><div className="text-[10px] text-stone-400">{rider.hub || "Hub not set"}</div></td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${rider.isBlocked ? "bg-rose-100 text-rose-800" : rider.isApproved === false ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{rider.isBlocked ? "Blocked" : rider.isApproved === false ? "Pending" : rider.currentStatus}</span></td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {rider.isApproved === false && <button type="button" onClick={() => onApproveRider(rider.riderId)} className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px] cursor-pointer">Approve</button>}
                          <button type="button" onClick={() => onSetRiderBlocked(rider.riderId, !rider.isBlocked)} className="ml-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-black text-[10px] cursor-pointer">{rider.isBlocked ? "Unblock" : "Block"}</button>
                          <button type="button" onClick={() => { if (confirm(`Delete rider account for ${rider.name}?`)) onDeleteRider(rider.riderId); }} className="ml-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-rose-100 hover:text-rose-800 font-black text-[10px] cursor-pointer">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6">
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-black font-['Outfit'] text-stone-900">Administrator Account</h3>
                <p className="text-xs text-stone-500 mt-1">Current administrator identity and assigned company hub.</p>
              </div>
              <span className="text-xs font-black text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl">Admin</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div><div className="text-stone-400 font-bold uppercase">Name</div><div className="font-bold text-stone-900 mt-1">{adminName}</div></div>
              <div><div className="text-stone-400 font-bold uppercase">Email</div><div className="font-bold text-stone-900 mt-1 break-all">{adminEmail}</div></div>
              <div><div className="text-stone-400 font-bold uppercase">Role</div><div className="font-bold text-stone-900 mt-1">{activeAdminRole}</div></div>
              <div><div className="text-stone-400 font-bold uppercase">Company Hub</div><div className="font-bold text-stone-900 mt-1">{adminHubLocation}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black font-['Outfit'] text-stone-900 mb-4">
              Add New Fresh Item to Dark Store
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Item Title (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Baby Spinach"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Telugu Name (తెలుగు)</label>
                  <input
                    type="text"
                    placeholder="ఉదా: తాజా పాలకూర"
                    value={newProdTeluguName}
                    onChange={(e) => setNewProdTeluguName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Hindi Name (हिंदी)</label>
                  <input
                    type="text"
                    placeholder="उदा: ताज़ा पालक"
                    value={newProdHindiName}
                    onChange={(e) => setNewProdHindiName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Unit Weight/Pack</label>
                  <input
                    type="text"
                    required
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="e.g. 500 g or 1 kg"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={newProdOriginalPrice}
                    onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={newProdStockCount}
                    onChange={(e) => setNewProdStockCount(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Harvest / Item Description</label>
                <textarea
                  rows={2}
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="organic-check"
                  checked={newProdIsOrganic}
                  onChange={(e) => setNewProdIsOrganic(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="organic-check" className="font-bold text-stone-700 cursor-pointer">
                  Certified Organic Farm Sourced (Zero pesticide certified)
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-wider py-2.5 rounded-xl shadow-md cursor-pointer transition"
                >
                  Save & Publish SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black font-['Outfit'] text-stone-900 mb-4">
              Edit Product: {editingProduct.name}
            </h3>

            <form onSubmit={handleSaveEditedProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Telugu Name (తెలుగు)</label>
                  <input
                    type="text"
                    value={editingProduct.teluguName || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, teluguName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Hindi Name (हिंदी)</label>
                  <input
                    type="text"
                    value={editingProduct.hindiName || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, hindiName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stockCount || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Unit Weight/Pack</label>
                <input
                  type="text"
                  required
                  value={editingProduct.unit}
                  onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-wider py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setSelectedOrderForDetail(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                Order #{selectedOrderForDetail.orderId}
              </span>
              <h3 className="text-lg font-black font-['Outfit'] text-stone-900 mt-1">
                {selectedOrderForDetail.customerName}
              </h3>
              <p className="text-xs text-stone-500">
                {selectedOrderForDetail.deliveryAddress.street}, {selectedOrderForDetail.deliveryAddress.area}, {selectedOrderForDetail.deliveryAddress.city}
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 mb-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Delivery PIN:</span>
                <span className="font-mono font-black text-emerald-700">
                  {selectedOrderForDetail.otp || "4829"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment:</span>
                <span className="font-bold text-stone-900 uppercase">
                  {selectedOrderForDetail.paymentMethod} ({selectedOrderForDetail.paymentStatus})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Amount:</span>
                <span className="font-black text-stone-900">₹{selectedOrderForDetail.totalAmount}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Packed Items ({selectedOrderForDetail.items.length})
              </div>
              {selectedOrderForDetail.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-stone-50 text-xs">
                  <div className="flex items-center gap-2">
                    <img src={it.image} alt="" className="w-8 h-8 rounded-lg object-cover border" />
                    <div>
                      <div className="font-bold text-stone-900">{it.name}</div>
                      <div className="text-[10px] text-stone-500">{it.unit} x {it.quantity}</div>
                    </div>
                  </div>
                  <div className="font-black text-stone-900">₹{it.price * it.quantity}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedOrderForDetail(null)}
              className="w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
