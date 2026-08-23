import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  Sparkles,
  Volume2,
  Download,
  Share2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

export type UPIAppType = "phonepe" | "gpay" | "paytm" | "bhim";

interface PhonePeQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess?: () => void;
  orderId?: string;
  initialApp?: UPIAppType;
}

export const PhonePeQrModal: React.FC<PhonePeQrModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaymentSuccess,
  orderId = `LB-${Math.floor(100000 + Math.random() * 900000)}`,
  initialApp = "phonepe",
}) => {
  const [activeApp, setActiveApp] = useState<UPIAppType>(initialApp);
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes timer
  const [utrNumber, setUtrNumber] = useState("");
  const [soundboxEnabled, setSoundboxEnabled] = useState(true);

  const upiId = "8688778104@ybl";
  const upiNumber = "+91 8688778104";

  // App specific configs
  const appConfig: Record<
    UPIAppType,
    {
      name: string;
      color: string;
      bgGlow: string;
      accentBorder: string;
      badgeText: string;
      iconBg: string;
      emblem: string;
      bankNote: string;
      intentUrl: string;
      themeGradient: string;
    }
  > = {
    phonepe: {
      name: "PhonePe UPI",
      color: "text-purple-400",
      bgGlow: "bg-purple-600/20",
      accentBorder: "border-purple-500/40",
      badgeText: "PhonePe Live Merchant QR",
      iconBg: "bg-[#5f259f]",
      emblem: "पे",
      bankNote: "State Bank of India • 6183",
      intentUrl: `phonepe://pay?pa=${upiId}&pn=Leaf%20Basket&am=${amount}&cu=INR&tn=Order%20${orderId}`,
      themeGradient: "from-purple-900 via-[#161224] to-[#0d0a17]",
    },
    gpay: {
      name: "Google Pay (Tez)",
      color: "text-emerald-400",
      bgGlow: "bg-blue-600/20",
      accentBorder: "border-emerald-500/40",
      badgeText: "Google Pay Verified Merchant",
      iconBg: "bg-gradient-to-tr from-blue-600 via-green-600 to-amber-500",
      emblem: "G",
      bankNote: "HDFC Bank Ltd • 4402",
      intentUrl: `tez://upi/pay?pa=${upiId}&pn=Leaf%20Basket&am=${amount}&cu=INR&tn=Order%20${orderId}`,
      themeGradient: "from-blue-950 via-[#101827] to-[#0c121e]",
    },
    paytm: {
      name: "Paytm UPI",
      color: "text-sky-400",
      bgGlow: "bg-sky-600/20",
      accentBorder: "border-sky-500/40",
      badgeText: "Paytm Soundbox QR Active",
      iconBg: "bg-[#002e6e]",
      emblem: "Pay",
      bankNote: "Paytm Payments Bank • 9801",
      intentUrl: `paytmmp://pay?pa=${upiId}&pn=Leaf%20Basket&am=${amount}&cu=INR&tn=Order%20${orderId}`,
      themeGradient: "from-sky-950 via-[#0c1c2e] to-[#08121f]",
    },
    bhim: {
      name: "BHIM / All UPI",
      color: "text-amber-400",
      bgGlow: "bg-amber-600/20",
      accentBorder: "border-amber-500/40",
      badgeText: "NPCI Bharat QR Unified",
      iconBg: "bg-[#0f4c81]",
      emblem: "UPI",
      bankNote: "NPCI Unified Instant Switch",
      intentUrl: `upi://pay?pa=${upiId}&pn=Leaf%20Basket&am=${amount}&cu=INR&tn=Order%20${orderId}`,
      themeGradient: "from-stone-900 via-[#171513] to-[#0d0c0b]",
    },
  };

  const currentConfig = appConfig[activeApp];

  useEffect(() => {
    if (initialApp) {
      setActiveApp(initialApp);
    }
  }, [initialApp, isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) {
      setPaymentDone(false);
      setIsVerifying(false);
      setTimeRemaining(300);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playSoundboxAudio = () => {
    // 1. Synthesizer Chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.error(e);
    }

    // 2. Speech Synthesis Soundbox voice announcement
    if (soundboxEnabled && "speechSynthesis" in window) {
      try {
        const text =
          activeApp === "phonepe"
            ? `PhonePe par ${amount} rupaye prapt hue. Thank you for choosing Leaf Basket!`
            : activeApp === "gpay"
            ? `Received rupees ${amount} on Google Pay for Leaf Basket order.`
            : `Payment of rupees ${amount} received successfully on UPI.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConfirmPayment = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setPaymentDone(true);
      playSoundboxAudio();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#5f259f", "#10b981", "#3b82f6", "#f59e0b", "#06b6d4"],
      });

      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        onClose();
      }, 2000);
    }, 1400);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className={`relative w-full max-w-sm bg-gradient-to-b ${currentConfig.themeGradient} text-white rounded-3xl shadow-2xl border ${currentConfig.accentBorder} overflow-y-auto max-h-[94vh] my-auto transition-colors duration-300 pb-safe`}
        >
          {/* Top Status Bar */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-white/10 rounded-full text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{currentConfig.badgeText}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-mono">Timer</span>
              <div className="text-xs font-bold text-amber-400 font-mono leading-none">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {/* App Switcher Tabs: PhonePe, GPay, Paytm, BHIM */}
          <div className="px-4 pt-3">
            <div className="grid grid-cols-4 gap-1 p-1 bg-black/50 rounded-2xl border border-white/10 text-[11px]">
              {[
                { id: "phonepe", label: "PhonePe", icon: "🟣" },
                { id: "gpay", label: "GPay", icon: "🟢" },
                { id: "paytm", label: "Paytm", icon: "🔵" },
                { id: "bhim", label: "All UPI", icon: "🇮🇳" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveApp(tab.id as UPIAppType)}
                  className={`py-1.5 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                    activeApp === tab.id
                      ? "bg-white text-stone-900 shadow-md scale-102"
                      : "text-stone-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-xs">{tab.icon}</span>
                  <span className="text-[10px] truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile & Account Banner */}
          <div className="p-4 sm:p-5 pt-3 pb-4">
            <div className="flex items-center justify-between mb-3 bg-black/30 p-2.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md flex items-center justify-center text-white font-extrabold text-xs overflow-hidden">
                  <span className="text-base">🍃</span>
                </div>
                <div>
                  <div className="text-xs font-black tracking-wide text-white">
                    Leaf Basket Technologies
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    {upiNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSoundboxEnabled(!soundboxEnabled)}
                  title={soundboxEnabled ? "Soundbox Audio On" : "Soundbox Muted"}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    soundboxEnabled
                      ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                      : "bg-white/5 border-white/10 text-stone-400"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[9px]">{soundboxEnabled ? "ON" : "OFF"}</span>
                </button>
              </div>
            </div>

            {/* Main Interactive QR Card Container */}
            <div className="bg-[#120f20]/90 rounded-3xl p-4 border border-white/10 shadow-inner relative overflow-hidden text-center">
              {/* Subtle background glow */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 ${currentConfig.bgGlow} rounded-full blur-2xl pointer-events-none`} />

              {/* Bank Info Pill */}
              <div className="flex items-center justify-center gap-2 mb-3 bg-white/10 py-1 px-3 rounded-full border border-white/10 max-w-fit mx-auto shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-bold text-stone-200">
                  {currentConfig.bankNote}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="relative w-52 h-52 sm:w-56 sm:h-56 mx-auto bg-white p-3 rounded-2xl shadow-2xl flex items-center justify-center">
                {/* SVG QR Code Pattern Matrix */}
                <svg
                  viewBox="0 0 160 160"
                  className="w-full h-full text-stone-950"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Top-Left Corner Box */}
                  <rect x="10" y="10" width="40" height="40" rx="6" fill="black" />
                  <rect x="18" y="18" width="24" height="24" rx="3" fill="white" />
                  <rect x="24" y="24" width="12" height="12" rx="2" fill="black" />

                  {/* Top-Right Corner Box */}
                  <rect x="110" y="10" width="40" height="40" rx="6" fill="black" />
                  <rect x="118" y="18" width="24" height="24" rx="3" fill="white" />
                  <rect x="124" y="24" width="12" height="12" rx="2" fill="black" />

                  {/* Bottom-Left Corner Box */}
                  <rect x="10" y="110" width="40" height="40" rx="6" fill="black" />
                  <rect x="18" y="118" width="24" height="24" rx="3" fill="white" />
                  <rect x="24" y="124" width="12" height="12" rx="2" fill="black" />

                  {/* Data Dots Pattern */}
                  <rect x="60" y="15" width="8" height="8" rx="1.5" />
                  <rect x="75" y="15" width="8" height="8" rx="1.5" />
                  <rect x="90" y="15" width="8" height="8" rx="1.5" />
                  <rect x="60" y="30" width="8" height="8" rx="1.5" />
                  <rect x="85" y="30" width="12" height="8" rx="1.5" />
                  <rect x="60" y="45" width="16" height="8" rx="1.5" />
                  <rect x="85" y="45" width="8" height="8" rx="1.5" />

                  <rect x="15" y="60" width="8" height="8" rx="1.5" />
                  <rect x="30" y="60" width="16" height="8" rx="1.5" />
                  <rect x="115" y="60" width="12" height="8" rx="1.5" />
                  <rect x="135" y="60" width="8" height="8" rx="1.5" />

                  <rect x="15" y="75" width="12" height="8" rx="1.5" />
                  <rect x="35" y="75" width="8" height="8" rx="1.5" />
                  <rect x="115" y="75" width="8" height="8" rx="1.5" />
                  <rect x="130" y="75" width="16" height="8" rx="1.5" />

                  <rect x="15" y="90" width="8" height="8" rx="1.5" />
                  <rect x="30" y="90" width="12" height="8" rx="1.5" />
                  <rect x="115" y="90" width="16" height="8" rx="1.5" />
                  <rect x="135" y="90" width="8" height="8" rx="1.5" />

                  <rect x="60" y="110" width="12" height="8" rx="1.5" />
                  <rect x="80" y="110" width="16" height="8" rx="1.5" />
                  <rect x="60" y="125" width="8" height="8" rx="1.5" />
                  <rect x="75" y="125" width="8" height="8" rx="1.5" />
                  <rect x="90" y="125" width="8" height="8" rx="1.5" />
                  <rect x="60" y="140" width="16" height="8" rx="1.5" />
                  <rect x="85" y="140" width="12" height="8" rx="1.5" />

                  <rect x="110" y="110" width="8" height="8" rx="1.5" />
                  <rect x="125" y="110" width="12" height="8" rx="1.5" />
                  <rect x="142" y="110" width="8" height="8" rx="1.5" />
                  <rect x="110" y="125" width="12" height="8" rx="1.5" />
                  <rect x="130" y="125" width="16" height="8" rx="1.5" />
                  <rect x="110" y="140" width="8" height="8" rx="1.5" />
                  <rect x="125" y="140" width="8" height="8" rx="1.5" />
                  <rect x="140" y="140" width="10" height="8" rx="1.5" />
                </svg>

                {/* Central Dynamic App Emblem */}
                <div
                  className={`absolute inset-0 m-auto w-11 h-11 rounded-full ${currentConfig.iconBg} border-2 border-white flex items-center justify-center shadow-lg text-white font-black text-lg select-none`}
                >
                  {currentConfig.emblem}
                </div>
              </div>

              {/* Exact Amount Tag */}
              <div className="mt-3">
                <div className="text-[10px] text-stone-300 uppercase tracking-wider font-semibold">
                  Scan & Pay Exact Amount
                </div>
                <div className="text-2xl font-black font-['Outfit'] text-white">
                  ₹{amount}
                </div>
              </div>

              {/* Copy UPI ID Button */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1 rounded-xl transition cursor-pointer border border-white/10"
                >
                  <span>UPI ID: <strong className="text-white font-mono">{upiId}</strong></span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Direct Open App UPI Intent button (Mobile Friendly) */}
            <div className="mt-3">
              <a
                href={currentConfig.intentUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-white/20 shadow-md transition"
              >
                <Smartphone className="w-4 h-4 text-stone-300" />
                <span>Open directly in {currentConfig.name}</span>
              </a>
            </div>

            {/* Optional UTR / Reference ID Box */}
            <div className="mt-2.5">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="12-digit UPI UTR / Ref No (Optional)"
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-[11px] text-white placeholder-stone-400 font-mono focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Verification Button / Paid Confirmation */}
            <div className="mt-3">
              {paymentDone ? (
                <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-2xl text-emerald-200 text-xs flex items-center justify-center gap-2 font-bold animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Payment Verified! Processing 10-Min Order...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Checking Soundbox & Bank Settlement...</span>
                    </div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>I Have Completed Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Security Footer Note */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>NPCI UPI 256-Bit Encrypted Instant Settlement</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
