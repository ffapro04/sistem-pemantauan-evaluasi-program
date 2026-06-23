/* eslint-disable react/prop-types */
export default function IconButton({
  icon,
  onClick,
  variant = "danger",
  className = "",
}) {
  const variants = {
    danger: "text-red-500 hover:text-red-700",
    primary: "text-[#2E5AA7] hover:text-[#244a8a]",
    success: "text-green-500 hover:text-green-700",
  };

  return (
    <button
      onClick={onClick}
      className={`
        p-1.5
        rounded-md
        transition
        hover:bg-gray-100
        ${variants[variant]}
        ${className}
      `}
    >
      {icon}
    </button>
  );
}

