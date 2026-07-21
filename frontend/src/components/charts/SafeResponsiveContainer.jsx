/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";

function parseSize(value, fallback) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.endsWith("px")) {
    const parsed = Number(value.replace("px", ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export default function SafeResponsiveContainer({
  children,
  width = "100%",
  height = "100%",
  minWidth = 240,
  minHeight = 240,
  debounce = 50,
  className = "",
  style = {},
  ...props
}) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const safeMinWidth = Math.max(1, Number(minWidth) || 240);
  const safeMinHeight = Math.max(180, Number(minHeight) || 240);
  const fallbackHeight = Math.max(180, parseSize(height, safeMinHeight));
  const displayHeight =
    typeof height === "string" && height.endsWith("%") ? fallbackHeight : height;

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const readSize = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    };

    readSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", readSize);
      return () => window.removeEventListener("resize", readSize);
    }

    const observer = new ResizeObserver(readSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const isReady = size.width > 0;
  const chartWidth = Math.max(size.width, safeMinWidth);
  const chartHeight = Math.max(size.height, fallbackHeight);
  const resolvedChildren =
    typeof children === "function"
      ? children({ width: chartWidth, height: chartHeight })
      : children;

  return (
    <div
      ref={ref}
      className={`safe-chart-container ${className}`}
      style={{
        width,
        height: displayHeight,
        minWidth: safeMinWidth,
        minHeight: fallbackHeight,
        ...style,
      }}
    >
      {isReady ? (
        <ResponsiveContainer
          width={chartWidth}
          height={chartHeight}
          minWidth={safeMinWidth}
          minHeight={safeMinHeight}
          debounce={debounce}
          {...props}
        >
          {resolvedChildren}
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full min-h-[inherit] w-full items-center justify-center rounded-2xl bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-300">
          Memuat diagram
        </div>
      )}
    </div>
  );
}
