// src/components/masterCrud/MasterField.jsx

/* eslint-disable react/prop-types */
import React, { useMemo, useState } from "react";
import Input from "../Input";
import Label from "../Label";
import Dropdown from "../Dropdown";
import Textarea from "../Textarea";
import Upload from "../Upload";
import { CheckCircle2, Eye, EyeOff, Search } from "lucide-react";

const resolveConfigValue = (value, context, fallback = undefined) => {
    if (typeof value === "function") return value(context);
    if (value === undefined) return fallback;
    return value;
};

const MultiSelectCards = ({ field, value, options, onChange }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Support single select atau multi select
    const isSingleSelect = field.singleSelect === true;

    // Normalize value untuk single select
    const selectedValues = isSingleSelect
        ? (value ? [value] : [])
        : (Array.isArray(value) ? value : []);

    const isSelected = (optionValue) => {
        if (isSingleSelect) {
            return String(selectedValues[0] || "") === String(optionValue);
        }
        return selectedValues.some((item) => String(item) === String(optionValue));
    };

    const filteredOptions = useMemo(() => {
        const search = searchTerm.toLowerCase();
        console.log("searchTerm:", search, "options:", options?.length);

        return (options || []).filter((option) => {
            return (
                option.label?.toLowerCase().includes(search) ||
                option.description?.toLowerCase().includes(search) ||
                option.meta?.toLowerCase().includes(search) ||
                option.nama_kabupaten?.toLowerCase().includes(search)
            );
        });
    }, [options, searchTerm]);

    const toggleValue = (optionValue) => {
        if (isSingleSelect) {
            // Single select: jika sama, unselect; jika beda, ganti
            const isSame = String(selectedValues[0] || "") === String(optionValue);
            onChange(field.name, isSame ? "" : optionValue);
        } else {
            // Multi select: toggle seperti biasa
            const exists = selectedValues.some(
                (item) => String(item) === String(optionValue),
            );
            const nextValue = exists
                ? selectedValues.filter((item) => String(item) !== String(optionValue))
                : [...selectedValues, optionValue];
            onChange(field.name, nextValue);
        }
    };

    const selectedCount = isSingleSelect
        ? (selectedValues[0] ? 1 : 0)
        : selectedValues.length;

    return (
        <div className="space-y-3">
            {field.searchable !== false && (
                <div className="relative">
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={field.searchPlaceholder || "Cari data..."}
                        className="w-full rounded-xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-[11px] font-bold text-slate-700 outline-none transition-all focus:border-[#0AC4E0] focus:ring-4 focus:ring-[#0AC4E0]/10"
                    />
                    <Search
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {isSingleSelect ? "Terpilih" : "Terpilih"}
                    </span>
                    <span className="rounded-lg bg-[#0AC4E0]/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                        {selectedCount} {isSingleSelect ? "Kabupaten" : "Data"}
                    </span>
                </div>

                <div
                    className={`no-scrollbar grid gap-2 overflow-y-auto ${field.gridClassName || "grid-cols-1"}`}
                    style={{ maxHeight: field.maxHeight || 260 }}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const selected = isSelected(option.value);
                            const OptionIcon = option.icon;

                            return (
                                <button
                                    key={String(option.value)}
                                    type="button"
                                    onClick={() => toggleValue(option.value)}
                                    className={`group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${selected
                                        ? "border-[#0AC4E0]/30 bg-[#0AC4E0]/10 shadow-sm"
                                        : "border-slate-100 bg-slate-50/60 hover:border-[#0AC4E0]/20 hover:bg-white"
                                        }`}
                                >
                                    <div
                                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected
                                            ? "bg-[#0AC4E0] text-white"
                                            : "bg-white text-slate-300 group-hover:text-[#0AC4E0]"
                                            }`}
                                    >
                                        {selected ? (
                                            <CheckCircle2 size={18} />
                                        ) : OptionIcon ? (
                                            <OptionIcon size={18} />
                                        ) : (
                                            <span className="text-[10px] font-black">
                                                {option.label?.charAt(0)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`text-[11px] font-black uppercase leading-snug ${selected ? "text-[#0AC4E0]" : "text-slate-700"
                                                }`}
                                        >
                                            {option.label}
                                        </p>
                                        {option.description && (
                                            <p className="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">
                                                {option.description}
                                            </p>
                                        )}
                                        {option.meta && (
                                            <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-slate-300">
                                                {option.meta}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl bg-slate-50 py-10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                {field.emptyText || "Data tidak ditemukan"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default function MasterField({
    field,
    value,
    formData,
    auxData,
    mode,
    onChange,
    showPassword,
    setShowPassword,
}) {
    const context = {
        field,
        value,
        formData,
        auxData,
        mode,
    };

    const hidden = resolveConfigValue(field.hidden, context, false);
    const disabled = resolveConfigValue(field.disabled, context, false);
    const required = resolveConfigValue(field.required, context, false);
    const options = resolveConfigValue(field.options, context, []);

    if (hidden) return null;

    const Icon = field.icon;

    const inputClass =
        field.className ||
        "w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold";

    return (
        <div className={field.wrapperClassName || "space-y-2"}>
            <Label
                text={field.label}
                required={required}
                className={
                    field.labelClassName ||
                    "!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                }
            />

            {field.type === "multiSelectCards" && (
                <MultiSelectCards
                    field={field}
                    value={value}
                    options={options}
                    onChange={onChange}
                />
            )}

            {field.type === "select" && (
                <Dropdown
                    icon={field.icon}
                    value={value}
                    items={options}
                    disabled={disabled}
                    onChange={(nextValue) => onChange(field.name, nextValue)}
                    className={
                        field.inputClassName ||
                        "!rounded-xl !bg-white !py-2 !text-[9px] font-black uppercase"
                    }
                />
            )}

            {field.type === "textarea" && (
                <Textarea
                    value={value || ""}
                    disabled={disabled}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder || ""}
                    className={
                        field.inputClassName ||
                        "!min-h-[100px] !rounded-xl !bg-white !p-4 !text-[11px] font-bold"
                    }
                />
            )}

            {field.type === "upload" && (
                <Upload
                    file={value}
                    disabled={disabled}
                    accept={field.accept}
                    maxSize={field.maxSize}
                    buttonText={field.buttonText}
                    helperText={field.helperText}
                    onFileSelect={(selectedFile) =>
                        onChange(field.name, selectedFile)
                    }
                />
            )}

            {field.type !== "select" &&
                field.type !== "textarea" &&
                field.type !== "upload" &&
                field.type !== "multiSelectCards" && (
                    <div className="relative">
                        <Input
                            type={
                                field.type === "password"
                                    ? showPassword
                                        ? "text"
                                        : "password"
                                    : field.type || "text"
                            }
                            value={value || ""}
                            disabled={disabled}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            placeholder={field.placeholder || ""}
                            className={`${inputClass} ${Icon ? "!pl-10" : ""} ${field.type === "password" ? "!pr-12" : ""
                                }`}
                        />

                        {Icon && (
                            <Icon
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                size={15}
                            />
                        )}

                        {field.type === "password" && setShowPassword && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 transition-all hover:text-[#0AC4E0] active:scale-90"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        )}
                    </div>
                )}

            {field.help && (
                <p className="ml-1 text-[9px] font-bold leading-relaxed text-slate-400">
                    {typeof field.help === "function" ? field.help(context) : field.help}
                </p>
            )}
        </div>
    );
}
