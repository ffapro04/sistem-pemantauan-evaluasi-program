/* eslint-disable react/prop-types */
import React from "react";
import { cn } from "../../design/tokens";

const variantClass = {
  primary:
    "border-blue-100 bg-blue-50 text-[#1E5AA5] hover:bg-[#1E5AA5] hover:text-white",
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white",
  danger:
    "border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white",
  warning:
    "border-orange-100 bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white",
  gray:
    "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-600 hover:text-white",
  plainDanger:
    "border-transparent bg-transparent text-red-500 hover:bg-gray-100 hover:text-red-700",
  plainPrimary:
    "border-transparent bg-transparent text-[#2E5AA7] hover:bg-gray-100 hover:text-[#244a8a]",
  plainSuccess:
    "border-transparent bg-transparent text-green-500 hover:bg-gray-100 hover:text-green-700",
};

const sizeClass = {
  auto: "p-1.5 rounded-md",
  sm: "h-8 w-8 rounded-xl",
  md: "h-9 w-9 rounded-xl",
  lg: "h-10 w-10 rounded-2xl",
};

export default function AppIconButton({
  icon,
  children,
  onClick,
  type = "button",
  title,
  ariaLabel,
  variant = "primary",
  size = "md",
  iconSize = 15,
  strokeWidth = 2,
  disabled = false,
  className = "",
}) {
  const content = React.isValidElement(icon)
    ? icon
    : icon
      ? React.createElement(icon, { size: iconSize, strokeWidth })
      : children;

  return (
    <button
      type={type}
      title={title}
      aria-label={ariaLabel || title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border transition-colors duration-200 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50",
        sizeClass[size] || sizeClass.md,
        variantClass[variant] || variantClass.primary,
        className,
      )}
    >
      {content}
    </button>
  );
}
