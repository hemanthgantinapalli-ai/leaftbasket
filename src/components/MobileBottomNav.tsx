import React from "react";
import { ViewTab } from "../types";
import { Home, Grid3X3, Bike, Sparkles, User, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { UserProfile } from "./UserProfileModal";

interface MobileBottomNavProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenAIChef: () => void;
  onOpenProfile: (tab?: "orders" | "profile" | "addresses") => void;
  onOpenAuth: (mode?: "login" | "register") => void;
  currentUser: UserProfile | null;
  activeOrderCount: number;
  onScrollToCategories?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenAIChef,
  onOpenProfile,
  onOpenAuth,
  currentUser,
  activeOrderCount,
  onScrollToCategories,
}) => {
  return (
    <nav
      id="mobile-bottom-navigation-bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/97 backdrop-blur-lg border-t border-stone-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1 pt-2 pb-safe flex items-center justify-around"
      aria-label="Mobile Navigation"
    >
      {/* 1. Home / Shop */}
      <button
        onClick={() => {
          onTabChange("shop");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        id="mobile-nav-home-btn"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
          currentTab === "shop" ? "text-emerald-800 font-extrabold" : "text-stone-500 font-medium hover:text-stone-800"
        }`}
      >
        <div className="relative">
          <Home className={`w-5 h-5 ${currentTab === "shop" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          {currentTab === "shop" && (
            <motion.div
              layoutId="mobile-nav-indicator"
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-emerald-700 rounded-full"
            />
          )}
        </div>
        <span className="text-[10px] mt-1 tracking-tight">Shop</span>
      </button>

      {/* 2. Categories / Aisles */}
      <button
        onClick={() => {
          if (currentTab !== "shop") {
            onTabChange("shop");
          }
          if (onScrollToCategories) {
            onScrollToCategories();
          } else {
            const catElem = document.getElementById("categories-section-anchor");
            if (catElem) {
              catElem.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        }}
        id="mobile-nav-categories-btn"
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer text-stone-500 font-medium hover:text-stone-800"
      >
        <Grid3X3 className="w-5 h-5 stroke-[1.75]" />
        <span className="text-[10px] mt-1 tracking-tight">Aisles</span>
      </button>

      {/* 3. Live Tracking */}
      <button
        onClick={() => onTabChange("tracking")}
        id="mobile-nav-tracking-btn"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
          currentTab === "tracking" ? "text-emerald-800 font-extrabold" : "text-stone-500 font-medium hover:text-stone-800"
        }`}
      >
        <div className="relative">
          <Bike className={`w-5 h-5 ${currentTab === "tracking" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          {activeOrderCount > 0 && (
            <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
          )}
          {currentTab === "tracking" && (
            <motion.div
              layoutId="mobile-nav-indicator"
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-emerald-700 rounded-full"
            />
          )}
        </div>
        <span className="text-[10px] mt-1 tracking-tight">
          {activeOrderCount > 0 ? "Track Live" : "Tracking"}
        </span>
      </button>

      {/* 4. AI Smart Chef */}
      <button
        onClick={onOpenAIChef}
        id="mobile-nav-ai-chef-btn"
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer text-stone-500 font-medium hover:text-stone-800 group"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-[10px] mt-1 tracking-tight text-amber-900 font-bold">AI Chef</span>
      </button>

      {/* 5. Account / Profile */}
      <button
        onClick={() => {
          if (currentUser) {
            onOpenProfile("orders");
          } else {
            onOpenAuth("login");
          }
        }}
        id="mobile-nav-profile-btn"
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer text-stone-500 font-medium hover:text-stone-800"
      >
        <div className="relative">
          {currentUser ? (
            <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <User className="w-5 h-5 stroke-[1.75]" />
          )}
        </div>
        <span className="text-[10px] mt-1 tracking-tight truncate max-w-[50px]">
          {currentUser ? "Orders" : "Account"}
        </span>
      </button>
    </nav>
  );
};
