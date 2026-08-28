import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  voteReviewHelpful,
  getCategories,
  getOrders,
  getOrderById,
  createOrder,
  assignOrderRider,
  updateOrderStatus,
  updateOrderRiderLocation,
  getCoupons,
  getRiders,
  updateUserProfile,
  getUsers,
  setUserBlocked,
  deleteUser,
  updateAdminProfile,
  updateRiderProfile,
  registerRider,
  approveRider,
  updateRiderAvailability,
  setRiderBlocked,
  deleteRider,
  isMongoActive,
  seedMongoIfEmpty,
} from "../store.js";
import { connectDB, getDBStatus } from "../db.js";
import { GoogleGenAI, Type } from "@google/genai";

export const apiRouter = express.Router();

// System & DB Diagnostic status
apiRouter.get("/status", (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    app: "Leafbasket MERN Backend",
    version: "2.0.0",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Configure or test MongoDB URI at runtime
apiRouter.post("/config/mongo-uri", async (req, res) => {
  const { uri } = req.body;
  if (!uri) {
    return res.status(400).json({ error: "Missing 'uri' in request body" });
  }

  const result = await connectDB(uri);
  if (result.isConnected) {
    await seedMongoIfEmpty();
  }

  res.json({
    success: result.success,
    message: result.message,
    status: getDBStatus(),
  });
});

// Products routes
apiRouter.get("/products", async (req, res) => {
  try {
    const { category, search, tag } = req.query as { category?: string; search?: string; tag?: string };
    const products = await getProducts(category, search, tag);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch products" });
  }
});

apiRouter.get("/products/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch product" });
  }
});

apiRouter.post("/products", async (req, res) => {
  try {
    const created = await createProduct(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create product" });
  }
});

apiRouter.put("/products/:id", async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Product not found to update" });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update product" });
  }
});

apiRouter.delete("/products/:id", async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true, message: `Product ${req.params.id} removed` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete product" });
  }
});

// Product Reviews & Ratings routes
apiRouter.post("/products/:id/reviews", async (req, res) => {
  try {
    const { userName, rating, title, comment, verifiedPurchase, tags } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: "Review comment is required" });
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
    }

    const result = await addProductReview(req.params.id, {
      userName: userName?.trim() || "Verified Buyer",
      rating: numRating,
      title: title?.trim(),
      comment: comment.trim(),
      verifiedPurchase: verifiedPurchase !== false,
      tags: tags || [],
    });

    if (!result) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit review" });
  }
});

apiRouter.post("/products/:id/reviews/:reviewId/helpful", async (req, res) => {
  try {
    const result = await voteReviewHelpful(req.params.id, req.params.reviewId);
    if (!result.success) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to vote review helpful" });
  }
});

// Categories routes
apiRouter.get("/categories", async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch categories" });
  }
});

// Orders routes
apiRouter.get("/orders", async (req, res) => {
  try {
    const { phone } = req.query as { phone?: string };
    const orders = await getOrders(phone);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch orders" });
  }
});

apiRouter.get("/orders/:id", async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch order" });
  }
});

apiRouter.put("/users/:id", async (req, res) => {
  try {
    const updated = await updateUserProfile(req.params.id, req.body);
    if (!updated) return res.status(400).json({ error: "Name and phone are required" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update profile" });
  }
});

apiRouter.get("/users", async (_req, res) => {
  res.json(await getUsers());
});

apiRouter.patch("/users/:id/block", async (req, res) => {
  const updated = await setUserBlocked(req.params.id, req.body.blocked === true);
  if (!updated) return res.status(404).json({ error: "User not found" });
  res.json(updated);
});

apiRouter.delete("/users/:id", async (req, res) => {
  const deleted = await deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found" });
  res.json({ success: true });
});

apiRouter.put("/admins/:id", async (req, res) => {
  try {
    const updated = await updateAdminProfile(req.params.id, req.body);
    if (!updated) return res.status(400).json({ error: "Name, email, and hub are required" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update administrator profile" });
  }
});

apiRouter.put("/riders/:id/profile", async (req, res) => {
  try {
    const updated = await updateRiderProfile(req.params.id, req.body);
    if (!updated) return res.status(400).json({ error: "Name, phone, and vehicle are required" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update rider profile" });
  }
});

apiRouter.post("/orders", async (req, res) => {
  try {
    const { items, customerName, customerPhone, deliveryAddress, paymentMethod, couponCode, tipAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    const itemTotal = items.reduce((sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    const packagingFee = 5;
    const deliveryFee = itemTotal >= 199 ? 0 : 25;
    let couponDiscount = 0;

    if (couponCode) {
      const coupons = await getCoupons();
      const matched = coupons.find((c: any) => c.code.toUpperCase() === String(couponCode).toUpperCase() && c.isActive);
      if (matched && itemTotal >= matched.minOrderAmount) {
        couponDiscount = Math.min(Math.round((itemTotal * matched.discountPercentage) / 100), matched.maxDiscount);
      }
    }

    const totalAmount = Math.max(0, itemTotal + packagingFee + deliveryFee + (Number(tipAmount) || 0) - couponDiscount);

    const orderPayload = {
      customerName: customerName || "Valued Customer",
      customerPhone: customerPhone || "+91 98450 12345",
      deliveryAddress: deliveryAddress || {
        street: "12th Main, 100 Feet Rd",
        flat: "302",
        area: "Indiranagar",
        city: "Bengaluru",
        pincode: "560038",
        lat: 12.9716,
        lng: 77.6412,
      },
      items,
      itemTotal,
      packagingFee,
      deliveryFee,
      tipAmount: Number(tipAmount) || 0,
      couponDiscount,
      couponCode: couponCode || undefined,
      totalAmount,
      paymentMethod: paymentMethod || "upi",
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    };

    const newOrder = await createOrder(orderPayload);
    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
});

apiRouter.patch("/orders/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Missing 'status' in request body" });
    }
    const updated = await updateOrderStatus(req.params.id, status, note);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update status" });
  }
});

apiRouter.patch("/orders/:id/assign", async (req, res) => {
  try {
    const { riderId } = req.body;
    if (!riderId) return res.status(400).json({ error: "Missing 'riderId' in request body" });
    const updated = await assignOrderRider(req.params.id, riderId);
    if (!updated) return res.status(404).json({ error: "Order or rider not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to assign rider" });
  }
});

apiRouter.patch("/orders/:id/location", async (req, res) => {
  try {
    const { lat, lng, etaMinutes } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "Invalid lat/lng" });
    }
    const updated = await updateOrderRiderLocation(req.params.id, lat, lng, etaMinutes);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update location" });
  }
});

// Coupons routes
apiRouter.get("/coupons", async (req, res) => {
  try {
    const coupons = await getCoupons();
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch coupons" });
  }
});

// Riders routes
apiRouter.get("/riders", async (req, res) => {
  try {
    const riders = await getRiders();
    res.json(riders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch riders" });
  }
});

apiRouter.post("/riders/register", async (req, res) => {
  const created = await registerRider(req.body);
  if (!created) return res.status(400).json({ error: "Name, phone, vehicle, and a 4-digit PIN are required" });
  res.status(201).json(created);
});

apiRouter.patch("/riders/:id/approve", async (req, res) => {
  const updated = await approveRider(req.params.id);
  if (!updated) return res.status(404).json({ error: "Rider not found" });
  res.json(updated);
});

apiRouter.patch("/riders/:id/availability", async (req, res) => {
  const updated = await updateRiderAvailability(req.params.id, req.body.online === true);
  if (!updated) return res.status(404).json({ error: "Approved rider not found" });
  res.json(updated);
});

apiRouter.patch("/riders/:id/block", async (req, res) => {
  const updated = await setRiderBlocked(req.params.id, req.body.blocked === true);
  if (!updated) return res.status(404).json({ error: "Rider not found" });
  res.json(updated);
});

apiRouter.delete("/riders/:id", async (req, res) => {
  const deleted = await deleteRider(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Rider not found" });
  res.json({ success: true });
});

// AI Smart Grocery & Recipe Assistant
apiRouter.post("/ai/recipe-assist", async (req, res) => {
  const { prompt, mealType } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback smart bundle response
    return res.json({
      recipeTitle: "Farm Fresh Garden Stir-Fry & Rice",
      prepTime: "15 mins",
      servings: "2-3",
      suggestedItems: ["prod-tomato-hybrid", "prod-coriander-mint-pack", "prod-daawat-basmati-rice", "prod-avocado-hass"],
      summary: "A quick, nourishing meal prepared with farm-fresh tomatoes, fresh herbs, and fragrant aged basmati rice.",
      steps: [
        "Rinse and boil the aged Basmati rice with a pinch of salt.",
        "Dice ripe hybrid tomatoes and sauté with sliced herbs in olive oil.",
        "Toss together and garnish with creamy sliced avocado and fresh mint leaves.",
      ],
      estimatedCost: 334,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are Leafbasket's Executive AI Chef. Given the user's craving: "${prompt}" (Meal: ${mealType || 'Dinner'}), suggest a quick 10-15 minute recipe using fresh grocery ingredients.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeTitle: { type: Type.STRING, description: "Name of the dish or recipe" },
            prepTime: { type: Type.STRING, description: "Preparation & cook time like '15 mins'" },
            servings: { type: Type.STRING, description: "Serving yield like '2-3'" },
            summary: { type: Type.STRING, description: "Short appetizing description" },
            suggestedItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Product keywords or grocery names",
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step by step quick cooking instructions",
            },
            estimatedCost: { type: Type.NUMBER, description: "Estimated total grocery cost in INR" },
          },
          required: ["recipeTitle", "prepTime", "servings", "summary", "suggestedItems", "steps", "estimatedCost"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (e: any) {
    console.warn("Gemini API recipe assist error:", e.message);
    res.json({
      recipeTitle: "Mediterranean Fresh Salad & Sourdough Platter",
      prepTime: "10 mins",
      servings: "2",
      suggestedItems: ["prod-sourdough-bread", "prod-tomato-hybrid", "prod-avocado-hass", "prod-greek-yogurt-berries"],
      summary: "Crisp toasted sourdough topped with mashed ripe avocado, diced juicy tomatoes, and chilled Greek yogurt on the side.",
      steps: [
        "Toast the country sourdough slices until golden and crisp.",
        "Mash ripe Hass avocado with salt, pepper, and freshly squeezed lemon.",
        "Top toast with chopped farm tomatoes and coriander leaves.",
      ],
      estimatedCost: 348,
    });
  }
});
