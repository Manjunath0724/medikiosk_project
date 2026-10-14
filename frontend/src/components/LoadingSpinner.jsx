import React from "react";

export function LoadingSpinner({ size = "md", text = "Loading...", className = "" }) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-9 h-9 border-3",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 text-slate-500 dark:text-slate-400 ${className}`}>
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-slate-300 dark:border-slate-700 border-t-emerald-600 dark:border-t-emerald-400 animate-spin`}
        role="status"
        aria-label={text}
      />
      {text && <span className="text-xs font-semibold tracking-wide">{text}</span>}
    </div>
  );
}

export function WaveDots({ text = "", className = "" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs ${className}`}>
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse [animation-delay:150ms]" />
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse [animation-delay:300ms]" />
      {text && <span className="ml-1 font-semibold">{text}</span>}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3 ${className}`}>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-full" />
      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6" />
    </div>
  );
}
