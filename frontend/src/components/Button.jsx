import PropTypes from "prop-types";
import AppButton from "./ui/AppButton";

export default function Button({
  text,
  type = "button",
  loading = false,
  disabled = false,
  icon,
  variant = "primary",
  className = "",
  onClick,
  children,
}) {
  const variantMap = {
    primary: "accent",
    ghost: "ghost",
    icon: "accent",
    outline: "secondary",
    secondary: "secondary",
    danger: "danger",
  };

  return (
    <AppButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      icon={icon}
      variant={variantMap[variant] || variant}
      size={variant === "icon" ? "icon" : "md"}
      className={className}
    >
      {children || text}
    </AppButton>
  );
}

Button.propTypes = {
  text: PropTypes.node,
  type: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  variant: PropTypes.oneOf([
    "primary",
    "ghost",
    "icon",
    "outline",
    "secondary",
    "danger",
  ]),
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

