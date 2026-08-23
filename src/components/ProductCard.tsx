import React from "react";
import { Product } from "../types";
import { Plus, Minus, Star, Clock, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onOpenDetail: (product: Product) => void;
  onOpenReviews?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetail,
  onOpenReviews,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-300 hover:shadow-lg shadow-xs overflow-hidden flex flex-col justify-between group transition-all"
    >
      {/* Product Image Area */}
      <div className="relative p-2 sm:p-3 pb-0 cursor-pointer" onClick={() => onOpenDetail(product)}>
        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
            {product.discountPercentage}% OFF
          </div>
        )}

        {/* ETA & Flash Pill */}
        <div className="absolute bottom-2 left-3 sm:left-4 z-10 bg-white/95 backdrop-blur-xs text-stone-800 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-2xs border border-stone-200/80 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
          <span>{product.deliveryTimeMinutes || 10} MINS</span>
        </div>

        {/* Image Container with zoom effect */}
        <div className="aspect-square w-full rounded-xl bg-stone-50 overflow-hidden relative flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.isOrganic && (
            <div className="absolute top-2 right-2 bg-amber-100 text-amber-900 border border-amber-300/60 text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded">
              🌱 Organic
            </div>
          )}
        </div>
      </div>

      {/* Product Info Content */}
      <div className="p-2.5 sm:p-3 pt-2 sm:pt-2.5 flex-1 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={() => onOpenDetail(product)}>
          {/* Unit info */}
          <div className="text-[10px] sm:text-[11px] font-semibold text-stone-500 mb-0.5">{product.unit}</div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors font-['Plus_Jakarta_Sans']">
            {product.name}
          </h3>

          {/* Telugu / Local name if present */}
          {(product.teluguName || product.hindiName) && (
            <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate mt-0.5">
              {product.teluguName || product.hindiName}
            </div>
          )}

          {/* Rating */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 cursor-pointer group/rating hover:opacity-90 transition"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenReviews) {
                onOpenReviews(product);
              } else {
                onOpenDetail(product);
              }
            }}
            title="Click to view ratings and reviews"
          >
            <div className="flex items-center gap-0.5 bg-emerald-50 group-hover/rating:bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 group-hover/rating:border-emerald-300 transition">
              <Star className="w-2.5 h-2.5 fill-emerald-700 text-emerald-700" />
              <span>{typeof product.rating === "number" ? product.rating.toFixed(1) : "4.8"}</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-stone-400 group-hover/rating:text-emerald-700 group-hover/rating:underline">
              ({product.reviewsCount ?? (product.reviews ? product.reviews.length : 0)})
            </span>
          </div>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-stone-100 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-extrabold text-stone-900">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through font-medium">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <div className="text-[9px] sm:text-[10px] text-emerald-700 font-medium truncate">10-Min Fast</div>
          </div>

          {/* Add / Stepper Button */}
          {cartQuantity === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              id={`add-btn-${product.id}`}
              className="bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 hover:border-emerald-600 font-extrabold text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer uppercase tracking-wider shrink-0"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-emerald-800 text-white rounded-xl shadow-xs overflow-hidden shrink-0">
              <button
                onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                className="w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center hover:bg-emerald-900 transition-colors cursor-pointer"
                title="Decrease"
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <span className="px-1 sm:px-1.5 text-xs font-extrabold min-w-[18px] text-center">
                {cartQuantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                className="w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center hover:bg-emerald-900 transition-colors cursor-pointer"
                title="Increase"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
