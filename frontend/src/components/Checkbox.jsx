import PropTypes from "prop-types";
import React from "react";
import { Check } from "lucide-react";

const Checkbox = ({ label, checked, onChange, value }) => {
  return (
    <label
      className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
        checked
          ? "bg-[#0AC4E0]/5 border-[#0AC4E0] shadow-sm"
          : "bg-gray-50 border-transparent hover:bg-gray-100"
      }`}
    >
      <span
        className={`text-[11px] font-black uppercase tracking-tight transition-colors ${
          checked ? "text-[#0AC4E0]" : "text-gray-600"
        }`}
      >
        {label}
      </span>

      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-lg checked:bg-[#0AC4E0] checked:border-[#0AC4E0] transition-all duration-300 cursor-pointer"
          checked={checked}
          onChange={() => onChange(value)}
        />
        <Check
          size={14}
          strokeWidth={4}
          className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
        />
      </div>
    </label>
  );
};

Checkbox.propTypes = {
  label: PropTypes.node,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.any,
};

export default Checkbox;

