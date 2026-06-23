/* eslint-disable react/prop-types */
import React from "react";
import { Edit3, Power, PowerOff, Eye, Send, Trash2 } from "lucide-react";

/**
 * ActionButtons - Wrapper untuk mengelompokkan tombol aksi.
 */
function ActionButtons({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

/**
 * ActionIcon - Versi Modern & Minimalis
 */
const ActionIcon = ({ icon: Icon, onClick, variant = "primary", title }) => {
  const variants = {
    primary:
      "text-[#1E5AA5] bg-blue-50 border-blue-100 hover:bg-[#1E5AA5] hover:text-white",
    success:
      "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white",
    danger:
      "text-red-500 bg-red-50 border-red-100 hover:bg-red-500 hover:text-white",
    warning:
      "text-orange-500 bg-orange-50 border-orange-100 hover:bg-orange-500 hover:text-white",
    gray: "text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-600 hover:text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        flex h-9 w-9 shrink-0 items-center justify-center
        rounded-xl border
        transition-colors duration-200
        active:opacity-70
        ${variants[variant] || variants.primary}
      `}
    >
      <Icon size={15} strokeWidth={2} />
    </button>
  );
};

export const EditButton = ({ onClick }) => (
  <ActionIcon
    icon={Edit3}
    onClick={onClick}
    variant="primary"
    title="Edit Data"
  />
);

export const DetailButton = ({ onClick }) => (
  <ActionIcon
    icon={Eye}
    onClick={onClick}
    variant="gray"
    title="Lihat Detail"
  />
);

export const SendButton = ({ onClick }) => (
  <ActionIcon
    icon={Send}
    onClick={onClick}
    variant="warning"
    title="Kirim Data"
  />
);

export const DeleteButton = ({ onClick }) => (
  <ActionIcon
    icon={Trash2}
    onClick={onClick}
    variant="danger"
    title="Hapus Data"
  />
);

export const ToggleStatusButton = ({ isActive, onClick }) => (
  <ActionIcon
    icon={isActive ? PowerOff : Power}
    onClick={onClick}
    variant={isActive ? "danger" : "success"}
    title={isActive ? "Non-aktifkan" : "Aktifkan"}
  />
);

export default ActionButtons;
