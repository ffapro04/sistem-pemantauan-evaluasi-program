/* eslint-disable react/prop-types */
import { ChevronDown } from "lucide-react";

function Select({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Pilih opsi",
  icon: Icon,
  required = false,
  className = "",
}) {
  return (
    <div className={`relative group min-w-[160px] ${className}`}>
      {Icon && (
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-[#0AC4E0]">
          <Icon size={16} strokeWidth={2} />
        </div>
      )}

      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        className={`
          w-full appearance-none rounded-xl border border-slate-200 bg-white
          ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5
          cursor-pointer text-[13px] font-semibold text-slate-700
          shadow-sm outline-none transition-all duration-200
          hover:bg-slate-50
          focus:border-[#0AC4E0]
          focus:bg-white
          focus:ring-[3px]
          focus:ring-[#0AC4E0]/10
        `}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.id ?? option.value}
            value={option.id ?? option.value}
            className="text-slate-700"
          >
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-hover:text-[#0AC4E0] group-focus-within:text-[#0AC4E0]">
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="transition-transform duration-300 group-focus-within:rotate-180"
        />
      </div>
    </div>
  );
}

export default Select;
