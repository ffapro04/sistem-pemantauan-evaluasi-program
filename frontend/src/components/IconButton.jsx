import PropTypes from "prop-types";
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

IconButton.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["danger", "primary", "success"]),
  className: PropTypes.string,
};
