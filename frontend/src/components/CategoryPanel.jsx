import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
export default function CategoryPanel({ open, onClose, category, data, color }) {
    if (!open) return null;

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";  // stop scrolling background
        } else {
            document.body.style.overflow = "auto";     // restore scrolling
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    return (
        <AnimatePresence>
            {/* Dimmed Background */}
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
                onClick={onClose}
            />


            {/* Sliding Panel */}
            <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="
            fixed top-0 right-0 h-full
            w-[92%] sm:w-[70%] md:w-[55%] lg:w-[42%]
            bg-[rgba(15,15,15,0.55)]
            backdrop-blur-2xl
            border-l border-white/10
            shadow-[0_0_35px_rgba(0,0,0,0.65)]
            rounded-l-2xl 
            p-8 overflow-y-auto 
            z-50
            "
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="
                    absolute top-0 left-0 right-0 h-20 
                    bg-gradient-to-b from-white/10 to-transparent
                    rounded-tl-2xl
                "></div>
                </div>
                {/* Sticky Header */}
                <div
                    className="sticky top-0 z-50 px-8 py-6 backdrop-blur-xl bg-black/30 border-b border-white/10 flex justify-between items-center"
                    style={{ borderColor: color + "55" }}
                >
                    <h2 className="text-3xl font-bold" style={{ color }}>
                        {category}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-2xl px-3 py-1 rounded-lg hover:bg-white/10 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content Body */}
                <div className="px-8 py-6 space-y-6">
                    {/* Spend Summary */}
                    <div className="space-y-2">
                        <p className="text-lg opacity-90">
                            <span className="font-semibold">Total Spend:</span> ₹{data.total}
                        </p>
                        <p className="text-lg opacity-90">
                            <span className="font-semibold">Transactions:</span>{" "}
                            {data.transactions.length}
                        </p>
                        <p className="text-lg opacity-90">
                            <span className="font-semibold">Average Spend:</span> ₹{data.avg}
                        </p>
                        <p className="text-lg opacity-90">
                            <span className="font-semibold">Highest Spend:</span> ₹{data.highest}
                        </p>
                        <p className="text-lg opacity-90">
                            <span className="font-semibold">Lowest Spend:</span> ₹{data.lowest}
                        </p>
                    </div>

                    {/* Merchants */}
                    <div>
                        <h3 className="font-semibold text-xl mb-3">Merchants</h3>

                        <div className="flex flex-wrap gap-2">
                            {data.merchants.map((m, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-sm"
                                >
                                    {m}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="pt-2">
                        <h3 className="font-semibold text-xl mb-3">Transactions</h3>

                        <div className="space-y-4">
                            {data.transactions.map((t, i) => {
                                const amt = t.text.match(/\d+/)?.[0] || "0";

                                return (
                                    <div
                                        key={i}
                                        className="p-4 bg-white/5 border border-white/10 rounded-xl relative"
                                    >
                                        {/* Color Accent Bar */}
                                        <div
                                            className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                                            style={{ backgroundColor: color }}
                                        />

                                        <p className="text-lg font-semibold text-white/90">
                                            ₹{amt}
                                        </p>
                                        <p className="opacity-70 mt-1">{t.text}</p>
                                        <p className="text-xs opacity-50 mt-1">
                                            {new Date(t.timestamp).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}