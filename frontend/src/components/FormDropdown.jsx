/* eslint-disable react/prop-types */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Label from "./Label";

function FormDropdown({
    label,
    items = [],
    value,
    onSelect,
    placeholder = "Pilih data...",
    icon: Icon,
    getKey = (item) => item.id_user || item.id_sekolah || item.id,
    getLabel = (item) => item.nama || item.nama_sekolah || item.label || "-",
}) {
    const [open, setOpen] = useState(false);

    const selectedItem = items.find((item) => getKey(item) === value);

    return (
        <div className="group relative w-full">
            <Label
                text={label}
                required
                className="!mb-2 !ml-1 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
            />

            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-2xl border-2 bg-white px-5 py-3.5 transition-all duration-300 ${open
                        ? "border-[#0AC4E0] shadow-lg ring-4 ring-[#0AC4E0]/10"
                        : "border-slate-100 shadow-sm hover:border-[#0AC4E0]/40"
                    }`}
            >
                <div className="flex min-w-0 items-center gap-3">
                    {Icon && (
                        <Icon
                            size={18}
                            className={open ? "text-[#0AC4E0]" : "text-slate-300"}
                        />
                    )}

                    <span
                        className={`truncate text-sm font-semibold ${selectedItem ? "text-slate-800" : "text-slate-300"
                            }`}
                    >
                        {selectedItem ? getLabel(selectedItem) : placeholder}
                    </span>
                </div>

                <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-[#0AC4E0]" : "text-slate-300"
                        }`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="no-scrollbar absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-100 bg-white/90 p-2 shadow-2xl backdrop-blur-xl"
                    >
                        {items.length > 0 ? (
                            items.map((item) => (
                                <li
                                    key={getKey(item)}
                                    onClick={() => {
                                        onSelect(getKey(item));
                                        setOpen(false);
                                    }}
                                    className="mb-1 cursor-pointer rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition-all last:mb-0 hover:bg-[#0AC4E0] hover:text-white"
                                >
                                    {getLabel(item)}
                                </li>
                            ))
                        ) : (
                            <li className="rounded-xl px-4 py-3 text-sm font-bold text-slate-300">
                                Data belum tersedia
                            </li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}

export default FormDropdown;
