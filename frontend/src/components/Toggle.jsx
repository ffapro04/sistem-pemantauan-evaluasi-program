/* eslint-disable react/prop-types */
export default function Toggle({ checked, onChange }) {
  return (
    <button
      className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-200 ${
        checked ? "bg-green-500" : "bg-gray-300"
      }`}
      onClick={onChange}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
          checked ? "translate-x-6" : ""
        }`}
      />
    </button>
  );
}

