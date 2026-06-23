/* eslint-disable react/prop-types */
import React from "react";

const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold text-gray-700 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-[#1E5AA5]/20 focus:border-[#1E5AA5] transition-all resize-none placeholder:text-gray-400"
      />
    </div>
  );
};

export default Textarea;

