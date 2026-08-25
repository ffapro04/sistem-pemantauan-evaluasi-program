import PropTypes from "prop-types";

export default function Input({
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  ...props // <--- Ini untuk menangkap prop tambahan seperti 'readOnly' atau 'name'
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props} // <--- Ini untuk menyalurkan prop tersebut ke tag input asli
      className={`
        w-full
        px-4 py-2.5
        bg-white hover:bg-gray-50/50
        border border-gray-200
        rounded-xl
        text-[13px] font-medium text-gray-700
        placeholder:text-gray-400 placeholder:font-normal
        shadow-sm shadow-gray-200/50
        outline-none
        transition-all duration-200
        focus:bg-white
        focus:border-[#0AC4E0]
        focus:ring-[3px]
        focus:ring-[#0AC4E0]/10
        disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:shadow-none disabled:cursor-not-allowed
        read-only:bg-gray-50 read-only:text-gray-500 read-only:focus:ring-0 read-only:focus:border-gray-200
        ${className}
      `}
    />
  );
}

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  className: PropTypes.string,
};

