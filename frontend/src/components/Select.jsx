import PropTypes from "prop-types";
import Dropdown from "./Dropdown";

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
        <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-[#0AC4E0]">
          <Icon size={16} strokeWidth={2} />
        </div>
      )}

      <Dropdown
        value={value || ""}
        onChange={(selectedValue) =>
          onChange?.({
            target: {
              name,
              value: selectedValue,
              required,
            },
          })
        }
        placeholder={placeholder}
        items={options.map((option) => ({
          value: option.id ?? option.value,
          label: option.label,
        }))}
        width="w-full"
        usePortal
      />
    </div>
  );
}

Select.propTypes = {
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node,
    }),
  ),
  placeholder: PropTypes.string,
  icon: PropTypes.elementType,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Select;
