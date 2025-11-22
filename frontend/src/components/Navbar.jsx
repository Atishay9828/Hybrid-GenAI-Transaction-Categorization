import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/dashboard" },
    { name: "History", path: "/history" },
    { name: "Merchant Memory", path: "/merchant-memory" },
  ];

  return (
    <nav className="w-full backdrop-blur-xl bg-black/40 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-center h-16 gap-10">

        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <div key={item.path} className="relative flex items-center">
              <Link
                to={item.path}
                className={`px-4 py-2 text-lg font-medium transition 
                  ${active ? "text-white" : "text-gray-300 hover:text-white"}
                `}
              >
                {item.name}
              </Link>

              {/* Underline Animation */}
              {active && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </div>
          );
        })}

      </div>
    </nav>
  );
}