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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
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
          className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden z-10 max-h-[92vh] sm:max-h-[85vh] flex flex-col my-0 sm:my-4"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

          {/* Header */}
          <div className="p-4 sm:p-6 bg-linear-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white relative overflow-hidden shrink-0">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center p-1 shadow-lg shrink-0">
                  <LeafBasketLogo variant="icon" size="sm" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-extrabold font-['Outfit']">About Leaf Basket</h3>
                  <p className="text-[11px] sm:text-xs text-emerald-200">Fresh. Local. Delivered. (10-Minute Farm Delivery)</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto pb-safe">
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
