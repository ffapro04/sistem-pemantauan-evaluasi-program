/* eslint-disable react/prop-types */
export default function Card({ title, description, className = "" , children }) {
  return (
    <div
      className={`

        rounded-[20px] lg:rounded-[20px]
        px-12
        py-8
        flex
        flex-col
        h-full
        shadow-[7px_4px_20px_rgba(0,0,0,0.08)]
        transition-all duration-200
        ${className}
      `}
    >
    {children}

      {/* ICON */}
      <div className="mb-5">
        {/* <img src={icon} alt={title} className="w-16 h-16 object-contain" /> */}
      </div>

      {/* TITLE */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-500 leading-relaxed max-w-[320px]">
        {description}
      </p>
    </div>
  );
}

