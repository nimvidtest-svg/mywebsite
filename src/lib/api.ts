import { supabase } from "@/integrations/supabase/client";
import { perfumeImages } from "@/data/perfume-images";
import { perfumes as localPerfumes } from "@/data/perfumes";

const _slug = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type Category = "FEMMES" | "HOMMES" | "NICHE" | "BEST SELLERS" | "ORIENTAUX";
export type Gender = "Femme" | "Homme" | "Mixte";
export type Scent = "sucre" | "oud" | "frais" | "vanille" | "oriental" | "musque";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type OrderStatus = "nouveau" | "confirme" | "livre" | "annule";

export const scents: { value: Scent; label: string }[] = [
  { value: "sucre", label: "Sucré" },
  { value: "oud", label: "Oud" },
  { value: "frais", label: "Frais" },
  { value: "vanille", label: "Vanille" },
  { value: "oriental", label: "Oriental" },
  { value: "musque", label: "Musqué" },
];

export const orderStatusLabel: Record<OrderStatus, string> = {
  nouveau: "Nouveau", confirme: "Confirmé", livre: "Livré", annule: "Annulé",
};

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  category: Category;
  gender: Gender;
  price: number;
  description: string;
  image_url: string;
  best_seller: boolean;
  sort_order: number;
  scent: Scent;
  stock_status: StockStatus;
}

export interface Review {
  id: string;
  perfume_id: string | null;
  customer_name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  customer_name: string;
  phone: string;
  city: string | null;
  address: string | null;
  items: { name: string; qty?: number }[];
  total: number | null;
  type: string;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface HeroSettings {
  badge: string;
  title1: string;
  title2: string;
  subtitle: string;
  price_text: string;
  cta1: string;
  cta2: string;
}

export interface OfferSettings {
  enabled: boolean;
  badge: string;
  title1: string;
  title2: string;
  price: number;
  old_price_text: string;
  cta: string;
  features: string[];
  image_url: string;
}

export const categories: Category[] = ["BEST SELLERS", "FEMMES", "HOMMES", "NICHE", "ORIENTAUX"];

const localBottleMap = new Map(localPerfumes.map((p) => [p.id, p.image]));

// Category → deterministic bottle image pool (same as perfumes.ts)
import bottleGreen from "@/assets/bottle-green.jpg";
import bottleBlack from "@/assets/bottle-black.jpg";
import bottleTurquoise from "@/assets/bottle-turquoise.jpg";
import bottleBurgundy from "@/assets/bottle-burgundy.jpg";
import bottleNavy from "@/assets/bottle-navy.jpg";
import bottleRose from "@/assets/bottle-rose.jpg";
import bottleGold from "@/assets/bottle-gold.jpg";
import bottlePurple from "@/assets/bottle-purple.jpg";

const CATEGORY_BOTTLES: Record<string, string[]> = {
  FEMMES:         [bottleRose, bottlePurple, bottleBurgundy, bottleTurquoise],
  HOMMES:         [bottleBlack, bottleNavy, bottleGreen],
  NICHE:          [bottleGold, bottlePurple, bottleTurquoise],
  ORIENTAUX:      [bottleGold, bottleBurgundy, bottleBlack],
  "BEST SELLERS": [bottleGold],
};
const _hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
const categoryBottle = (p: Perfume) => {
  const pool = CATEGORY_BOTTLES[p.category] ?? [bottleGold];
  return pool[_hash(`${p.brand}-${p.name}`) % pool.length];
};

const applyImages = (rows: Perfume[]): Perfume[] =>
  rows.map((p) => {
    // Admin uploaded a real image → use it as-is
    if (p.image_url) return p;
    // Otherwise resolve from local bottle assets (by brand+name key, then category)
    const key = `${_slug(p.brand)}-${_slug(p.name)}`;
    const resolved = perfumeImages[key] ?? localBottleMap.get(key) ?? categoryBottle(p);
    return { ...p, image_url: resolved };
  });

const localFallback = (): Perfume[] =>
  localPerfumes.map((p, i) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category as Category,
    gender: p.gender as Gender,
    price: p.price,
    description: p.description,
    image_url: perfumeImages[p.id] || p.image,
    best_seller: p.bestSeller ?? false,
    sort_order: i,
    scent: "frais" as Scent,
    stock_status: "in_stock" as StockStatus,
  }));

export async function fetchPerfumes(): Promise<Perfume[]> {
  try {
    const { data, error } = await supabase
      .from("perfumes")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name");
    if (error) throw error;
    const rows = (data ?? []) as Perfume[];
    return rows.length ? applyImages(rows) : localFallback();
  } catch {
    return localFallback();
  }
}

export async function fetchSetting<T = unknown>(key: string): Promise<T | null> {
  const { data, error } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return (data?.value as T) ?? null;
}

export async function saveSetting(key: string, value: unknown) {
  const { error } = await supabase.from("settings").upsert({ key, value: value as never });
  if (error) throw error;
}

export async function createOrder(payload: Omit<OrderRow, "id" | "created_at" | "status">) {
  const { error } = await supabase.from("orders").insert(payload as never);
  if (error) throw error;
}

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews").select("*").eq("approved", true)
    .order("created_at", { ascending: false }).limit(24);
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function submitReview(r: { customer_name: string; rating: number; comment: string; perfume_id?: string | null }) {
  const { error } = await supabase.from("reviews").insert(r as never);
  if (error) throw error;
}

const DEFAULT_WA = "212703839618";
let cachedWa: string | null = null;

export async function getWhatsappNumber(): Promise<string> {
  if (cachedWa) return cachedWa;
  try {
    const v = await fetchSetting<string>("whatsapp_number");
    cachedWa = v || DEFAULT_WA;
  } catch {
    cachedWa = DEFAULT_WA;
  }
  return cachedWa;
}
export function setCachedWa(v: string) { cachedWa = v; }
