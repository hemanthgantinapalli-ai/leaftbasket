import React from "react";
import { Category } from "../types";
import {
  Apple,
  Milk,
  Cookie,
  CupSoda,
  Wheat,
  Pizza,
  Sparkles,
  Home,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Apple: <Apple className="w-5 h-5" />,
  Milk: <Milk className="w-5 h-5" />,
  Cookie: <Cookie className="w-5 h-5" />,
  CupSoda: <CupSoda className="w-5 h-5" />,
  Wheat: <Wheat className="w-5 h-5" />,
  Pizza: <Pizza className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 font-['Outfit'] tracking-tight flex items-center gap-2">
            <span>Explore Fresh Aisles</span>
            <span className="text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-sans">
              10-Min Fast Dispatch
            </span>
          </h2>
          <p className="text-xs text-stone-500">Pick from top categories sourced fresh every morning</p>
        </div>

        {selectedCategory !== "all" && (
          <button
            onClick={() => onSelectCategory("all")}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Show All Items
          </button>
        )}
      </div>

      {/* Categories Horizontal Carousel on Mobile / Grid on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {/* All Items Option */}
        <button
          onClick={() => onSelectCategory("all")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center cursor-pointer group ${
            selectedCategory === "all"
              ? "bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-900/20 scale-[1.02]"
              : "bg-white text-stone-700 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
              selectedCategory === "all" ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-700"
            }`}
          >
            <span className="text-lg">🌿</span>
          </div>
          <span className="text-xs font-bold leading-tight truncate w-full">All Aisles</span>
          <span
            className={`text-[10px] mt-0.5 ${
              selectedCategory === "all" ? "text-emerald-200" : "text-stone-400"
            }`}
          >
            Catalog
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center cursor-pointer group relative ${
                isSelected
                  ? "bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-900/20 scale-[1.02]"
                  : "bg-white text-stone-800 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40"
              }`}
            >
              {cat.isPopular && !isSelected && (
                <span className="absolute -top-1.5 right-2 bg-amber-400 text-emerald-950 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-2xs">
                  Hot
                </span>
              )}

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                  isSelected
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}
              >
                {ICON_MAP[cat.icon] || <Apple className="w-5 h-5" />}
              </div>

              <span className="text-xs font-bold leading-tight line-clamp-1 w-full text-center">
                {cat.name}
              </span>
              <span
                className={`text-[10px] truncate w-full ${
                  isSelected ? "text-emerald-200" : "text-stone-400"
                }`}
              >
                {cat.teluguName || cat.hindiName || `${cat.itemCount || 10}+ items`}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
