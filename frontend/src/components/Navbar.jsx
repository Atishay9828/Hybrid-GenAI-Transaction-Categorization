import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-900 dark:bg-gray-950 text-white flex gap-4 border-b border-white/10">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/history" className="hover:underline">History</Link>
      <Link to="/merchant-memory" className="hover:underline">Merchant Memory</Link>
    </nav>
  );
}