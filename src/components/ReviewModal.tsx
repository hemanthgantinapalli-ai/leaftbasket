import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Tag,
  ThumbsUp,
  MessageSquare,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { UserProfile } from "./UserProfileModal";

interface ReviewItemTarget {
  id: string;
  name: string;
  image: string;
  unit?: string;
  price?: number;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct: ReviewItemTarget | null;
  currentUser: UserProfile | null;
  onSubmitReview: (
    productId: string,
    reviewData: {
      userName: string;
      rating: number;
      title: string;
      comment: string;
      verifiedPurchase: boolean;
      tags: string[];
    }
  ) => Promise<void>;
}

const RATING_DESCRIPTIONS: Record<number, { title: string; color: string; bg: string }> = {
  1: { title: "Poor Quality / Damaged 👎", color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  2: { title: "Below Expectations 😐", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  3: { title: "Average / Acceptable 👌", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  4: { title: "Very Good & Fresh 🌱", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  5: { title: "Outstanding & Farm Fresh! 🌟", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
};

const SUGGESTED_TAGS = [
  "🌱 100% Farm Fresh",
  "⚡ Superfast 10-Min Delivery",
  "👌 Crisp & Juicy",
  "📦 Chilled Cooling Pod",
  "✨ Superb Aroma",
  "🥑 Perfectly Ripe",
  "💰 Value for Money",
  "🌿 Chemical-Free",
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  targetProduct,
  currentUser,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState<string>(currentUser?.name || "Priya Sharma");
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["🌱 100% Farm Fresh"]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (currentUser?.name) {
      setReviewerName(currentUser.name);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMsg("");
      setRating(5);
      setHoverRating(null);
      setTitle("");
      setComment("");
      setSelectedTags(["🌱 100% Farm Fresh"]);
    }
  }, [isOpen, targetProduct]);

  if (!isOpen || !targetProduct) return null;

  const activeRating = hoverRating || rating;
  const ratingInfo = RATING_DESCRIPTIONS[activeRating] || RATING_DESCRIPTIONS[5];

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg("Please write a few words about your experience with this item.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      await onSubmitReview(targetProduct.id, {
        userName: reviewerName.trim() || "Verified Customer",
        rating,
        title: title.trim() || (rating >= 4 ? "Great farm fresh quality!" : "Product feedback"),
        comment: comment.trim(),
        verifiedPurchase: true,
        tags: selectedTags,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || "Failed to submit review. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-transparent"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 35 }}
          className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden z-10 max-h-[92vh] sm:max-h-[85vh] flex flex-col my-0 sm:my-4"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

          {/* Header Banner */}
          <div className="p-3.5 sm:p-5 bg-linear-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 text-lg shadow-inner shrink-0">
                ⭐
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold font-['Outfit'] text-white">
                  Rate & Review Product
                </h3>
                <p className="text-[11px] sm:text-xs text-emerald-200">
                  Help local Bangalore shoppers choose the freshest harvest
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl">
                ✨
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 font-['Outfit']">
                Thank You for Your Review!
              </h3>
              <p className="text-sm text-stone-600 max-w-xs mx-auto">
                Your verified rating and review have been published to the product catalog.
              </p>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Buyer Feedback Recorded</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              {/* Product Info Preview */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                <img
                  src={targetProduct.image}
                  alt={targetProduct.name}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Purchased Item
                  </div>
                  <h4 className="text-sm font-extrabold text-stone-900 truncate">
                    {targetProduct.name}
                  </h4>
                  <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                    {targetProduct.unit && <span>{targetProduct.unit}</span>}
                    {targetProduct.price && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-stone-800">₹{targetProduct.price}</span>
                      </>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      <span>Verified Order</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Star Rating Interactive Selector */}
              <div className="text-center space-y-2">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= activeRating;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                        title={`${starVal} Star${starVal > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                              : "text-stone-300 stroke-1"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Rating Label */}
                <div
                  className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold border transition-all ${ratingInfo.bg} ${ratingInfo.color}`}
                >
                  {ratingInfo.title}
                </div>
              </div>

              {/* Quick Feedback Tags */}
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2">
                  What did you like the most? (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-800 text-white border-emerald-800 shadow-2xs"
                            : "bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Headline & Detailed Comment */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Crisp, sweet and delivered fresh in 10 mins!"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-emerald-600 focus:bg-white transition"
                    maxLength={100}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-700">
                      Your Comments & Experience <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-400">{comment.length}/500</span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was the freshness, taste, ripeness, or packaging? Did it meet your expectations for 10-minute dispatch?"
                    rows={3}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-emerald-600 focus:bg-white transition resize-none"
                    maxLength={500}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-emerald-600 focus:bg-white transition"
                    maxLength={40}
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 ${
                    isSubmitting || !comment.trim()
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/25 active:scale-95"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Posting Review...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
