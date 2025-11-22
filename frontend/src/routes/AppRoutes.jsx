import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import History from "../pages/History";
import MerchantMemory from "../pages/MerchantMemory";
import CategoriesDashboard from "../pages/CategoriesDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<CategoriesDashboard />} />
      <Route path="/" element={<Home />} />
      <Route path="/history" element={<History />} />
      <Route path="/merchant-memory" element={<MerchantMemory />} />
    </Routes>
  );
}