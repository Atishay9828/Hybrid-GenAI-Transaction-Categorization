import { useRef } from "react";

export default function TransactionInput({ text, setText, onPredict }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    onPredict();

    // 👇 scroll user back to input after prediction
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex items-center gap-3 w-full justify-center mt-10">
      {/* 🔥 ENTER SUPPORT ADDED */}
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter transaction text..."
        className="w-1/2 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleClick}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
      >
        Predict
      </button>
    </div>
  );
}
