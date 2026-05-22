import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { openWhatsapp } from "@/lib/whatsapp";

export function FloatingWhatsapp() {
  return (
    <motion.button
      type="button"
      onClick={() => openWhatsapp("Bonjour Unique Parfum, je souhaite commander un parfum.")}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.2, type: "spring" }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition"
      aria-label="WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30"/>
      <MessageCircle className="w-6 h-6 relative"/>
    </motion.button>
  );
}
