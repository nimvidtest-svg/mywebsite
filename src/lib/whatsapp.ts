import { getWhatsappNumber } from "@/lib/api";

export async function openWhatsapp(message: string) {
  const number = await getWhatsappNumber();
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  if (typeof window === "undefined") return;
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) window.location.href = url;
}
