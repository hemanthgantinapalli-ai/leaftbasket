import React from "react";
import { Sparkles, Clock, Zap, MapPin, Tag, Truck, ShieldCheck, Flame, Gift } from "lucide-react";

interface ScrollingAdBannerProps {
  onApplyCoupon?: (code: string) => void;
  onOpenLocationPicker?: () => void;
}

export const ScrollingAdBanner: React.FC<ScrollingAdBannerProps> = ({
  onApplyCoupon,
  onOpenLocationPicker,
}) => {
  const hydHighlights = [
    {
      icon: "⚡",
      tag: "10-MIN FAST",
      title: "Hyderabad Dark Stores Live!",
      desc: "Hitec City · Gachibowli · Jubilee Hills · Madhapur",
      badgeBg: "bg-amber-400 text-emerald-950",
    },
    {
      icon: "🌱",
      tag: "4 AM HARVEST",
      title: "100% Organic Farm Direct",
      desc: "Zero pesticides · Triple ozonated sanitised",
      badgeBg: "bg-emerald-500 text-white",
    },
    {
      icon: "🎟️",
      tag: "FLAT ₹50 OFF",
      title: "Code: HYDFAST",
      desc: "Instant ₹50 discount on orders above ₹249",
      badgeBg: "bg-purple-600 text-white",
      code: "HYDFAST",
    },
    {
      icon: "🛵",
      tag: "COLD-CHAIN EV",
      title: "100% Green Electric Fleet",
      desc: "Smart temperature-controlled delivery pods",
      badgeBg: "bg-teal-500 text-white",
    },
    {
      icon: "🥗",
      tag: "EXOTIC & FRESH",
      title: "Fresh Mangoes & Herbs",
      desc: "Direct from Telangana & Andhra certified growers",
      badgeBg: "bg-amber-500 text-white",
    },
  ];

  const dealsHighlights = [
    {
      icon: "🔥",
      tag: "HOT DEAL",
      title: "Flat ₹100 Off on ₹399+",
      code: "LEAF100",
      bg: "from-amber-500/20 to-orange-500/20",
    },
    {
      icon: "⚡",
      tag: "INSTANT ₹30 OFF",
      title: "Use Coupon: SUPERFAST",
      code: "SUPERFAST",
      bg: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: "🥑",
      tag: "FARM EXCLUSIVE",
      title: "Buy 1 Get 1 on Organic Salad Greens",
      code: "BOGOORGANIC",
      bg: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: "🚚",
      tag: "FREE DELIVERY",
      title: "Guaranteed 10-Min Free Delivery on ₹199+",
      code: "FREEDEL",
      bg: "from-blue-500/20 to-indigo-500/20",
    },
    {
      icon: "🎉",
      tag: "CASHBACK",
      title: "Flat 15% UPI Cashback via PhonePe & GPay",
      code: "UPI15",
      bg: "from-purple-500/20 to-pink-500/20",
    },
  ];

  return (
    <div className="my-4 sm:my-6 space-y-2.5 overflow-hidden">
      {/* Side-by-side / Dual Marquee Track 1: Hyderabad & Speed Highlights (Leftward Scroll) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-950 text-white p-2.5 sm:p-3 border border-emerald-800/80 shadow-md">
        {/* Glow Halos */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-emerald-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none" />

        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap group hover:[animation-play-state:paused]">
          {[...hydHighlights, ...hydHighlights, ...hydHighlights].map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white/10 transition shrink-0 cursor-pointer"
              onClick={() => {
                if (item.code && onApplyCoupon) {
                  onApplyCoupon(item.code);
                } else if (onOpenLocationPicker) {
                  onOpenLocationPicker();
                }
              }}
            >
              <span className="text-base sm:text-lg">{item.icon}</span>
              <span
                className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${item.badgeBg}`}
              >
                {item.tag}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white">{item.title}</span>
              <span className="text-[11px] sm:text-xs text-emerald-200/80 hidden xs:inline">
                • {item.desc}
              </span>
              {item.code && (
                <span className="text-[10px] bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-2 py-0.5 rounded ml-1">
                  TAP TO APPLY
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-side / Dual Marquee Track 2: Exclusive Deals & Offers (Rightward / Reverse Scroll) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/90 via-stone-900 to-emerald-950 text-white p-2.5 sm:p-3 border border-amber-800/60 shadow-md">
        {/* Glow Halos */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-amber-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-emerald-950 to-transparent z-10 pointer-events-none" />

        <div className="flex items-center gap-4 animate-marquee-reverse whitespace-nowrap group hover:[animation-play-state:paused]">
          {[...dealsHighlights, ...dealsHighlights, ...dealsHighlights].map((deal, idx) => (
            <div
              key={idx}
              className={`inline-flex items-center gap-2.5 bg-gradient-to-r ${deal.bg} hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-amber-400/30 transition shrink-0 cursor-pointer`}
              onClick={() => {
                if (deal.code && onApplyCoupon) {
                  onApplyCoupon(deal.code);
                }
              }}
            >
              <span className="text-base sm:text-lg">{deal.icon}</span>
              <span className="text-[9px] sm:text-[10px] font-black bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded uppercase tracking-wider">
                {deal.tag}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-100">{deal.title}</span>
              {deal.code && (
                <span className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black px-2 py-0.5 rounded ml-1 shadow-xs">
                  {deal.code} ➔
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
