import React from "react";
import { CartItem } from "../types";
import { ShoppingBag, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MobileCartBarProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
  isOpen: boolean;
}

export const MobileCartBar: React.FC<MobileCartBarProps> = ({
  cartItems,
  onOpenCart,
  isOpen,
}) => {
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // If cart is empty or cart drawer is currently open, don't show the floating bar
  if (totalCount === 0 || isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        id="mobile-floating-cart-bar"
        className="lg:hidden fixed bottom-[68px] left-3 right-3 z-30 pointer-events-auto"
      >
        <button
          type="button"
          onClick={onOpenCart}
          className="w-full bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-600 text-white p-3 rounded-2xl shadow-xl shadow-emerald-950/30 border border-emerald-500/40 flex items-center justify-between transition-transform active:scale-[0.98] cursor-pointer"
        >
          {/* Left summary */}
          <div className="flex items-center gap-2.5 text-left min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center relative shrink-0">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-xs font-black tracking-wide text-white">
                  {totalCount} {totalCount === 1 ? "ITEM" : "ITEMS"}
                </span>
                <span className="text-emerald-300 text-xs">•</span>
                <span className="text-sm font-black text-amber-300">
                  ₹{totalAmount}
                </span>
              </div>
              <div className="text-[10px] text-emerald-200 font-medium flex items-center gap-1 truncate">
                <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                <span>10-Min Indiranagar Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right action */}
          <div className="flex items-center gap-1.5 bg-white text-emerald-950 px-3.5 py-1.5 rounded-xl font-black text-xs shadow-xs shrink-0">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
