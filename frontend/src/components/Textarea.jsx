import PropTypes from "prop-types";

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
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0AC4E0]/20 focus:border-[#0AC4E0] transition-all resize-none placeholder:text-gray-400"
      />
    </div>
  );
};

Textarea.propTypes = {
  label: PropTypes.node,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string,
};

export default Textarea;

