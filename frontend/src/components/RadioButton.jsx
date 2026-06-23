/* eslint-disable react/prop-types */
export default function RadioButton({
  name,
  value,
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}) {
  return (
    <label
      className={`
        flex items-center gap-3
        border border-gray-200
        rounded-lg
        px-3 py-2
        cursor-pointer
        hover:bg-gray-50
        transition
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="
          w-4 h-4
          accent-[#2E5AA7]
          cursor-pointer
        "
      />

      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

