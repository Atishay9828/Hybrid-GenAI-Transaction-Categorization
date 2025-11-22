import { motion } from "framer-motion";

export default function CinematicOverlay({ onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="
        fixed inset-0 z-40
        bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.35),rgba(0,0,0,0.72))]
        backdrop-blur-[6px]
      "
      onClick={onClick}
    />
  );
}