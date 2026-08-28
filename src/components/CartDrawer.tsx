import React, { useState, useEffect } from "react";
import { CartItem, Coupon, DeliveryAddress } from "../types";
import { UserProfile } from "./UserProfileModal";
import { DeliveryLocation } from "./LocationPickerModal";
import { PhonePeQrModal } from "./PhonePeQrModal";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Bike,
  Heart,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  Building2,
  Wallet,
  Smartphone,
  Check,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onClearCart: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  coupons: Coupon[];
  onPlaceOrder: (orderPayload: any) => Promise<void>;
  selectedLocation?: DeliveryLocation;
  onOpenLocationPicker?: () => void;
  onOpenPastOrders?: () => void;
  currentUser?: UserProfile | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onClearCart,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  coupons,
  onPlaceOrder,
  selectedLocation,
  onOpenLocationPicker,
  onOpenPastOrders,
  currentUser,
}) => {
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(20);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet" | "cod">("upi");
  const [upiSubOption, setUpiSubOption] = useState<"gpay" | "phonepe" | "paytm" | "custom_upi" | "qr">("gpay");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [selectedWallet, setSelectedWallet] = useState("Leafbasket Wallet (₹500.00)");
  const [instruction, setInstruction] = useState<string>("no_bell");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhonePeQrOpen, setIsPhonePeQrOpen] = useState(false);

  // Address
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(() => ({
    street: selectedLocation ? selectedLocation.fullAddress || `${selectedLocation.name}, ${selectedLocation.area}` : "12th Main Rd",
    flat: selectedLocation?.flat || "402",
    landmark: selectedLocation?.landmark || "Opposite BDA Complex",
    area: selectedLocation?.area || "Indiranagar",
    city: selectedLocation?.city || "Bengaluru",
    pincode: selectedLocation?.pincode || "560038",
    lat: selectedLocation?.lat || 12.9716,
    lng: selectedLocation?.lng || 77.6412,
  }));

  // Synchronize when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      setDeliveryAddress((prev) => ({
        ...prev,
        street: selectedLocation.fullAddress || `${selectedLocation.name}, ${selectedLocation.area}`,
        flat: selectedLocation.flat || prev.flat,
        landmark: selectedLocation.landmark || prev.landmark,
        area: selectedLocation.area,
        city: selectedLocation.city,
        pincode: selectedLocation.pincode,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      }));
    }
  }, [selectedLocation]);

  const itemTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const packagingFee = itemTotal > 0 ? 5 : 0;
  const isFreeDelivery = itemTotal >= 199;
  const deliveryFee = itemTotal > 0 ? (isFreeDelivery ? 0 : 25) : 0;

  // Coupon calculations
  let couponDiscount = 0;
  if (appliedCoupon) {
    const matched = coupons.find((c) => c.code.toUpperCase() === appliedCoupon.toUpperCase());
    if (matched && itemTotal >= matched.minOrderAmount) {
      couponDiscount = Math.min(
        Math.round((itemTotal * matched.discountPercentage) / 100),
        matched.maxDiscount
      );
    }
  }

  const grandTotal = Math.max(0, itemTotal + packagingFee + deliveryFee + tipAmount - couponDiscount);
  const freeDeliveryThreshold = 199;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - itemTotal);

  const handleApplyCouponClick = (code: string) => {
    const codeToTest = code.trim().toUpperCase();
    const matched = coupons.find((c) => c.code.toUpperCase() === codeToTest);
    if (!matched) {
      setCouponError("Invalid coupon code.");
      return;
    }
    if (itemTotal < matched.minOrderAmount) {
      setCouponError(`Minimum order amount of ₹${matched.minOrderAmount} required.`);
      return;
    }
    setCouponError(null);
    onApplyCoupon(codeToTest);
    setCouponInput("");
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: currentUser?.name || "Valued Customer",
        customerPhone: currentUser?.phone || "+91 98450 12345",
        deliveryAddress,
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          name: ci.product.name,
          price: ci.product.price,
          quantity: ci.quantity,
          unit: ci.product.unit,
          image: ci.product.image,
        })),
        itemTotal,
        packagingFee,
        deliveryFee,
        tipAmount,
        couponDiscount,
        couponCode: appliedCoupon || undefined,
        totalAmount: grandTotal,
        paymentMethod,
        notes: instruction === "no_bell" ? "Please do not ring bell (leave at door)" : "Call when nearby",
      };

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b", "#10b981"],
      });

      await onPlaceOrder(orderPayload);
      onClose();
    } catch (err: any) {
      alert("Error placing order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-amber-300 font-bold">
                  ⚡
                </div>
                <div>
                  <h2 className="text-base font-extrabold font-['Outfit'] leading-tight">
                    My Fresh Basket
                  </h2>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-300">
                    <Clock className="w-3 h-3" />
                    <span>Guaranteed 10-Minute Delivery</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="text-[11px] text-emerald-300 hover:text-white underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-emerald-900 hover:bg-emerald-800 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Free Delivery Bar */}
            {cartItems.length > 0 && (
              <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200">
                {isFreeDelivery ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Woohoo! You have unlocked FREE 10-min delivery.</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 mb-1">
                      <span>Add ₹{amountNeededForFreeDelivery} more for <strong>FREE Delivery</strong></span>
                      <span className="text-[10px] text-emerald-700">₹{itemTotal}/₹199</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (itemTotal / 199) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-4xl mb-4">
                    🍃
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">Your Basket is Empty</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                    Fill your basket with farm fresh veggies, dairy, snacks and get it delivered in 10 mins.
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      onClick={onClose}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition"
                    >
                      Start Shopping
                    </button>
                    {onOpenPastOrders && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenPastOrders();
                        }}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Reorder Past Purchases</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      Selected Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})
                    </div>

                    <div className="divide-y divide-stone-100 bg-stone-50/70 rounded-2xl p-2 border border-stone-200/80">
                      {cartItems.map(({ product, quantity }) => (
                        <div key={product.id} className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-xl border border-stone-200 bg-white"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {product.name}
                            </h4>
                            <div className="text-[11px] text-stone-500">
                              {product.unit} · ₹{product.price} each
                            </div>
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center bg-white border border-emerald-300 rounded-xl shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                              className="p-1 hover:bg-emerald-50 text-emerald-800 transition rounded-l-xl cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-extrabold text-stone-900 min-w-5 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                              className="p-1 hover:bg-emerald-50 text-emerald-800 transition rounded-r-xl cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-12.5">
                            <span className="text-xs font-extrabold text-stone-900">
                              ₹{product.price * quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Location Summary */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-900 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Bike className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="truncate">Deliver to: {deliveryAddress.area || deliveryAddress.city}</span>
                      </div>
                      {onOpenLocationPicker && (
                        <button
                          type="button"
                          onClick={onOpenLocationPicker}
                          className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold underline cursor-pointer shrink-0 ml-2"
                        >
                          Change / Pinpoint
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug truncate">
                      {deliveryAddress.street || deliveryAddress.area}, {deliveryAddress.city} {deliveryAddress.pincode && `- ${deliveryAddress.pincode}`}
                    </p>
                  </div>

                  {/* Delivery Instructions */}
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                      Delivery Instructions
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        onClick={() => setInstruction("no_bell")}
                        className={`p-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                          instruction === "no_bell"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-bold"
                            : "bg-white border-stone-200 text-stone-600"
                        }`}
                      >
                        🔕 Don't Ring Bell
                      </button>
                      <button
                        onClick={() => setInstruction("leave_door")}
                        className={`p-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                          instruction === "leave_door"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-bold"
                            : "bg-white border-stone-200 text-stone-600"
                        }`}
                      >
                        🚪 Leave at Door
                      </button>
                      <button
                        onClick={() => setInstruction("call")}
                        className={`p-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                          instruction === "call"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-bold"
                            : "bg-white border-stone-200 text-stone-600"
                        }`}
                      >
                        📞 Call on Arrival
                      </button>
                    </div>
                  </div>

                  {/* Rider Tip Section */}
                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-amber-600 fill-amber-500" />
                        <span>Tip your 10-min Rider Partner</span>
                      </div>
                      <span className="text-[10px] text-amber-700">100% goes to driver</span>
                    </div>
                    <div className="flex gap-2">
                      {[0, 10, 20, 30, 50].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setTipAmount(amt)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            tipAmount === amt
                              ? "bg-amber-600 text-white shadow-xs"
                              : "bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
                          }`}
                        >
                          {amt === 0 ? "None" : `₹${amt}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coupon Code Section */}
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                      Coupons & Offers
                    </div>

                    {appliedCoupon ? (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-emerald-700" />
                          <div>
                            <div className="text-xs font-extrabold text-emerald-900 font-mono">
                              {appliedCoupon} APPLIED
                            </div>
                            <div className="text-[11px] text-emerald-700 font-medium">
                              Saved ₹{couponDiscount} on this order!
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={onRemoveCoupon}
                          className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Enter Promo Code (e.g. SUPERFAST)"
                            className="flex-1 px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl font-mono uppercase focus:bg-white focus:outline-emerald-600"
                          />
                          <button
                            onClick={() => handleApplyCouponClick(couponInput)}
                            className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 rounded-xl transition cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <div className="text-[11px] text-rose-600 font-medium">{couponError}</div>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {coupons.slice(0, 3).map((cp) => (
                            <button
                              key={cp.code}
                              onClick={() => handleApplyCouponClick(cp.code)}
                              className="text-[10px] font-bold bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-stone-700 border border-stone-200 px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 font-mono"
                            >
                              <Tag className="w-3 h-3 text-emerald-600" />
                              <span>{cp.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
                      <span>Payment Method</span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>100% Encrypted & Safe</span>
                      </span>
                    </div>

                    {/* Main Categories Tabs */}
                    <div className="grid grid-cols-5 gap-1.5 text-[11px] font-semibold">
                      <button
                        onClick={() => setPaymentMethod("upi")}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          paymentMethod === "upi"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-extrabold shadow-2xs"
                            : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-emerald-700" />
                        <span className="truncate">UPI / Apps</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          paymentMethod === "card"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-extrabold shadow-2xs"
                            : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-emerald-700" />
                        <span className="truncate">Cards</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("netbanking")}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          paymentMethod === "netbanking"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-extrabold shadow-2xs"
                            : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <span className="truncate">NetBank</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("wallet")}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          paymentMethod === "wallet"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-extrabold shadow-2xs"
                            : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <Wallet className="w-4 h-4 text-emerald-700" />
                        <span className="truncate">Wallet</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("cod")}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          paymentMethod === "cod"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-extrabold shadow-2xs"
                            : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <Banknote className="w-4 h-4 text-emerald-700" />
                        <span className="truncate">COD</span>
                      </button>
                    </div>

                    {/* Sub-Panel Details based on selected payment method */}
                    <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200 text-xs">
                      {paymentMethod === "upi" && (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: "gpay", label: "Google Pay", icon: "🟢" },
                              { id: "phonepe", label: "PhonePe", icon: "🟣" },
                              { id: "paytm", label: "Paytm UPI", icon: "🔵" },
                              { id: "qr", label: "Scan QR", icon: "📷" },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setUpiSubOption(opt.id as any)}
                                className={`p-2 rounded-xl border text-center font-bold text-[11px] transition cursor-pointer flex flex-col items-center gap-0.5 ${
                                  upiSubOption === opt.id
                                    ? "bg-emerald-100/70 border-emerald-500 text-emerald-950 shadow-2xs"
                                    : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                                }`}
                              >
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                              </button>
                            ))}
                          </div>

                          {/* UPI Options Card */}
                          <div className="bg-[#120f20] text-white p-3.5 rounded-2xl border border-white/10 text-center space-y-2.5 shadow-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                                    upiSubOption === "phonepe"
                                      ? "bg-[#5f259f]"
                                      : upiSubOption === "gpay"
                                      ? "bg-linear-to-tr from-blue-600 to-green-500"
                                      : upiSubOption === "paytm"
                                      ? "bg-[#002e6e]"
                                      : "bg-emerald-700"
                                  }`}
                                >
                                  {upiSubOption === "phonepe"
                                    ? "पे"
                                    : upiSubOption === "gpay"
                                    ? "G"
                                    : upiSubOption === "paytm"
                                    ? "Pay"
                                    : "UPI"}
                                </div>
                                <span className="text-xs font-extrabold text-white">
                                  {upiSubOption === "phonepe"
                                    ? "PhonePe Direct QR"
                                    : upiSubOption === "gpay"
                                    ? "Google Pay (Tez) UPI"
                                    : upiSubOption === "paytm"
                                    ? "Paytm Soundbox QR"
                                    : "Scan & Pay (All UPI)"}
                                </span>
                              </div>
                              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-stone-300 border border-white/10 font-mono">
                                {upiSubOption === "phonepe"
                                  ? "SBI • 6183"
                                  : upiSubOption === "gpay"
                                  ? "HDFC • 4402"
                                  : upiSubOption === "paytm"
                                  ? "Paytm • 9801"
                                  : "NPCI • UPI"}
                              </span>
                            </div>

                            <div
                              onClick={() => setIsPhonePeQrOpen(true)}
                              className="w-28 h-28 mx-auto bg-white rounded-xl p-2 border-2 border-purple-400/80 flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-transform shadow-lg group"
                              title="Click to expand high-resolution QR"
                            >
                              <QrCode className="w-20 h-20 text-stone-900" />
                              <div
                                className={`absolute inset-0 m-auto w-7 h-7 rounded-full border border-white flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                                  upiSubOption === "phonepe"
                                    ? "bg-[#5f259f]"
                                    : upiSubOption === "gpay"
                                    ? "bg-blue-600"
                                    : upiSubOption === "paytm"
                                    ? "bg-[#002e6e]"
                                    : "bg-emerald-700"
                                }`}
                              >
                                {upiSubOption === "phonepe"
                                  ? "पे"
                                  : upiSubOption === "gpay"
                                  ? "G"
                                  : upiSubOption === "paytm"
                                  ? "P"
                                  : "🍃"}
                              </div>
                              <span className="text-[8px] font-extrabold text-stone-900 uppercase tracking-tighter mt-0.5">
                                Tap to Expand
                              </span>
                            </div>

                            <div>
                              <p className="text-[11px] font-bold text-stone-200">
                                UPI ID: <span className="text-purple-300 font-mono">8688778104@ybl</span>
                              </p>
                              <p className="text-[10px] text-stone-400">
                                Order amount: <strong className="text-emerald-400">₹{grandTotal}</strong>
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <a
                                href={
                                  upiSubOption === "phonepe"
                                    ? `phonepe://pay?pa=8688778104@ybl&pn=Leaf%20Basket&am=${grandTotal}&cu=INR`
                                    : upiSubOption === "gpay"
                                    ? `tez://upi/pay?pa=8688778104@ybl&pn=Leaf%20Basket&am=${grandTotal}&cu=INR`
                                    : upiSubOption === "paytm"
                                    ? `paytmmp://pay?pa=8688778104@ybl&pn=Leaf%20Basket&am=${grandTotal}&cu=INR`
                                    : `upi://pay?pa=8688778104@ybl&pn=Leaf%20Basket&am=${grandTotal}&cu=INR`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-[11px] border border-white/10 flex items-center justify-center gap-1 transition"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Open App</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => setIsPhonePeQrOpen(true)}
                                className="py-2 bg-linear-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-bold text-[11px] shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Expand QR</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-600">Or Pay via Custom UPI ID</label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="e.g. 8688778104@ybl or user@okhdfcbank"
                                className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:outline-emerald-600"
                              />
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1.5 rounded-xl flex items-center">
                                Verified
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "card" && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-[11px] font-bold text-stone-700 mb-0.5 block">Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) =>
                                setCardNumber(
                                  e.target.value
                                    .replace(/\D/g, "")
                                    .replace(/(\d{4})/g, "$1 ")
                                    .trim()
                                    .slice(0, 19)
                                )
                              }
                              placeholder="4532 •••• •••• 8921"
                              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:outline-emerald-600"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-bold text-stone-700 mb-0.5 block">Valid Thru</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                                placeholder="MM/YY"
                                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-mono text-center focus:outline-emerald-600"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-stone-700 mb-0.5 block">CVV</label>
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                placeholder="•••"
                                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-mono text-center focus:outline-emerald-600"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-stone-700 mb-0.5 block">Cardholder Name</label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="Name on card"
                              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-emerald-600"
                            />
                          </div>
                        </div>
                      )}

                      {paymentMethod === "netbanking" && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-stone-700">Select Net Banking Bank</div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Other Bank"].map(
                              (bank) => (
                                <button
                                  key={bank}
                                  onClick={() => setSelectedBank(bank)}
                                  className={`p-2 rounded-xl border text-xs text-left font-bold transition cursor-pointer flex items-center justify-between ${
                                    selectedBank === bank
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                                      : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                                  }`}
                                >
                                  <span className="truncate">{bank}</span>
                                  {selectedBank === bank && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {paymentMethod === "wallet" && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-stone-700">Digital Wallets & Pay Later</div>
                          <div className="space-y-1.5">
                            {[
                              { name: "Leafbasket Wallet (₹500.00)", note: "Instant 1-click checkout" },
                              { name: "Paytm Balance Wallet", note: "Linked to registered mobile" },
                              { name: "Simpl / LazyPay (Pay in 15 days)", note: "0% interest pay later" },
                            ].map((w) => (
                              <button
                                key={w.name}
                                onClick={() => setSelectedWallet(w.name)}
                                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                                  selectedWallet === w.name
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                                    : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                                }`}
                              >
                                <div>
                                  <div className="text-xs font-bold">{w.name}</div>
                                  <div className="text-[10px] text-stone-500">{w.note}</div>
                                </div>
                                {selectedWallet === w.name && (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {paymentMethod === "cod" && (
                        <div className="flex items-center gap-3 p-2 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0">
                            💵
                          </div>
                          <div>
                            <div className="font-bold text-xs">Cash / UPI on Delivery</div>
                            <div className="text-[11px] text-emerald-800">
                              Pay ₹{grandTotal} in cash or scan rider's UPI QR code upon arrival at your doorstep.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Bill Details Breakdown */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                    <div className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-1">
                      Bill Summary
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Item Total</span>
                      <span className="font-medium">₹{itemTotal}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>10-Minute Delivery Fee</span>
                      <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Sanitised Pod Handling</span>
                      <span>₹{packagingFee}</span>
                    </div>
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-amber-800">
                        <span>Rider Tip</span>
                        <span>₹{tipAmount}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Coupon Discount ({appliedCoupon})</span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
                      <span>To Pay</span>
                      <span className="text-base text-emerald-800 font-['Outfit']">₹{grandTotal}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sticky Drawer Footer Checkout Button */}
            {cartItems.length > 0 && (
              <div className="p-3 sm:p-4 pb-safe bg-white border-t border-stone-200 shadow-lg">
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  id="place-order-checkout-button"
                  className="w-full bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm py-3 sm:py-3.5 px-3.5 sm:px-4 rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <div className="text-left">
                    <div className="text-[9px] sm:text-[10px] text-emerald-100 font-medium uppercase tracking-wider">
                      10-MIN HYPERFAST DISPATCH
                    </div>
                    <div className="text-sm sm:text-base font-black">₹{grandTotal} · Pay with {paymentMethod.toUpperCase()}</div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-950/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shrink-0">
                    <span>{isSubmitting ? "Placing..." : "Place Order"}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Live PhonePe / Multi-UPI QR Payment Modal */}
        <PhonePeQrModal
          isOpen={isPhonePeQrOpen}
          onClose={() => setIsPhonePeQrOpen(false)}
          amount={grandTotal}
          initialApp={upiSubOption === "qr" ? "phonepe" : (upiSubOption as any)}
          onPaymentSuccess={() => {
            setIsPhonePeQrOpen(false);
            handleCheckout();
          }}
        />
      </div>
    </AnimatePresence>
  );
};
