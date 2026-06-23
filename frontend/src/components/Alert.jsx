/* eslint-disable react/prop-types */
export default function Alert({ message, type = "error" }) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "bg-red-500/20 border-red-500 text-red-300"
      : "bg-green-500/20 border-green-500 text-green-300";

  return (
    <div
      className={`border p-3 rounded-lg text-sm mb-4 ${styles} animate-fadeInUp`}
    >
      {message}
    </div>
  );
}

