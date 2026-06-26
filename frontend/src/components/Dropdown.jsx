/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

export default function Dropdown({
  label,
  placeholder,
  items = [],
  value,
  onChange,
  disabled = false,
  width = "w-full",
  usePortal = true,
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const dropdownRef = useRef(null);

  // Menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logika Kalkulasi Posisi (Portal)
  useEffect(() => {
    if (!open || !usePortal) return;
    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const dropdownHeight = 250;
      const top =
        rect.bottom + dropdownHeight > window.innerHeight
          ? rect.top - dropdownHeight - 8
          : rect.bottom + 8;
      setPosition({ top, left: rect.left, width: rect.width });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, usePortal]);

  const handleToggle = (e) => {
    e.preventDefault();
    if (disabled || !ref.current) return;
    setOpen((prev) => !prev);
  };

  const selectedItem = items.find((item) => item.value === value);
  const displayLabel = selectedItem ? selectedItem.label : placeholder || label || "Pilih...";

  const menuContent = (
    <>
      {items.length > 0 ? (
        items.map((item, index) => (
          <DropdownItem
            key={index}
            label={item.label}
            active={item.value === value}
            onClick={(e) => {
              e.preventDefault();
              onChange?.(item.value);
              setOpen(false);
            }}
          />
        ))
      ) : (
        <div className="px-4 py-3 text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">
          Kosong
        </div>
      )}
    </>
  );

  return (
    <div ref={ref} className={`relative ${width}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`
          w-full flex items-center justify-between gap-3
          px-4 py-2.5 rounded-xl border 
          text-[10px] font-black tracking-[0.15em] uppercase /* Inovasi: Sleek Font */
          transition-all duration-300
          ${
            disabled
              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
              : open
                ? "border-[#2E5AA7] ring-4 ring-[#2E5AA7]/10 bg-white text-gray-800 shadow-sm"
                : "bg-gray-50/50 border-gray-100 text-gray-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] hover:bg-white hover:border-gray-300"
          }
        `}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={14}
          strokeWidth={3}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-500 ${
            open ? "rotate-180 text-[#2E5AA7]" : ""
          }`}
        />
      </button>

      {open && usePortal &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-1.5 max-h-[280px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
          >
            {menuContent}
          </div>,
          document.body,
        )}

      {open && !usePortal && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-full max-h-[280px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.16)] custom-scrollbar"
        >
          {menuContent}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative w-full text-left px-4 py-2.5 rounded-xl mb-0.5 last:mb-0
        transition-all duration-200 flex items-center
        ${active ? "bg-[#2E5AA7]/5 text-[#2E5AA7]" : "text-gray-500 hover:bg-gray-50"}
      `}
    >
      {/* Indikator Garis Aktif warna #2E5AA7 */}
      <span
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1 rounded-full transition-all duration-300 
        ${active ? "h-4 bg-[#2E5AA7] opacity-100" : "h-0 bg-gray-300 opacity-0 group-hover:h-2 group-hover:opacity-100"}`}
      />

      <span
        className={`text-[10px] ml-2 truncate w-full tracking-wide uppercase 
        ${active ? "font-black" : "font-bold"}`}
      >
        {label}
      </span>
    </button>
  );
}

