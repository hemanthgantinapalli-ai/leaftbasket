import React, { useState } from "react";
import { Product, ProductReview } from "../types";
import {
  X,
  Star,
  Clock,
  ShieldCheck,
  Leaf,
  Plus,
  Minus,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Filter,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, qty: number) => void;
  onOpenReviewModal?: (product: Product) => void;
  onOpenWriteReview?: (product: Product) => void;
  onVoteHelpful?: (productId: string, reviewId: string) => void;
  initialTab?: "overview" | "reviews";
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onOpenReviewModal,
  onVoteHelpful,
  initialTab = "overview",
}) => {
  if (!product) return null;

  const [activeImage, setActiveImage] = useState(product.image);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">(initialTab);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [votedHelpfulReviews, setVotedHelpfulReviews] = useState<Record<string, boolean>>({});

  const reviews: ProductReview[] = product.reviews || [];

  // Calculate rating breakdown distribution
  const totalReviews = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : stars >= 4 ? 45 : 5;
    return { stars, count, percentage };
  });

  const filteredReviews = reviews.filter((r) => {
    if (starFilter !== null && Math.round(r.rating) !== starFilter) return false;
    if (verifiedOnly && !r.verifiedPurchase) return false;
    return true;
  });

  const handleVoteHelpful = (reviewId: string) => {
    if (votedHelpfulReviews[reviewId]) return;
    setVotedHelpfulReviews((prev) => ({ ...prev, [reviewId]: true }));
    if (onVoteHelpful) {
      onVoteHelpful(product.id, reviewId);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recently verified";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Verified recent";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-stone-200 relative my-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100/90 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Navigation Tab Bar */}
          <div className="bg-stone-100/90 px-3 sm:px-5 pt-3 border-b border-stone-200 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-extrabold border-b-2 transition cursor-pointer ${
                activeTab === "overview"
                  ? "border-emerald-700 text-emerald-800"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              🌿 Overview & Details
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-extrabold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "border-emerald-700 text-emerald-800"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <span>⭐ Customer Reviews</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {product.reviewsCount}
              </span>
            </button>
          </div>

          {activeTab === "overview" ? (
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Gallery Column */}
              <div className="p-5 sm:p-6 bg-stone-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200">
                <div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-stone-200 relative flex items-center justify-center shadow-inner">
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.badge && (
                      <div className="absolute bottom-3 left-3 bg-emerald-900/90 text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs">
                        {product.badge}
                      </div>
                    )}
                  </div>

                  {/* Additional gallery thumbnails */}
                  {product.gallery && product.gallery.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {product.gallery.map((imgUrl, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(imgUrl)}
                          className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                            activeImage === imgUrl ? "border-emerald-600" : "border-stone-200 opacity-70"
                          }`}
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-stone-200 text-xs text-stone-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Delivered in <strong>{product.deliveryTimeMinutes || 10} minutes</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Triple-layer ozonated sanitised & quality checked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Origin: <strong>{product.origin || "Local Karnataka Organic Co-op"}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Column */}
              <div className="p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {product.unit}
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-['Outfit'] leading-snug">
                    {product.name}
                  </h2>

                  {(product.teluguName || product.hindiName) && (
                    <p className="text-xs sm:text-sm font-semibold text-stone-500 mt-0.5">
                      {product.teluguName || product.hindiName}
                    </p>
                  )}

                  {/* Rating Clickable Bar */}
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="flex items-center gap-2 mt-2.5 group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 bg-emerald-50 group-hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-emerald-200 transition">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-stone-500 group-hover:text-emerald-700 underline underline-offset-2">
                      ({product.reviewsCount} verified reviews)
                    </span>
                  </button>

                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      Description
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-700 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Nutritional Facts */}
                  {product.nutritionalInfo && (
                    <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                      <h4 className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                        Nutritional Value (Per 100g)
                      </h4>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white p-1.5 rounded-xl border border-stone-200">
                          <div className="font-extrabold text-stone-900 text-xs sm:text-sm">
                            {product.nutritionalInfo.calories || "18 kcal"}
                          </div>
                          <div className="text-[10px] text-stone-400">Energy</div>
                        </div>
                        <div className="bg-white p-1.5 rounded-xl border border-stone-200">
                          <div className="font-extrabold text-stone-900 text-xs sm:text-sm">
                            {product.nutritionalInfo.protein || "0.9g"}
                          </div>
                          <div className="text-[10px] text-stone-400">Protein</div>
                        </div>
                        <div className="bg-white p-1.5 rounded-xl border border-stone-200">
                          <div className="font-extrabold text-stone-900 text-xs sm:text-sm">
                            {product.nutritionalInfo.carbs || "3.9g"}
                          </div>
                          <div className="text-[10px] text-stone-400">Carbs</div>
                        </div>
                        <div className="bg-white p-1.5 rounded-xl border border-stone-200">
                          <div className="font-extrabold text-stone-900 text-xs sm:text-sm">
                            {product.nutritionalInfo.fat || "0.2g"}
                          </div>
                          <div className="text-[10px] text-stone-400">Fats</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-stone-500">Price</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-stone-900 font-['Outfit']">
                        ₹{product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-stone-400 line-through font-medium">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {cartQuantity === 0 ? (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm py-3 px-6 rounded-2xl shadow-lg shadow-emerald-700/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Add to Basket</span>
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center bg-emerald-800 text-white rounded-2xl p-1 shadow-md">
                      <button
                        onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                        className="p-2 hover:bg-emerald-900 rounded-xl transition cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 sm:px-4 font-extrabold text-sm sm:text-base min-w-9 text-center">
                        {cartQuantity} in Basket
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                        className="p-2 hover:bg-emerald-900 rounded-xl transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Ratings & Reviews Tab View */
            <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Reviews Summary Card */}
              <div className="p-5 bg-linear-to-br from-stone-50 to-emerald-50/40 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-emerald-200 shadow-sm flex flex-col items-center justify-center shrink-0">
                    <span className="text-3xl font-black text-stone-900 font-['Outfit'] leading-none">
                      {product.rating.toFixed(1)}
                    </span>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= Math.round(product.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-stone-900 font-['Outfit']">
                      Customer Ratings & Reviews
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Based on {product.reviewsCount} verified purchase deliveries
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>96% of shoppers recommend this item</span>
                    </div>
                  </div>
                </div>

                {onOpenReviewModal && (
                  <button
                    onClick={() => onOpenReviewModal(product)}
                    className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>✍️ Write a Review</span>
                  </button>
                )}
              </div>

              {/* Rating Bars Distribution */}
              <div className="space-y-1.5 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                <div className="text-xs font-bold text-stone-600 mb-2">Rating Breakdown</div>
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <button
                    key={stars}
                    onClick={() => setStarFilter(starFilter === stars ? null : stars)}
                    className={`w-full flex items-center gap-2 text-xs transition p-1 rounded-lg cursor-pointer ${
                      starFilter === stars ? "bg-emerald-100/70 font-bold" : "hover:bg-stone-100"
                    }`}
                  >
                    <span className="w-12 font-bold text-stone-700 flex items-center gap-1">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stars >= 4 ? "bg-emerald-600" : stars === 3 ? "bg-yellow-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-stone-500 text-[11px]">{percentage}%</span>
                  </button>
                ))}
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-stone-500 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                <button
                  onClick={() => setStarFilter(null)}
                  className={`text-xs font-bold px-3 py-1 rounded-full border transition cursor-pointer ${
                    starFilter === null
                      ? "bg-emerald-800 text-white border-emerald-800"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  All Stars
                </button>
                {[5, 4, 3, 2, 1].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStarFilter(starFilter === s ? null : s)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                      starFilter === s
                        ? "bg-emerald-800 text-white border-emerald-800"
                        : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <span>{s}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </button>
                ))}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl">
                      ⭐
                    </div>
                    <h4 className="text-sm font-bold text-stone-800">
                      {starFilter
                        ? `No ${starFilter}-star reviews yet.`
                        : "Be the first to review this freshly harvested item!"}
                    </h4>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      Share your experience on taste, delivery speed, and freshness with our community.
                    </p>
                    {onOpenReviewModal && (
                      <button
                        onClick={() => onOpenReviewModal(product)}
                        className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Write First Review</span>
                      </button>
                    )}
                  </div>
                ) : (
                  filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-stone-50/70 hover:bg-stone-50 rounded-2xl border border-stone-200/90 transition space-y-2.5"
                    >
                      {/* Review Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-emerald-700 to-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                            {rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-stone-900">
                                {rev.userName}
                              </span>
                              {rev.verifiedPurchase && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                                  <span>Verified Buyer</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              {formatDate(rev.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Star Rating Display */}
                        <div className="flex items-center gap-0.5 bg-white px-2 py-1 rounded-lg border border-stone-200">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Title & Body */}
                      {rev.title && (
                        <h5 className="text-xs sm:text-sm font-extrabold text-stone-900">
                          {rev.title}
                        </h5>
                      )}
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Tags chips */}
                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rev.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Helpful Button */}
                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-stone-400">Was this review helpful?</span>
                        <button
                          onClick={() => handleVoteHelpful(rev.id)}
                          disabled={votedHelpfulReviews[rev.id]}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            votedHelpfulReviews[rev.id]
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 cursor-default"
                              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-emerald-800"
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3 h-3 ${
                              votedHelpfulReviews[rev.id] ? "fill-emerald-700 text-emerald-700" : ""
                            }`}
                          />
                          <span>
                            Helpful ({(rev.helpfulCount || 0) + (votedHelpfulReviews[rev.id] ? 1 : 0)})
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
