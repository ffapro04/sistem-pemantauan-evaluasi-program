/* eslint-disable react/prop-types */
import { useState, useCallback } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Search({
  placeholder = "Search...",
  className = "",
  variant = "white",
  data,
  keys = [],
  onResult,
  onSearch,
  value,
  onChange,
}) {
  const [internalQuery, setInternalQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const isControlled = value !== undefined;
  const query = isControlled ? value : internalQuery;

  const runFilter = useCallback((val) => {
    if (!data || !onResult || keys.length === 0) return;
    const lower = val.toLowerCase();
    const filtered = val
      ? data.filter((item) =>
        keys.some((key) => String(item[key] ?? "").toLowerCase().includes(lower))
      )
      : data;
    onResult(filtered);
  }, [data, keys, onResult]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (isControlled) onChange?.(e);
    else setInternalQuery(val);
    if (onSearch) onSearch(val);
    runFilter(val);
  };

  const handleClear = () => {
    if (isControlled) onChange?.({ target: { value: "" } });
    else setInternalQuery("");
    onSearch?.("");
    runFilter("");
  };

  const styles = {
    white: {
      wrapper: "border-slate-200 bg-white",
      wrapperFocused: "border-[#0AC4E0] ring-4 ring-[#0AC4E0]/10",
      input: "text-slate-700 placeholder-slate-400",
      icon: "text-slate-400",
    },
  };

  const s = styles[variant] ?? styles.white;

  return (
    <div className={`relative w-full ${className}`}>
      <motion.div
        animate={{ y: focused ? -2 : 0 }}
        className={`flex items-center rounded-xl border transition-all duration-300 ${s.wrapper} ${focused ? s.wrapperFocused : ""}`}
      >
        <span className="pl-4 pr-1 flex items-center pointer-events-none">
          <SearchIcon size={16} className={`${focused ? "text-[#0AC4E0]" : s.icon} transition-colors`} />
        </span>

        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 py-2 pl-2 pr-3 text-sm font-medium outline-none bg-transparent ${s.input}`}
        />

        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={handleClear}
              className="mr-3 p-1 rounded-md bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <X size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}