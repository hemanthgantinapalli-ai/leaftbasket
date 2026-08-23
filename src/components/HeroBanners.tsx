import React, { useState } from "react";
import { Zap, Clock, ShieldCheck, Tag, Copy, Check, Sparkles, ArrowRight, Flame } from "lucide-react";
import { motion } from "motion/react";

interface HeroBannersProps {
  onApplyCoupon: (code: string) => void;
  onOpenAIChef: () => void;
}

export const HeroBanners: React.FC<HeroBannersProps> = ({ onApplyCoupon, onOpenAIChef }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopiedCode(code);
    onApplyCoupon(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Primary Spotlight Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Main Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20 flex flex-col justify-between"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-10 top-6 text-8xl opacity-15 select-none pointer-events-none">
            🥬
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
              <span>10-Minute Hyperlocal Delivery</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-white max-w-xl leading-tight">
              Farm-Fresh Groceries & Daily Essentials Delivered in <span className="text-amber-300 underline decoration-amber-400/60 decoration-wavy">10 Minutes</span>.
            </h1>

            <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-lg font-normal">
              Directly harvested at 4 AM from local organic farms. Chilled transport with smart temperature pods.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 text-xs font-medium text-emerald-200">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Under 10 Mins Avg.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Pesticides Tested</span>
              </div>
            </div>

            <button
              onClick={onOpenAIChef}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>Ask AI Smart Chef</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Promo Coupons Quick Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-6 shadow-lg shadow-orange-500/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Exclusive Deals</span>
              </div>
              <span className="text-xs font-semibold bg-emerald-950/20 px-2 py-0.5 rounded">Indiranagar Hub</span>
            </div>

            <h3 className="text-xl font-extrabold font-['Outfit'] mt-2">Flat ₹100 Off</h3>
            <p className="text-orange-100 text-xs mt-1">
              On your first fresh cart order above ₹399. Auto-applied at checkout.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="bg-white/95 text-stone-900 rounded-2xl p-3 flex items-center justify-between border border-white shadow-inner">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="font-mono font-extrabold text-sm tracking-wider text-emerald-900">
                    SUPERFAST
                  </div>
                  <div className="text-[10px] text-stone-500">₹30 OFF on min ₹149 cart</div>
                </div>
              </div>
              <button
                onClick={() => handleCopy("SUPERFAST")}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                {copiedCode === "SUPERFAST" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>Applied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Apply</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white/90 text-stone-900 rounded-2xl p-2.5 flex items-center justify-between border border-white/60">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="font-mono font-bold text-xs tracking-wider text-stone-800">
                    LEAF100
                  </div>
                  <div className="text-[10px] text-stone-500">₹100 OFF on ₹399+</div>
                </div>
              </div>
              <button
                onClick={() => handleCopy("LEAF100")}
                className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {copiedCode === "LEAF100" ? "Applied" : "Apply"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
