import React, { useState } from "react";
import { Product } from "../types";
import { askAIChef } from "../services/api";
import {
  Sparkles,
  X,
  ChefHat,
  Clock,
  Plus,
  CheckCircle2,
  ArrowRight,
  Utensils,
  Lightbulb,
} from "lucide-react";

interface AIChefAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddMultipleToCart: (products: Product[]) => void;
}

export const AIChefAssistant: React.FC<AIChefAssistantProps> = ({
  isOpen,
  onClose,
  products,
  onAddMultipleToCart,
}) => {
  const [prompt, setPrompt] = useState("");
  const [mealType, setMealType] = useState("Dinner");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [addedAll, setAddedAll] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (queryText?: string) => {
    const text = queryText || prompt;
    if (!text.trim()) return;

    setLoading(true);
    setRecipe(null);
    setAddedAll(false);

    try {
      const data = await askAIChef(text, mealType);
      setRecipe(data);
    } catch (err: any) {
      alert("Error generating recipe: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestedItems = () => {
    if (!recipe) return;
    
    // Find matching products from catalog
    const matchedProducts: Product[] = [];
    if (Array.isArray(recipe.suggestedItems)) {
      recipe.suggestedItems.forEach((keywordOrId: string) => {
        const prod = products.find(
          (p) =>
            p.id === keywordOrId ||
            p.name.toLowerCase().includes(keywordOrId.toLowerCase()) ||
            (p.tags && p.tags.some((t) => keywordOrId.toLowerCase().includes(t.toLowerCase())))
        );
        if (prod && !matchedProducts.some((mp) => mp.id === prod.id)) {
          matchedProducts.push(prod);
        }
      });
    }

    // Fallback if none matched: add 2 top fresh products
    if (matchedProducts.length === 0) {
      matchedProducts.push(...products.slice(0, 3));
    }

    onAddMultipleToCart(matchedProducts);
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 3000);
  };

  const suggestions = [
    "Healthy avocado sourdough breakfast in 5 mins",
    "Rich tomato basil pasta for date night",
    "High-protein post-workout smoothie bowl",
    "Authentic homestyle Dal Tadka and Basmati rice",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-2xl">
            👨‍🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-stone-900 font-['Outfit']">
                Leafbasket AI Chef
              </h2>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Gemini 2.5
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Tell me what you're craving, and I'll assemble the exact 10-minute grocery basket!
            </p>
          </div>
        </div>

        {/* Search / Prompt Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Quick high protein breakfast under 15 mins..."
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:outline-emerald-600"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{loading ? "Chef Cooking..." : "Generate"}</span>
            </button>
          </div>

          {/* Quick prompt ideas */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Quick Recipe Ideas:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrompt(s);
                    handleGenerate(s);
                  }}
                  className="text-[11px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition cursor-pointer text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Result Card */}
        {recipe && (
          <div className="mt-5 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                  {recipe.prepTime || "10 mins"} Prep
                </span>
                <h3 className="text-base font-extrabold text-stone-900 font-['Outfit'] mt-1">
                  {recipe.recipeTitle}
                </h3>
                <p className="text-xs text-stone-600 mt-1">{recipe.summary}</p>
              </div>
            </div>

            {/* Steps */}
            {recipe.steps && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Preparation Steps:
                </div>
                <ol className="list-decimal list-inside text-xs text-stone-700 space-y-1 pl-1">
                  {recipe.steps.map((st: string, idx: number) => (
                    <li key={idx}>{st}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Add Bundle Button */}
            <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-stone-500">Estimated Total</div>
                <div className="text-sm font-extrabold text-emerald-900">
                  ₹{recipe.estimatedCost || 299}
                </div>
              </div>

              <button
                onClick={handleAddSuggestedItems}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                {addedAll ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add All Ingredients to Basket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
