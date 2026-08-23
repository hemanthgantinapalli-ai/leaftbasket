import React, { useState } from "react";
import { X, Phone, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LeafBasketLogo } from "./LeafBasketLogo";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  savedAddresses?: string[];
  ordersCount?: number;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsOtpSent(true);
      setOtp("7492"); // Pre-fill mock OTP for convenience
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError("Please enter the 4-digit OTP.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        name: name.trim() || (mode === "register" ? "New Shopper" : "Priya Sharma"),
        phone: `+91 ${phone.replace(/^\+91/, "").trim()}`,
        email: email.trim() || "shopper@leafbasket.in",
        savedAddresses: ["12th Main Rd, Indiranagar, Bengaluru"],
        ordersCount: 3,
      };
      onLoginSuccess(userProfile);
      onClose();
    }, 600);
  };

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

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-tr from-emerald-900 via-teal-900 to-emerald-950 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center p-1.5 mb-3 shadow-inner">
              <LeafBasketLogo variant="icon" size="sm" />
            </div>
            <h3 className="text-xl font-extrabold font-['Outfit']">
              {mode === "login" ? "Welcome to Leaf Basket" : "Join Leaf Basket Club"}
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              {mode === "login"
                ? "Sign in with your mobile number to access active orders & saved addresses"
                : "Join millions getting farm-fresh groceries delivered in 10 minutes"}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priya Sharma / Ramesh Rao"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-emerald-600"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Number</label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-600">
                      🇮🇳 +91
                    </span>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-emerald-600"
                        required
                      />
                    </div>
                  </div>
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email Address (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="priya@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-emerald-600"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{loading ? "Sending OTP..." : "Continue with OTP"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-center justify-between">
                  <div>
                    <span>OTP sent to <strong>+91 {phone}</strong></span>
                    <div className="text-[11px] text-emerald-700">Auto-filled demo code: 7492</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="text-emerald-800 font-bold underline cursor-pointer text-xs"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Enter 4-digit OTP</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="7492"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono tracking-widest text-center focus:bg-white focus:outline-emerald-600 font-bold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
                </button>
              </form>
            )}

            {/* Toggle Mode */}
            <div className="pt-2 text-center text-xs text-stone-500">
              {mode === "login" ? (
                <div>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    Register New Account
                  </button>
                </div>
              ) : (
                <div>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-2 border-t border-stone-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Secure Encrypted User Data</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
