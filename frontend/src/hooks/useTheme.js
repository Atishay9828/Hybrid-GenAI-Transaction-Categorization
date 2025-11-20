import { useState, useEffect } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  // Apply theme to <html>
  useEffect(() => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  console.log("HTML classlist:", document.documentElement.classList.value);
  localStorage.setItem("theme", theme);
}, [theme]);

  return { theme, setTheme };
}