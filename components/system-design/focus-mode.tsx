"use client";

import { Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function FocusMode() {
  const [isFocused, setIsFocused] = useState(false);

  const toggle = useCallback(() => {
    setIsFocused((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && isFocused) {
        setIsFocused(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, isFocused]);

  useEffect(() => {
    if (isFocused) {
      document.documentElement.classList.add("focus-mode");
    } else {
      document.documentElement.classList.remove("focus-mode");
    }
    return () => {
      document.documentElement.classList.remove("focus-mode");
    };
  }, [isFocused]);

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl
        ${isFocused
          ? "border-blue-500/20 bg-blue-500 text-white hover:bg-blue-600"
          : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 text-neutral-500 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa]"
        }`}
      title={isFocused ? "Exit focus mode (⌘.)" : "Enter focus mode (⌘.)"}
      aria-label={isFocused ? "Exit focus mode" : "Enter focus mode"}
    >
      {isFocused ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      )}
    </button>
  );
}
