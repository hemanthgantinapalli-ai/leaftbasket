import React, { useState } from "react";
import {
  Bike,
  Package,
  PackageCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  MapPin,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Order } from "../types";

interface OrderStatusOverlayBadgeProps {
  activeOrder: Order | null;
  onOpenTracking: (orderId: string) => void;
}

export const OrderStatusOverlayBadge: React.FC<OrderStatusOverlayBadgeProps> = ({
  activeOrder,
  onOpenTracking,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // If no active order, or order is completed/delivered or cancelled, or user dismissed it
  if (!activeOrder || isDismissed || activeOrder.orderStatus === "delivered" || activeOrder.orderStatus === "cancelled") {
    return null;
  }

  const getStatusDisplay = () => {
    switch (activeOrder.orderStatus) {
      case "placed":
        return {
          icon: <Package className="w-4 h-4 text-emerald-600 animate-pulse" />,
          title: "Order Placed",
          subtitle: "Received at Store #04",
          eta: `${activeOrder.etaMinutes || 10}m`,
          bgGlow: "bg-emerald-500/10",
          badgeBorder: "border-emerald-300",
          accentColor: "text-emerald-700",
          step: 1,
        };
      case "packed":
        return {
          icon: <PackageCheck className="w-4 h-4 text-indigo-600 animate-pulse" />,
          title: "Packing Order",
          subtitle: "Ice packs sealed & tagged",
          eta: `${activeOrder.etaMinutes || 8}m`,
          bgGlow: "bg-indigo-500/10",
          badgeBorder: "border-indigo-300",
          accentColor: "text-indigo-700",
          step: 2,
        };
      case "out_for_delivery":
        return {
          icon: <Bike className="w-4 h-4 text-amber-600 animate-bounce" />,
          title: "Out for Delivery",
          subtitle: activeOrder.riderDetails?.name
            ? `${activeOrder.riderDetails.name} is on the way`
            : "Rider dispatched on Ather EV",
          eta: `${activeOrder.etaMinutes || 4}m`,
          bgGlow: "bg-amber-500/15",
          badgeBorder: "border-amber-400",
          accentColor: "text-amber-700",
          step: 3,
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
          title: "In Progress",
          subtitle: "Processing fast dispatch",
          eta: "10m",
          bgGlow: "bg-emerald-500/10",
          badgeBorder: "border-emerald-300",
          accentColor: "text-emerald-700",
          step: 1,
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.9 }}
        id="live-order-overlay-badge"
        className="fixed bottom-5 left-4 sm:left-6 z-40 max-w-sm w-[calc(100vw-32px)] sm:w-auto"
      >
        <div className="relative bg-white/95 backdrop-blur-md border-2 border-stone-800 shadow-2xl rounded-2xl p-3 sm:p-3.5 pr-8 flex items-center gap-3 transition hover:shadow-emerald-950/20">
          
          {/* Animated Icon Circle */}
          <div
            onClick={() => onOpenTracking(activeOrder.orderId)}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
          >
            {status.icon}
          </div>

          {/* Details */}
          <div
            onClick={() => onOpenTracking(activeOrder.orderId)}
            className="flex-1 min-w-0 cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 font-mono">
                Live Order #{activeOrder.orderId}
              </span>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {status.eta}
              </span>
            </div>

            <div className="flex items-center justify-between mt-0.5">
              <div>
                <h4 className="text-xs font-black text-stone-900 leading-tight flex items-center gap-1">
                  <span>{status.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-[10px] text-stone-500 truncate max-w-[170px] sm:max-w-[200px]">
                  {status.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Track Live button */}
          <button
            type="button"
            onClick={() => onOpenTracking(activeOrder.orderId)}
            className="hidden sm:flex px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-bold items-center gap-1 shadow-sm transition cursor-pointer shrink-0"
          >
            <span>Track</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Dismiss small X */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100 transition cursor-pointer"
            title="Hide badge for this session"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
