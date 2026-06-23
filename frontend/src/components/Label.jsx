/* eslint-disable react/prop-types */
export default function Label({
  text,
  htmlFor,
  required = false,
  className = "",
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`
        block
        text-[10px] 
        font-black 
        text-gray-400 
        uppercase 
        tracking-widest 
        mb-2 
        ml-1
        ${className}
      `}
    >
      {text}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

