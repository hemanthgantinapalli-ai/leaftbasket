import React from "react";
import { X, ShieldCheck, Clock, Leaf, Bike, Award, Heart, CheckCircle2, Truck, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LeafBasketLogo } from "./LeafBasketLogo";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center p-1 shadow-lg">
                  <LeafBasketLogo variant="icon" size="sm" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold font-['Outfit']">About Leaf Basket</h3>
                  <p className="text-xs text-emerald-200">Fresh. Local. Delivered. (10-Minute Farm Delivery)</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Mission Statement */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80">
              <h4 className="text-sm font-extrabold text-emerald-950 mb-1 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-700" />
                <span>Our Farm-to-Fork Promise</span>
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Leafbasket bridges local agricultural farms directly to urban households in under 10 minutes. Sourced every morning at 4:00 AM from verified certified organic farms across Karnataka and Andhra Pradesh / Telangana, ensuring zero cold-storage spoilage and maximum nutritional value.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <h5 className="font-extrabold text-xs text-stone-900 mb-1">10-Min Dispatch</h5>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Micro-fulfillment Dark Stores positioned within 2km radiuses for instant dispatch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h5 className="font-extrabold text-xs text-stone-900 mb-1">Cold Pod Packing</h5>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Temperature-controlled 4°C chilled insulated bags with food-safe non-toxic ice gel packs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-2">
                  <Bike className="w-4 h-4" />
                </div>
                <h5 className="font-extrabold text-xs text-stone-900 mb-1">100% Electric EV</h5>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Zero emissions with our custom fleet of Ather and Ola electric scooters.
                </p>
              </div>
            </div>

            {/* Quality Standards */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Why Thousands Trust Leafbasket Every Morning
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-stone-800 font-medium">FSSAI Certified Quality Check #48921</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-stone-800 font-medium">Telugu & English Bilingual Product Search</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-stone-800 font-medium">Zero Synthetic Preservatives on Produce</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-stone-800 font-medium">Fair-trade remuneration for local farmers</span>
                </div>
              </div>
            </div>

            {/* Contact & Support info */}
            <div className="p-4 bg-stone-100 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-stone-900">Need help with an order?</div>
                <div className="text-stone-500 text-[11px]">24x7 Customer Support at support@leafbasket.in</div>
              </div>
              <button
                onClick={onClose}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer text-xs"
              >
                Back to Shopping
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
