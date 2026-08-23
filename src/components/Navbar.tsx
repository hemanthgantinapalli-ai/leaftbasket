import React, { useState } from "react";
import {
  ShoppingBag,
  Search,
  MapPin,
  Clock,
  Sparkles,
  Bike,
  ChevronDown,
  X,
  User,
  Info,
  Home,
  LogOut,
  CheckCircle2,
  RotateCcw,
  PackageCheck,
  LayoutDashboard,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { ViewTab, CartItem, Product, AppNotification } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "./UserProfileModal";
import { LeafBasketLogo } from "./LeafBasketLogo";
import { NotificationCenter } from "./NotificationCenter";

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenLocationPicker: () => void;
  onOpenAbout: () => void;
  onOpenAuth: (mode?: "login" | "register") => void;
  onOpenProfile?: (tab?: "orders" | "profile" | "addresses") => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  selectedAddress: string;
  onOpenAIChef: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
  activeOrderCount: number;
  notifications?: AppNotification[];
  onMarkAllNotificationsRead?: () => void;
  onClearNotifications?: () => void;
  onSelectNotification?: (notification: AppNotification) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  cartItems,
  onOpenCart,
  onOpenLocationPicker,
  onOpenAbout,
  onOpenAuth,
  onOpenProfile,
  currentUser,
  onLogout,
  selectedAddress,
  onOpenAIChef,
  searchQuery,
  onSearchChange,
  products,
  onSelectProduct,
  activeOrderCount,
  notifications = [],
  onMarkAllNotificationsRead = () => {},
  onClearNotifications = () => {},
  onSelectNotification = (_notification: AppNotification) => {},
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const filteredSearchSuggestions = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.hindiName && p.hindiName.includes(searchQuery)) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner - Freshness & Flash Coupons (Privacy: No DB visibility) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs py-1.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="inline-flex items-center justify-center bg-amber-400 text-emerald-950 font-black px-1.5 py-0.5 rounded-sm text-[10px] tracking-wider uppercase">
              ⚡ 10 MINS
            </span>
            <span className="hidden sm:inline">Farm-fresh harvest sourced at 4 AM every morning.</span>
            <span className="sm:hidden">10-Min Fast Dispatch</span>
            <span className="text-emerald-300">|</span>
            <span className="text-emerald-100 font-normal">
              Use code <strong className="text-amber-300 font-bold">SUPERFAST</strong> for ₹30 Instant OFF
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAIChef}
              className="flex items-center gap-1 text-emerald-100 hover:text-white font-medium transition-colors cursor-pointer text-[11px] bg-emerald-950/40 hover:bg-emerald-950/60 px-2 py-0.5 rounded-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Smart Chef</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-5">
          
          {/* 1. Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onTabChange("shop")}
              className="flex items-center gap-2 text-left group cursor-pointer focus:outline-hidden"
              id="navbar-brand-logo"
            >
              <LeafBasketLogo variant="horizontal" size="md" showTagline={true} />
            </button>

            {/* 2. Location Selector */}
            <button
              onClick={onOpenLocationPicker}
              id="navbar-location-button"
              className="hidden lg:flex items-center gap-2 py-1.5 px-3 rounded-xl bg-stone-100/90 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 text-left transition cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-emerald-700 transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
                  <span>Deliver to:</span>
                  <span className="text-emerald-700 font-extrabold">10 Mins</span>
                  <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-emerald-700" />
                </div>
                <div className="text-xs text-stone-600 max-w-[170px] truncate font-medium">
                  {selectedAddress}
                </div>
              </div>
            </button>
          </div>

          {/* 3. Search Bar */}
          <div className="order-3 w-full max-w-none md:order-none md:flex-1 md:max-w-lg relative min-w-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search 'milk', 'farm tomatoes', 'avocado', 'sourdough'..."
                className="w-full pl-10 pr-9 py-2 bg-stone-100/90 hover:bg-stone-100 focus:bg-white border border-stone-200 focus:border-emerald-500 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Drawer */}
            <AnimatePresence>
              {isSearchFocused && filteredSearchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 p-2"
                >
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 py-1.5">
                    Matching Farm Fresh Items
                  </div>
                  <div className="divide-y divide-stone-100">
                    {filteredSearchSuggestions.map((prod) => (
                      <button
                        key={prod.id}
                        onMouseDown={() => {
                          onSelectProduct(prod);
                          onSearchChange("");
                        }}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-stone-50 rounded-xl transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                          />
                          <div>
                            <div className="text-sm font-semibold text-stone-900">{prod.name}</div>
                            <div className="text-xs text-stone-500">
                              {prod.unit} · {prod.deliveryTimeMinutes || 10} mins
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-700">₹{prod.price}</div>
                          {prod.originalPrice > prod.price && (
                            <div className="text-[11px] text-stone-400 line-through">₹{prod.originalPrice}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Navigation Links: Home, About, Live Tracking, Login/Register, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto">
            {/* Home Link */}
            <button
              onClick={() => onTabChange("shop")}
              id="navbar-home-link"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentTab === "shop"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            {/* About Link */}
            <button
              onClick={onOpenAbout}
              id="navbar-about-link"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
            >
              <Info className="w-4 h-4 text-emerald-700" />
              <span>About</span>
            </button>

            {/* Live Order Link (Visible when active order exists or on click) */}
            <button
              onClick={() => onTabChange("tracking")}
              id="navbar-live-tracking-link"
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentTab === "tracking"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Bike className="w-4 h-4 text-emerald-700" />
              <span>Track Order</span>
              {activeOrderCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>

            {/* Login / Register or Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  id="navbar-user-profile-button"
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs hover:bg-emerald-100 transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate hidden md:inline">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 text-xs">
                    <div
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfile?.("profile");
                      }}
                      className="p-2 border-b border-stone-100 mb-1 hover:bg-stone-50 rounded-xl cursor-pointer transition"
                    >
                      <div className="font-bold text-stone-900 flex items-center justify-between">
                        <span>{currentUser.name}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Club</span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">{currentUser.phone}</div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfile?.("orders");
                      }}
                      id="navbar-dropdown-past-orders"
                      className="w-full text-left p-2 hover:bg-emerald-50 text-emerald-950 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-700" />
                      <span>Past Orders & Reorder</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfile?.("profile");
                      }}
                      className="w-full text-left p-2 hover:bg-stone-50 text-stone-700 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      <span>Profile & Addresses</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onTabChange("tracking");
                      }}
                      className="w-full text-left p-2 hover:bg-stone-50 text-stone-700 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition"
                    >
                      <Bike className="w-4 h-4 text-emerald-700" />
                      <span>Live Order Status</span>
                    </button>

                    <div className="my-1 border-t border-stone-100" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left p-2 hover:bg-rose-50 text-rose-700 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenAuth("login")}
                  id="navbar-login-button"
                  className="px-3 py-2 rounded-xl text-xs font-bold text-stone-700 hover:text-emerald-800 hover:bg-stone-100 transition cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => onOpenAuth("register")}
                  id="navbar-register-button"
                  className="hidden sm:block px-3 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition cursor-pointer shadow-2xs"
                >
                  Register
                </button>
              </div>
            )}

            {/* Notification Bell Center */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
                id="navbar-notifications-bell-button"
                className="relative p-2 rounded-xl text-stone-700 hover:text-emerald-800 hover:bg-stone-100 transition cursor-pointer"
                title="Order updates & notifications"
                aria-label="Order updates & notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-600 text-white font-black text-[9px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                  </span>
                )}
              </button>

              <NotificationCenter
                isOpen={isNotificationCenterOpen}
                onClose={() => setIsNotificationCenterOpen(false)}
                notifications={notifications}
                onMarkAllAsRead={onMarkAllNotificationsRead}
                onClearAll={onClearNotifications}
                onSelectNotification={(notif) => {
                  setIsNotificationCenterOpen(false);
                  onSelectNotification(notif);
                }}
              />
            </div>

            {/* Shopping Cart Pill Button */}
            <button
              onClick={onOpenCart}
              id="header-cart-button"
              className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-3.5 py-2 rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-emerald-950 font-black text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-emerald-800">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="text-[11px] font-black">
                  {totalCartCount === 0 ? "Cart" : `₹${totalCartAmount}`}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navbar: Location & Quick Links */}
        <div className="flex lg:hidden flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-stone-100 text-xs">
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center gap-1.5 text-stone-700 font-medium text-[11px] truncate max-w-[200px]"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{selectedAddress}</span>
            <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
          </button>

          <div className="flex items-center gap-2 font-bold text-[11px]">
            <button
              onClick={() => onTabChange("shop")}
              className={`px-2 py-1 rounded-lg ${currentTab === "shop" ? "bg-emerald-100 text-emerald-900" : "text-stone-600"}`}
            >
              Home
            </button>
            <button onClick={onOpenAbout} className="text-stone-600 px-2 py-1 rounded-lg hover:bg-stone-100">
              About
            </button>
            <button
              onClick={() => onTabChange("tracking")}
              className={`px-2 py-1 rounded-lg ${currentTab === "tracking" ? "bg-emerald-100 text-emerald-900" : "text-stone-600"}`}
            >
              Track
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
