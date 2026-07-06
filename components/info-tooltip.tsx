"use client";

import { useRef, useState } from "react";

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleMouseEnter() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const tooltipWidth = 256;
      const rawLeft = rect.left + rect.width / 2;
      const clampedLeft = Math.max(tooltipWidth / 2 + 8, Math.min(rawLeft, window.innerWidth - tooltipWidth / 2 - 8));
      setPos({
        top: rect.top - 8,
        left: clampedLeft,
      });
    }
    setOpen(true);
  }

  return (
    <span className="relative inline-flex items-center" style={{ verticalAlign: "middle" }}>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-muted-foreground/40 text-muted-foreground hover:border-yellow-500 hover:text-yellow-500 transition-colors text-[10px] font-bold leading-none focus:outline-none"
        aria-label="Пояснение"
      >
        i
      </button>

      {open && (
        <span
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
            pointerEvents: "none",
            textTransform: "none",
            letterSpacing: "normal",
            fontWeight: "normal",
          }}
          className="w-64 rounded-lg border border-yellow-500/60 bg-zinc-900 px-3 py-2 text-[13px] text-zinc-200 shadow-xl"
        >
          {text}
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-yellow-500/60" />
        </span>
      )}
    </span>
  );
}
