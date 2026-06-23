/* eslint-disable react/prop-types */
export default function Button({
  text,
  type = "button",
  loading = false,
  disabled = false,
  icon,
  variant = "primary",
  className = "",
  onClick,
}) {
  const variants = {
    primary: `
      bg-[#2E5AA7]
      text-white
      shadow-md
      hover:brightness-110
    `,
    ghost: `
      bg-transparent
      text-[#2E5AA7]
      hover:text-[#244a8a]
    `,
    icon: `
      bg-[#2E5AA7]
      text-white
      shadow-md
      hover:brightness-110
      px-2 py-2
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      // Tambahkan fontFamily Poppins di inline style sebagai backup aman
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className={`
      px-4 py-2
      rounded-lg
      text-sm
      font-medium
      transition-all duration-200
      flex items-center justify-center gap-2
      disabled:opacity-60 disabled:cursor-not-allowed
      ${variants[variant]}
      ${className}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && (
            <span className="flex items-center justify-center">{icon}</span>
          )}
          {text && <span className="leading-none">{text}</span>}
        </>
      )}
    </button>
  );
}

