"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-[#176b50] text-white border-slate-900 shadow-[4px_4px_0_#0f4333]",
    error: "bg-[#f15b45] text-white border-slate-900 shadow-[4px_4px_0_#18221f]",
    warning: "bg-[#f4dc4d] text-slate-900 border-slate-900 shadow-[4px_4px_0_#176b50]",
    info: "bg-white text-slate-900 border-slate-900 shadow-[4px_4px_0_#176b50]",
  };

  const icons = {
    success: "✓",
    error: "⚠️",
    warning: "⚡",
    info: "ℹ️",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short max-w-md">
      <div
        className={`flex items-center gap-3 border-3 px-4 py-3 font-sans text-xs font-bold ${typeStyles[type]}`}
        role="alert"
      >
        <span className="text-base shrink-0">{icons[type]}</span>
        <span className="flex-1 leading-snug">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 border border-current px-1.5 py-0.5 text-[10px] font-black uppercase hover:opacity-80 cursor-pointer"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
