import React, { useRef, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Bike,
  Package,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppNotification } from "../types";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "placed":
        return <Package className="w-4 h-4 text-emerald-600" />;
      case "packed":
        return <PackageCheck className="w-4 h-4 text-indigo-600" />;
      case "out_for_delivery":
        return <Bike className="w-4 h-4 text-amber-600 animate-bounce" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 text-stone-900"
      >
        {/* Header */}
        <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-800">
              Live Order Alerts
            </span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer"
                title="Clear alerts"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
          {notifications.length === 0 ? (
            <div className="py-8 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-stone-700">No Notifications Yet</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Real-time alerts will pop up when your 10-minute order status updates!
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectNotification(item);
                  onClose();
                }}
                className={`p-3 sm:p-3.5 hover:bg-stone-50 transition cursor-pointer flex items-start gap-3 relative ${
                  !item.read ? "bg-emerald-50/40" : ""
                }`}
              >
                {/* Unread indicator dot */}
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 absolute top-3.5 left-1.5" />
                )}

                <div className="p-2 rounded-xl bg-white border border-stone-200 shadow-2xs shrink-0 mt-0.5">
                  {getStatusIcon(item.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h5 className="text-xs font-bold text-stone-900 truncate">
                      {item.title}
                    </h5>
                    <span className="text-[10px] text-stone-400 whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">
                    {item.orderId && (
                      <span className="text-[9px] font-mono font-bold text-stone-500 bg-stone-100 px-1 py-0.2 rounded">
                        #{item.orderId}
                      </span>
                    )}
                    {item.etaMinutes !== undefined && item.status === "out_for_delivery" && (
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {item.etaMinutes}m ETA
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-emerald-700 ml-auto flex items-center gap-0.5">
                      <span>View</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 bg-stone-50 border-t border-stone-200 text-center">
          <span className="text-[10px] text-stone-500">
            Automated instant 10-minute dispatch alerts
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
