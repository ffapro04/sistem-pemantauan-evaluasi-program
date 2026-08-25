import PropTypes from "prop-types";

export default function Alert({ message, type = "error" }) {
  if (!message) return null;

  const styles = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-cyan-200 bg-cyan-50 text-cyan-700",
  };

  return (
    <div
      className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold leading-relaxed shadow-sm ${styles[type] || styles.error} animate-fadeInUp`}
    >
      {message}
    </div>
  );
}

Alert.propTypes = {
  message: PropTypes.node,
  type: PropTypes.oneOf(["error", "success", "warning", "info"]),
};

