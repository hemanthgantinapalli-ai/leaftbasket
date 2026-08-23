import React, { useState, useEffect } from "react";
import { Order } from "../types";
import {
  Bike,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle,
  Package,
  Sparkles,
  RefreshCw,
  Navigation,
  KeyRound,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { LiveLeafletMap } from "./LiveLeafletMap";

interface LiveOrderTrackingProps {
  order: Order | null;
  onBackToShop: () => void;
  onUpdateStatus: (orderId: string, status: string, note?: string) => Promise<void>;
  onUpdateLocation: (orderId: string, lat: number, lng: number, etaMinutes?: number) => Promise<void>;
  onOpenReviewProduct?: (productTarget: { id: string; name: string; image: string; unit?: string; price?: number }) => void;
}

export const LiveOrderTracking: React.FC<LiveOrderTrackingProps> = ({
  order,
  onBackToShop,
  onUpdateStatus,
  onUpdateLocation,
  onOpenReviewProduct,
}) => {
  const [etaRemainingSeconds, setEtaRemainingSeconds] = useState(
    order?.etaMinutes ? order.etaMinutes * 60 : 360
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(65);

  // Sync ETA Countdown
  useEffect(() => {
    if (!order || order.orderStatus === "delivered") return;

    const timer = setInterval(() => {
      setEtaRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  // Simulation step runner
  const handleNextStatus = async () => {
    if (!order) return;
    const current = order.orderStatus;
    let nextStatus = "packed";
    let note = "Order packed in temperature-controlled pod";

    if (current === "placed") {
      nextStatus = "packed";
      note = "Packed at Indiranagar Dark Store #04 with ice gel packs";
    } else if (current === "packed") {
      nextStatus = "out_for_delivery";
      note = "Rider Rajesh K. picked up order on Electric Ather 450X";
    } else if (current === "out_for_delivery") {
      nextStatus = "delivered";
      note = "Delivered successfully! OTP verified.";
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }

    await onUpdateStatus(order.orderId, nextStatus, note);
  };

  const handleSimulateRiderMovement = async () => {
    if (!order) return;
    setIsSimulating(true);

    const steps = [
      { lat: 12.9735, lng: 77.6392, eta: 4, pct: 50 },
      { lat: 12.9725, lng: 77.6402, eta: 3, pct: 75 },
      { lat: 12.9718, lng: 77.6409, eta: 1, pct: 90 },
      { lat: 12.9716, lng: 77.6412, eta: 0, pct: 100 },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      setProgressPercent(steps[i].pct);
      setEtaRemainingSeconds(steps[i].eta * 60);
      await onUpdateLocation(order.orderId, steps[i].lat, steps[i].lng, steps[i].eta);
    }

    setIsSimulating(false);
  };

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl mb-4">
          🛵
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 font-['Outfit']">
          No Active Order Yet
        </h2>
        <p className="text-stone-500 text-sm max-w-md mx-auto mt-2">
          Place your first order from our farm-fresh grocery aisles to watch real-time 10-minute dispatch & GPS scooter tracking!
        </p>
        <button
          onClick={onBackToShop}
          className="mt-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg cursor-pointer transition"
        >
          Explore Aisles
        </button>
      </div>
    );
  }

  const minutes = Math.floor(etaRemainingSeconds / 60);
  const seconds = etaRemainingSeconds % 60;
  const isDelivered = order.orderStatus === "delivered";

  const steps = [
    { key: "placed", title: "Order Confirmed", desc: "Dark Store #04", icon: CheckCircle },
    { key: "packed", title: "Packed in Chilled Pod", desc: "Insulated 4°C container", icon: Package },
    { key: "out_for_delivery", title: "Out for Delivery", desc: "On Electric Scooter", icon: Bike },
    { key: "delivered", title: "Delivered", desc: "At Your Doorstep", icon: ShieldCheck },
  ];

  const getStepState = (stepKey: string) => {
    const orderRanks: Record<string, number> = {
      placed: 1,
      packed: 2,
      out_for_delivery: 3,
      delivered: 4,
    };
    const currentRank = orderRanks[order.orderStatus] || 1;
    const thisRank = orderRanks[stepKey] || 1;

    if (thisRank < currentRank || (thisRank === 4 && order.orderStatus === "delivered")) return "completed";
    if (thisRank === currentRank) return "active";
    return "pending";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-stone-200 shadow-xs">
        <button
          onClick={onBackToShop}
          className="flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-emerald-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grocery Catalog</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-stone-500 font-mono">
            Order ID: <strong>{order.orderId}</strong>
          </span>
          <span className="bg-emerald-100 text-emerald-900 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            {order.orderStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Hero ETA Card & Live Interactive Map Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Map & Visual Scooter Route */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-stone-900 rounded-3xl text-white p-4 sm:p-8 relative overflow-hidden shadow-xl border border-emerald-900">
            {/* Header ETA Banner */}
            <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 font-extrabold text-[10px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider mb-2">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>10-Minute Hyperfast</span>
                </div>

                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black font-['Outfit'] tracking-tight leading-tight">
                  {isDelivered ? (
                    <span className="text-emerald-400">Delivered Fresh! Enjoy your meal 🥗</span>
                  ) : (
                    <span>
                      Arriving in <span className="text-amber-300">{minutes}:{seconds.toString().padStart(2, "0")}</span> mins
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Dark Store #04 (Indiranagar) ➔ {order.deliveryAddress.street}, {order.deliveryAddress.area}
                </p>
              </div>

              {/* Delivery OTP Security Badge */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center">
                <div className="flex items-center gap-1 text-[10px] text-stone-300 uppercase tracking-widest font-bold">
                  <KeyRound className="w-3 h-3 text-amber-300" />
                  <span>Delivery PIN</span>
                </div>
                <div className="text-2xl font-black font-mono tracking-widest text-amber-300 mt-0.5">
                  {order.otp || "4829"}
                </div>
                <div className="text-[9px] text-stone-300">Share with rider</div>
              </div>
            </div>

            {/* Interactive Leaflet GPS Map Component */}
            <div className="mt-6">
              <LiveLeafletMap
                storeLocation={{
                  lat: 12.9780,
                  lng: 77.6360,
                  name: "Dark Store #04 (Indiranagar)",
                }}
                customerLocation={{
                  lat: order.deliveryAddress.lat || 12.9716,
                  lng: order.deliveryAddress.lng || 77.6412,
                  address: `${order.deliveryAddress.street}, ${order.deliveryAddress.area}`,
                }}
                riderLocation={{
                  lat: order.riderLocation?.lat || 12.9745,
                  lng: order.riderLocation?.lng || 77.6385,
                  name: order.riderDetails?.name || "Rajesh (Ather 450X)",
                }}
                orderStatus={order.orderStatus}
                isDelivered={isDelivered}
              />
            </div>

            {/* Simulation Control Toolbar */}
            <div className="mt-6 pt-4 border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-[11px] text-emerald-300">
                💡 <strong>Interactive Demo:</strong> Live Leaflet GPS animation & status testing
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSimulateRiderMovement}
                  disabled={isSimulating || isDelivered}
                  className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold px-3.5 py-2 rounded-xl border border-emerald-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSimulating ? "Scooter Moving on Leaflet..." : "Simulate Live GPS"}</span>
                </button>
                <button
                  onClick={handleNextStatus}
                  disabled={isDelivered}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Next Status ➔</span>
                </button>
              </div>
            </div>
          </div>


          {/* Stepper Timeline Progression */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-base font-extrabold text-stone-900 font-['Outfit']">
              Order Milestone Updates
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {steps.map((st) => {
                const state = getStepState(st.key);
                const IconComponent = st.icon;

                return (
                  <div
                    key={st.key}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      state === "completed"
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                        : state === "active"
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20"
                        : "bg-stone-50 border-stone-200 text-stone-400 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          state === "active"
                            ? "bg-white text-emerald-800"
                            : state === "completed"
                            ? "bg-emerald-200 text-emerald-800"
                            : "bg-stone-200 text-stone-500"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {state === "completed" && (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="font-extrabold text-xs">{st.title}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        state === "active" ? "text-emerald-100" : "text-stone-500"
                      }`}
                    >
                      {st.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Rider Card & Order Items */}
        <div className="space-y-4">
          {/* Rider Partner Details Card */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3">
              Your Delivery Partner
            </div>

            <div className="flex items-center gap-3">
              <img
                src={order.riderDetails?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt="Rider"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-stone-900">
                    {order.riderDetails?.name || "Rajesh K."}
                  </h4>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    ★ {order.riderDetails?.rating || "4.95"}
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {order.riderDetails?.vehicleNumber || "KA 01 EJ 7892"} (EV Scooter)
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Vaccinated & Temperature: 98.2°F</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
              <a
                href={`tel:${order.riderDetails?.phone || "+919845238471"}`}
                className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
              <button
                onClick={() => alert("Connecting to 24x7 Leafbasket Support agent...")}
                className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                <span>Help / Chat</span>
              </button>
            </div>
          </div>

          {/* Items in This Order */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900">
              <span>Items in Order ({order.items.length})</span>
              <span className="text-emerald-700 font-extrabold">₹{order.totalAmount}</span>
            </div>

            <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={it.image} alt={it.name} className="w-9 h-9 rounded-lg object-cover border shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-800 truncate max-w-[140px]">{it.name}</div>
                      <div className="text-[11px] text-stone-400">{it.unit} x {it.quantity}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="font-bold text-stone-900">₹{it.price * it.quantity}</div>
                    {isDelivered && onOpenReviewProduct && (
                      <button
                        onClick={() =>
                          onOpenReviewProduct({
                            id: it.productId,
                            name: it.name,
                            image: it.image,
                            unit: it.unit,
                            price: it.price,
                          })
                        }
                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[10px] font-bold flex items-center gap-0.5 transition cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        <span>Rate</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-bold text-stone-800 uppercase">{order.paymentMethod} · {order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivering to:</span>
                <span className="font-bold text-stone-800 truncate max-w-[170px]">{order.deliveryAddress.street}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
