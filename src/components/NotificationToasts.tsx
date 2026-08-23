import React, { useEffect, useState } from "react";
import {
  Bike,
  CheckCircle2,
  Package,
  PackageCheck,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppNotification } from "../types";

interface NotificationToastsProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export const NotificationToasts: React.FC<NotificationToastsProps> = ({
  notifications,
  onDismiss,
  onSelectNotification,
}) => {
  // Show up to 3 most recent notifications as toasts
  const activeToasts = notifications.slice(0, 3);

  return (
    <aside aria-label="Notifications" className="fixed top-20 right-3 sm:right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-24px)] pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            onSelect={onSelectNotification}
          />
        ))}
      </AnimatePresence>
    </aside>
  );
};

interface ToastItemProps {
  toast: AppNotification;
  onDismiss: (id: string) => void;
  onSelect: (toast: AppNotification) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, onSelect }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const duration = 7000; // 7 seconds auto-dismiss

  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update every 50ms
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, toast.id, onDismiss]);

  const getStatusConfig = () => {
    switch (toast.status) {
      case "placed":
        return {
          icon: <Package className="w-5 h-5 text-emerald-600" />,
          bgColor: "bg-emerald-50/95",
          borderColor: "border-emerald-200",
          badgeBg: "bg-emerald-100 text-emerald-800",
          progressColor: "bg-emerald-500",
          titleColor: "text-emerald-950",
          badgeText: "Order Placed",
        };
      case "packed":
        return {
          icon: <PackageCheck className="w-5 h-5 text-indigo-600" />,
          bgColor: "bg-indigo-50/95",
          borderColor: "border-indigo-200",
          badgeBg: "bg-indigo-100 text-indigo-800",
          progressColor: "bg-indigo-500",
          titleColor: "text-indigo-950",
          badgeText: "Packed & Sealed",
        };
      case "out_for_delivery":
        return {
          icon: <Bike className="w-5 h-5 text-amber-600 animate-bounce" />,
          bgColor: "bg-amber-50/95",
          borderColor: "border-amber-300",
          badgeBg: "bg-amber-100 text-amber-900 border border-amber-300",
          progressColor: "bg-amber-500",
          titleColor: "text-amber-950",
          badgeText: "Out For Delivery 🛵",
        };
      case "delivered":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          bgColor: "bg-emerald-50/95",
          borderColor: "border-emerald-300",
          badgeBg: "bg-emerald-600 text-white shadow-xs",
          progressColor: "bg-emerald-600",
          titleColor: "text-emerald-950",
          badgeText: "Delivered 🎉",
        };
      case "cancelled":
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
          bgColor: "bg-rose-50/95",
          borderColor: "border-rose-200",
          badgeBg: "bg-rose-100 text-rose-800",
          progressColor: "bg-rose-500",
          titleColor: "text-rose-950",
          badgeText: "Order Cancelled",
        };
      default:
        return {
          icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
          bgColor: "bg-stone-50/95",
          borderColor: "border-stone-200",
          badgeBg: "bg-stone-200 text-stone-800",
          progressColor: "bg-emerald-500",
          titleColor: "text-stone-900",
          badgeText: "Update",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.92, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 40, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onSelect(toast)}
      className={`pointer-events-auto w-full bg-white/95 backdrop-blur-md border ${config.borderColor} shadow-xl rounded-2xl p-3.5 sm:p-4 relative overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow group`}
    >
      {/* Top Progress countdown line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-stone-100 overflow-hidden">
        <div
          className={`h-full ${config.progressColor} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={`p-2.5 rounded-xl ${config.bgColor} border ${config.borderColor} shrink-0 mt-0.5 shadow-2xs`}>
          {config.icon}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badgeBg}`}>
              {config.badgeText}
            </span>
            {toast.orderId && (
              <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                #{toast.orderId}
              </span>
            )}
            {toast.etaMinutes !== undefined && toast.status === "out_for_delivery" && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                <span>{toast.etaMinutes}m ETA</span>
              </span>
            )}
          </div>

          <h4 className={`text-xs sm:text-sm font-bold ${config.titleColor} leading-snug line-clamp-1`}>
            {toast.title}
          </h4>

          <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
            {toast.message}
          </p>

          {/* Action Row */}
          <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-stone-100">
            <span className="text-[10px] text-stone-400 font-medium">
              {toast.timestamp}
            </span>

            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>Track Live</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Close / Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
