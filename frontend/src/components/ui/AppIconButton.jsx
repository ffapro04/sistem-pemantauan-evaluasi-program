import React from "react";
import PropTypes from "prop-types";
import { cn } from "../../design/tokens";

const variantClass = {
  primary:
    "border-[#0AC4E0]/20 bg-[#0AC4E0]/5 text-[#0AC4E0] hover:bg-[#0AC4E0] hover:text-white",
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
    "border-transparent bg-transparent text-[#0AC4E0] hover:bg-gray-100 hover:text-[#0899B0]",
  plainSuccess:
    "border-transparent bg-transparent text-green-500 hover:bg-gray-100 hover:text-green-700",
  // Subtle chrome for icon-only nav controls (e.g. pagination arrows) sitting
  // directly on a page/panel background rather than inside a filled surface.
  nav:
    "border-transparent bg-transparent text-gray-400 hover:bg-[#0AC4E0]/10 hover:text-[#0AC4E0]",
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

AppIconButton.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.elementType]),
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  variant: PropTypes.oneOf([
    "primary",
    "success",
    "danger",
    "warning",
    "gray",
    "plainDanger",
    "plainPrimary",
    "plainSuccess",
    "nav",
  ]),
  size: PropTypes.oneOf(["auto", "sm", "md", "lg"]),
  iconSize: PropTypes.number,
  strokeWidth: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
