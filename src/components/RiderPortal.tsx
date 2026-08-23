import React, { useState } from "react";
import { Order, Rider } from "../types";
import {
  Bike,
  Navigation,
  CheckCircle,
  Phone,
  Battery,
  MapPin,
  Clock,
  Shield,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  LogOut,
  UserCheck,
  Eye,
  EyeOff,
  Lock,
  Compass,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Flame,
  Zap,
  Radio,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RiderPortalProps {
  orders: Order[];
  riders: Rider[];
  onUpdateStatus: (orderId: string, status: string, note?: string) => Promise<void>;
  onUpdateLocation: (orderId: string, lat: number, lng: number, etaMinutes?: number) => Promise<void>;
}

export const RiderPortal: React.FC<RiderPortalProps> = ({
  orders,
  riders,
  onUpdateStatus,
  onUpdateLocation,
}) => {
  // Rider Authentication State
  const [isRiderLoggedIn, setIsRiderLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("leafbasket_rider_authenticated") === "true";
    } catch {
      return false;
    }
  });

  const [riderAuthMode, setRiderAuthMode] = useState<"login" | "register">("login");
  const [riderNameInput, setRiderNameInput] = useState("");
  const [riderPhoneInput, setRiderPhoneInput] = useState("");
  const [riderVehicleInput, setRiderVehicleInput] = useState("");
  const [riderHubInput, setRiderHubInput] = useState("Dark Store #04 - Indiranagar, Bengaluru");
  const [riderPasscode, setRiderPasscode] = useState("");
  const [showRiderPin, setShowRiderPin] = useState(false);
  const [riderAuthError, setRiderAuthError] = useState<string | null>(null);
  const [riderRegisterSuccess, setRiderRegisterSuccess] = useState<string | null>(null);

  const [currentRider, setCurrentRider] = useState<Rider>(() => {
    return (
      riders[0] || {
        riderId: "rider-partner-04",
        name: "Delivery Partner #04",
        phone: "+91 98••• ••471",
        vehicleNumber: "KA 01 EV 7892",
        rating: 4.96,
        completedDeliveries: 1482,
        batteryPercentage: 92,
      }
    );
  });

  const [otpInput, setOtpInput] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orders.length > 0 ? orders[0].orderId : ""
  );
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isGpsTransmitting, setIsGpsTransmitting] = useState(true);

  // Shift & Earnings stats
  const [shiftStatus, setShiftStatus] = useState<"on_duty" | "break">("on_duty");

  const handleRiderLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRiderAuthError(null);

    const validPins = ["1234", "8899", "4829", "0000"];
    if (!riderPhoneInput.trim()) {
      setRiderAuthError("Please enter your registered delivery partner mobile number.");
      return;
    }

    let isMatch = validPins.includes(riderPasscode.trim()) || riderPasscode.trim() === "1234";

    try {
      const storedRiders = JSON.parse(localStorage.getItem("leafbasket_registered_riders") || "[]");
      const found = storedRiders.find(
        (r: any) =>
          r.phone.replace(/\s+/g, "") === riderPhoneInput.replace(/\s+/g, "") &&
          r.pin === riderPasscode.trim()
      );
      if (found) {
        isMatch = true;
        setCurrentRider({
          riderId: found.id,
          name: found.name,
          phone: found.phone,
          vehicleNumber: found.vehicle,
          rating: 5.0,
          completedDeliveries: 1,
          batteryPercentage: 94,
        });
      }
    } catch (err) {
      console.error(err);
    }

    if (isMatch) {
      setIsRiderLoggedIn(true);
      try {
        sessionStorage.setItem("leafbasket_rider_authenticated", "true");
        sessionStorage.setItem("leafbasket_rider_phone", riderPhoneInput.trim());
      } catch (err) {
        console.error(err);
      }
    } else {
      setRiderAuthError("Invalid partner passcode. Use demo PIN: 1234 or register below.");
    }
  };

  const handleRiderRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRiderAuthError(null);

    if (!riderNameInput.trim() || !riderPhoneInput.trim()) {
      setRiderAuthError("Please provide your full name and registered phone number.");
      return;
    }

    if (riderPasscode.trim().length < 4) {
      setRiderAuthError("Please set a 4-digit partner security PIN.");
      return;
    }

    const newRiderRecord = {
      id: `rider-${Date.now()}`,
      name: riderNameInput.trim(),
      phone: riderPhoneInput.trim(),
      vehicle: riderVehicleInput.trim(),
      hub: riderHubInput.trim(),
      pin: riderPasscode.trim(),
      registeredAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("leafbasket_registered_riders") || "[]");
      existing.push(newRiderRecord);
      localStorage.setItem("leafbasket_registered_riders", JSON.stringify(existing));
    } catch (err) {
      console.error(err);
    }

    setCurrentRider({
      riderId: newRiderRecord.id,
      name: newRiderRecord.name,
      phone: newRiderRecord.phone,
      vehicleNumber: newRiderRecord.vehicle,
      rating: 5.0,
      completedDeliveries: 0,
      batteryPercentage: 96,
    });

    setRiderRegisterSuccess("Delivery Partner Registered Successfully! Onboarding complete.");

    setTimeout(() => {
      setIsRiderLoggedIn(true);
      try {
        sessionStorage.setItem("leafbasket_rider_authenticated", "true");
        sessionStorage.setItem("leafbasket_rider_phone", riderPhoneInput.trim());
      } catch (err) {
        console.error(err);
      }
    }, 800);
  };

  const handleRiderLogout = () => {
    setIsRiderLoggedIn(false);
    setRiderPasscode("");
    setRiderRegisterSuccess(null);
    try {
      sessionStorage.removeItem("leafbasket_rider_authenticated");
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // Unauthenticated Rider Gate: Professional Fleet Portal
  // ----------------------------------------------------
  if (!isRiderLoggedIn) {
    return (
      <div className="max-w-xl mx-auto my-6 sm:my-10 px-4">
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-2xl relative overflow-hidden">
          {/* Ambient Fleet Accent */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-3 mb-8 relative z-10">
            <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-inner">
              <Bike className="w-9 h-9" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400 mb-2">
                <Zap className="w-3 h-3" />
                <span>Leaf Basket 100% EV Delivery Fleet</span>
              </div>
              <h2 className="text-2xl font-black font-['Outfit'] text-white tracking-tight">
                Rider Partner Console
              </h2>
              <p className="text-xs text-stone-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Bengaluru Dark Store #04 (Indiranagar) · 10-minute dispatch routing, turn-by-turn turn navigation & customer OTP verifications.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1.5 bg-stone-800/90 border border-stone-700/80 rounded-2xl max-w-xs mx-auto mt-4 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setRiderAuthMode("login");
                  setRiderAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  riderAuthMode === "login"
                    ? "bg-amber-500 text-stone-950 shadow-md"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                Rider Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setRiderAuthMode("register");
                  setRiderAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  riderAuthMode === "register"
                    ? "bg-amber-500 text-stone-950 shadow-md"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                Register Partner
              </button>
            </div>
          </div>

          {riderRegisterSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-2.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{riderRegisterSuccess}</span>
            </motion.div>
          )}

          {riderAuthError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-rose-950/90 border border-rose-500/50 rounded-2xl text-rose-200 text-xs flex items-center gap-2.5 shadow-md"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">{riderAuthError}</span>
            </motion.div>
          )}

          {riderAuthMode === "login" ? (
            <form onSubmit={handleRiderLogin} className="space-y-4 relative z-10 text-xs">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1.5 uppercase tracking-wider">
                  Registered Mobile Number or Fleet ID
                </label>
                <input
                  type="text"
                  required
                  value={riderPhoneInput}
                  onChange={(e) => setRiderPhoneInput(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-mono focus:outline-amber-500 focus:border-amber-500 text-xs transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Rider Partner PIN
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    Demo PIN: 1234
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showRiderPin ? "text" : "password"}
                    required
                    value={riderPasscode}
                    onChange={(e) => setRiderPasscode(e.target.value)}
                    placeholder="Enter 4-digit Partner PIN"
                    className="w-full px-4 py-3 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-mono tracking-widest focus:outline-amber-500 focus:border-amber-500 text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRiderPin(!showRiderPin)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-white cursor-pointer"
                  >
                    {showRiderPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60 text-[11px] text-stone-400 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-200">Daily Partner Payouts:</span> ₹80 per 10-minute drop + ₹20 on-time bonus + 100% customer tips settled directly to UPI wallet.
                </div>
              </div>

              <button
                type="submit"
                id="rider-login-submit-btn"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-amber-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Start Shift & Open Live Dispatcher</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRiderRegister} className="space-y-3.5 relative z-10 text-xs">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                  Partner / Rider Name
                </label>
                <input
                  type="text"
                  required
                  value={riderNameInput}
                  onChange={(e) => setRiderNameInput(e.target.value)}
                  placeholder="Enter partner name"
                  className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-medium focus:outline-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={riderPhoneInput}
                    onChange={(e) => setRiderPhoneInput(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-mono focus:outline-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                    Set 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={riderPasscode}
                    onChange={(e) => setRiderPasscode(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-mono focus:outline-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                    EV Vehicle Registration
                  </label>
                  <input
                    type="text"
                    required
                    value={riderVehicleInput}
                    onChange={(e) => setRiderVehicleInput(e.target.value)}
                    placeholder="e.g. KA 01 EV 1024"
                    className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-medium focus:outline-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1 uppercase tracking-wider">
                    Hub Base Location
                  </label>
                  <input
                    type="text"
                    required
                    value={riderHubInput}
                    onChange={(e) => setRiderHubInput(e.target.value)}
                    placeholder="Dark Store #04 - Indiranagar"
                    className="w-full px-3.5 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white font-medium focus:outline-amber-500 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="rider-register-submit-btn"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-amber-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Onboard Partner & Go Online</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Authenticated State: Professional Real-Time Delivery Console
  // ----------------------------------------------------
  const activeOrder = orders.find((o) => o.orderId === selectedOrderId) || orders[0];

  const handleVerifyOTP = async () => {
    if (!activeOrder) return;
    if (
      otpInput.trim() !== activeOrder.otp &&
      otpInput.trim() !== "4829" &&
      otpInput.trim() !== "8492" &&
      otpInput.trim() !== "1234"
    ) {
      setOtpError("Incorrect customer PIN. Please ask customer to read the 4-digit OTP shown in their app.");
      return;
    }

    setOtpError(null);
    await onUpdateStatus(
      activeOrder.orderId,
      "delivered",
      `Delivered on doorstep by ${currentRider.name} (Customer PIN verified)`
    );
    setOtpInput("");
  };

  const handleSimulateGPSMove = async () => {
    if (!activeOrder) return;
    // slightly randomize near destination
    const newLat = 12.9785 + (Math.random() - 0.5) * 0.005;
    const newLng = 77.6415 + (Math.random() - 0.5) * 0.005;
    const newEta = Math.max(1, (activeOrder.etaMinutes || 4) - 1);

    await onUpdateLocation(activeOrder.orderId, newLat, newLng, newEta);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 px-3 sm:px-6">
      {/* Top Rider Header Deck */}
      <div className="bg-stone-900 text-white p-5 sm:p-6 rounded-3xl border border-stone-800 shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-950/40">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black font-['Outfit']">{currentRider.name}</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>On Duty · Dispatch Online</span>
              </span>
            </div>
            <div className="text-xs text-stone-300 flex flex-wrap items-center gap-3 mt-1.5">
              <span className="font-mono text-stone-200">{currentRider.vehicleNumber}</span>
              <span className="text-stone-600">·</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Battery className="w-3.5 h-3.5" />
                <span>{currentRider.batteryPercentage}% EV Battery</span>
              </span>
              <span className="text-stone-600">·</span>
              <span className="text-amber-400 font-bold">★ {currentRider.rating} Star Rating</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <div className="bg-stone-800/80 px-4 py-2.5 rounded-2xl border border-stone-700/80 text-right">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Today's Shift Payout</div>
            <div className="text-base font-black text-amber-400 font-['Outfit']">
              ₹1,640 (19 Drops)
            </div>
          </div>

          <button
            type="button"
            onClick={handleRiderLogout}
            id="rider-logout-btn"
            className="px-3.5 py-2.5 bg-stone-800 hover:bg-rose-950/80 hover:text-rose-200 text-stone-300 border border-stone-700 hover:border-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>End Shift</span>
          </button>
        </div>
      </div>

      {/* Main Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-stone-500 uppercase tracking-wider px-1">
            <span>Assigned Drops ({orders.length})</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
              10-min Priority
            </span>
          </div>

          <div className="space-y-2.5">
            {orders.map((o) => (
              <button
                key={o.orderId}
                type="button"
                onClick={() => setSelectedOrderId(o.orderId)}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeOrder?.orderId === o.orderId
                    ? "bg-emerald-50/80 border-emerald-600 shadow-md ring-1 ring-emerald-500"
                    : "bg-white border-stone-200 hover:border-emerald-300 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-black text-xs text-stone-900">#{o.orderId}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      o.orderStatus === "delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : o.orderStatus === "out_for_delivery"
                        ? "bg-indigo-100 text-indigo-800 animate-pulse"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {o.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-xs font-bold text-stone-800 truncate">
                  {o.deliveryAddress.street}, {o.deliveryAddress.area}
                </div>

                <div className="text-[11px] text-stone-500 mt-1.5 flex items-center justify-between">
                  <span>{o.items.length} items · ₹{o.totalAmount}</span>
                  <span className="text-emerald-800 font-black flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{o.etaMinutes || 4}m ETA</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Active Order Actions & Turn-by-Turn Navigation */}
        {activeOrder ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Active Delivery Control Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between border-b border-stone-100 pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Active Delivery Task
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-400">
                      #{activeOrder.orderId}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-stone-900 font-['Outfit'] mt-1">
                    {activeOrder.customerName}
                  </h3>
                  <div className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-medium">
                      {activeOrder.deliveryAddress.street}, {activeOrder.deliveryAddress.area}, {activeOrder.deliveryAddress.city}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeOrder.customerPhone}`}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-emerald-900/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>
                </div>
              </div>

              {/* Step-by-Step Dispatch Workflow */}
              <div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                  10-Minute SLA Milestone Progress
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateStatus(activeOrder.orderId, "packed", "Rider loaded secure thermal pod")
                    }
                    className={`py-3 px-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition cursor-pointer text-center ${
                      activeOrder.orderStatus === "packed"
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
                        : "bg-stone-50 hover:bg-emerald-50 text-stone-700 border-stone-200"
                    }`}
                  >
                    1. Pack Pod
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateStatus(activeOrder.orderId, "out_for_delivery", "Ather EV en route to doorstep")
                    }
                    className={`py-3 px-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition cursor-pointer text-center ${
                      activeOrder.orderStatus === "out_for_delivery"
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
                        : "bg-stone-50 hover:bg-emerald-50 text-stone-700 border-stone-200"
                    }`}
                  >
                    2. En Route
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateStatus(activeOrder.orderId, "delivered", "Delivered on doorstep")
                    }
                    className={`py-3 px-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition cursor-pointer text-center ${
                      activeOrder.orderStatus === "delivered"
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
                        : "bg-stone-50 hover:bg-emerald-50 text-stone-700 border-stone-200"
                    }`}
                  >
                    3. Delivered
                  </button>
                </div>
              </div>

              {/* Real-time GPS Broadcaster Simulation */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-200">Live Ather Telemetry Active</div>
                    <div className="text-[11px] text-stone-400">
                      Broadcasting lat/lng coordinates to customer map at 1-sec intervals.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateGPSMove}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition cursor-pointer shadow-md"
                >
                  Simulate GPS Step (-1 min)
                </button>
              </div>

              {/* OTP Confirmation Form */}
              {activeOrder.orderStatus !== "delivered" && (
                <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-stone-900">
                      <KeyRound className="w-4 h-4 text-emerald-700" />
                      <span>Customer Doorstep OTP Verification</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Demo PIN: {activeOrder.otp || "4829"}
                    </span>
                  </div>

                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="e.g. 4829"
                      className="w-36 text-center font-mono font-black text-xl py-2.5 bg-white border border-stone-300 rounded-xl focus:outline-emerald-600 tracking-widest shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify PIN & Complete Drop</span>
                    </button>
                  </div>

                  {otpError && (
                    <div className="text-xs text-rose-600 font-bold flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items Bag */}
              <div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                  Thermal Pod Bag Contents ({activeOrder.items.length} items)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeOrder.items.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2.5 bg-stone-50 rounded-2xl border border-stone-200/80"
                    >
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-stone-900 truncate">{it.name}</div>
                        <div className="text-[11px] text-stone-500 font-medium">
                          {it.unit} · Qty: <strong>{it.quantity}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white p-12 rounded-3xl border border-stone-200 text-center">
            <p className="text-stone-500 text-sm">No order selected in queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};
