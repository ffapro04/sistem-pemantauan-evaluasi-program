/* eslint-disable react/prop-types */
import AppIconButton from "./ui/AppIconButton";

export default function IconButton({
  icon,
  onClick,
  variant = "danger",
  className = "",
}) {
  const variants = {
    danger: "plainDanger",
    primary: "plainPrimary",
    success: "plainSuccess",
  };

  return (
    <AppIconButton
      icon={icon}
      onClick={onClick}
      variant={variants[variant] || variants.danger}
      size="auto"
      className={className}
    />
  );
}
