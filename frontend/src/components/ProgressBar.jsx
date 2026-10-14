import React from "react";
import { t } from "../i18n.js";

const ESTIMATED_TOTAL = 8;

export default function ProgressBar({ lang, current }) {
  const pct = Math.min(100, Math.round((current / ESTIMATED_TOTAL) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-kiosk-muted mb-1">
        <span>{t(lang, "questionOf", { n: current, total: ESTIMATED_TOTAL })}</span>
      </div>
      <div className="h-2 w-full bg-kiosk-border rounded-full overflow-hidden">
        <div
          className="h-full bg-kiosk-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
