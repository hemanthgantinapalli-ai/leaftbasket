import { Product, Category, Order, Coupon, Rider, DatabaseStatus, ProductReview } from "../types";
import { UserProfile } from "../components/UserProfileModal";

const BASE_URL = "/api";

export async function fetchDBStatus(): Promise<DatabaseStatus> {
  const res = await fetch(`${BASE_URL}/status`);
  if (!res.ok) throw new Error("Failed to fetch database status");
  const data = await res.json();
  return data.database;
}

export async function updateUserProfile(userId: string, profile: {
  name: string;
  phone: string;
  email?: string;
  savedAddresses?: string[];
  previousPhone?: string;
}): Promise<typeof profile & { id: string }> {
  const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update profile");
  }
  return res.json();
}

export async function fetchUsers(): Promise<UserProfile[]> {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function setUserBlocked(userId: string, blocked: boolean): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}/block`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blocked }) });
  if (!res.ok) throw new Error("Failed to update user access");
  return res.json();
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function updateAdminProfile(adminId: string, profile: { name: string; email: string; hub: string; role: string }) {
  const res = await fetch(`${BASE_URL}/admins/${encodeURIComponent(adminId)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
  if (!res.ok) throw new Error("Failed to update administrator profile");
  return res.json();
}

export async function updateRiderProfile(riderId: string, profile: { name: string; phone: string; vehicleNumber: string; hub: string }) {
  const res = await fetch(`${BASE_URL}/riders/${encodeURIComponent(riderId)}/profile`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
  if (!res.ok) throw new Error("Failed to update rider profile");
  return res.json();
}

export async function registerRider(profile: { name: string; phone: string; vehicleNumber: string; hub: string; pin: string }): Promise<Rider> {
  const res = await fetch(`${BASE_URL}/riders/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
  if (!res.ok) throw new Error("Failed to register rider");
  return res.json();
}

export async function approveRider(riderId: string): Promise<Rider> {
  const res = await fetch(`${BASE_URL}/riders/${encodeURIComponent(riderId)}/approve`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to approve rider");
  return res.json();
}

export async function updateRiderAvailability(riderId: string, online: boolean): Promise<Rider> {
  const res = await fetch(`${BASE_URL}/riders/${encodeURIComponent(riderId)}/availability`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ online }) });
  if (!res.ok) throw new Error("Failed to update rider availability");
  return res.json();
}

export async function setRiderBlocked(riderId: string, blocked: boolean): Promise<Rider> {
  const res = await fetch(`${BASE_URL}/riders/${encodeURIComponent(riderId)}/block`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blocked }) });
  if (!res.ok) throw new Error("Failed to update rider access");
  return res.json();
}

export async function deleteRider(riderId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/riders/${encodeURIComponent(riderId)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete rider");
}

export async function configureMongoURI(uri: string): Promise<{ success: boolean; message: string; status: DatabaseStatus }> {
  const res = await fetch(`${BASE_URL}/config/mongo-uri`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uri }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to configure MongoDB URI");
  }
  return res.json();
}

export async function fetchProducts(params?: { category?: string; search?: string; tag?: string }): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  if (params?.tag) query.set("tag", params.tag);

  const res = await fetch(`${BASE_URL}/products?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
}

export async function submitProductReview(
  productId: string,
  reviewData: {
    userName: string;
    rating: number;
    title?: string;
    comment: string;
    verifiedPurchase?: boolean;
    tags?: string[];
  }
): Promise<{ product: Product; review: ProductReview }> {
  const res = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to submit review");
  }
  return res.json();
}

export async function voteReviewHelpful(productId: string, reviewId: string): Promise<{ success: boolean; helpfulCount: number }> {
  const res = await fetch(`${BASE_URL}/products/${productId}/reviews/${reviewId}/helpful`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to vote helpful");
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchOrders(phone?: string): Promise<Order[]> {
  const url = phone ? `${BASE_URL}/orders?phone=${encodeURIComponent(phone)}` : `${BASE_URL}/orders`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function placeOrder(orderData: any): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error("Failed to place order");
  return res.json();
}

export async function updateOrderStatus(orderId: string, status: string, note?: string, otp?: string): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note, otp }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

export async function assignOrderRider(orderId: string, riderId: string): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ riderId }),
  });
  if (!res.ok) throw new Error("Failed to assign rider");
  return res.json();
}

export async function updateOrderLocation(orderId: string, lat: number, lng: number, etaMinutes?: number): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/location`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, etaMinutes }),
  });
  if (!res.ok) throw new Error("Failed to update rider location");
  return res.json();
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const res = await fetch(`${BASE_URL}/coupons`);
  if (!res.ok) throw new Error("Failed to fetch coupons");
  return res.json();
}

export async function fetchRiders(): Promise<Rider[]> {
  const res = await fetch(`${BASE_URL}/riders`);
  if (!res.ok) throw new Error("Failed to fetch riders");
  return res.json();
}

export async function askAIChef(prompt: string, mealType?: string) {
  const res = await fetch(`${BASE_URL}/ai/recipe-assist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, mealType }),
  });
  if (!res.ok) throw new Error("AI recipe generator request failed");
  return res.json();
}
