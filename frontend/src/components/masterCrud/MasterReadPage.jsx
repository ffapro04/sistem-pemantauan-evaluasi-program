// src/components/masterCrud/MasterReadPage.jsx

/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
    Plus,
    Search as SearchIcon,
    Filter,
    RotateCcw,
    Loader2,
    LayoutGrid,
    Eye,
    Edit3,
    Trash2,
    SlidersHorizontal,
} from "lucide-react";

import Button from "../Button";
import Input from "../Input";
import Table from "../Table";
import Pagination from "../Pagination";
import Dropdown from "../Dropdown";

import MasterPageShell from "./MasterPageShell";
import MasterStatusSwitch from "./MasterStatusSwitch";
import { getAuthToken } from "../../utils/authSession";
import {
    buildApiUrl,
    buildFreshApiUrl,
    getTokenHeader,
    getArrayPayload,
    normalizeText,
    isActiveValue,
    getNestedValue,
} from "./masterCrudUtils";

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
});

const resolveValue = (source, row, context = {}) => {
    if (typeof source === "function") return source(row, context);
    if (typeof source === "string") return getNestedValue(row, source, "");
    return source;
};

const resolveEndpoint = (endpoint, context = {}) => {
    if (typeof endpoint === "function") return endpoint(context);
    return endpoint;
};

const resolvePath = (pathOrFn, row, fallback = "#") => {
    if (typeof pathOrFn === "function") return pathOrFn(row);
    return pathOrFn || fallback;
};

const getDefaultId = (row, config) => {
    if (config.idKey) return row?.[config.idKey];

    return (
        row?.id ||
        row?.id_user ||
        row?.id_sekolah ||
        row?.id_vendor ||
        row?.id_wilayah ||
        row?.id_role
    );
};

const getNewestSortValue = (row) => {
    const candidates = [
        row?.created_at,
        row?.createdAt,
        row?.updated_at,
        row?.updatedAt,
        row?.id,
        row?.id_user,
        row?.id_sekolah,
        row?.id_vendor,
        row?.id_wilayah,
        row?.id_role,
    ];

    for (const value of candidates) {
        if (value === undefined || value === null || value === "") continue;

        const date = new Date(value).getTime();
        if (Number.isFinite(date)) return date;

        const number = Number(value);
        if (Number.isFinite(number)) return number;
    }

    return 0;
};

const getFilterLabel = (filter) => {
    if (filter.label) return filter.label;
    if (filter.title) return filter.title;

    const labels = {
        role: "Role",
        wilayah: "Wilayah",
        sekolah: "Sekolah",
        status: "Status",
        jabatan: "Jabatan",
        jenis: "Bidang",
        fokus: "Fokus",
        pilar: "Pilar",
        jenjang: "Jenjang",
        tipe: "Klasifikasi",
    };

    return labels[filter.name] || filter.name;
};

const renderTextCell = (row, column, context) => {
    const value = resolveValue(column.key, row, context);

    return (
        <div className="flex justify-start py-1 text-left">
            <div className="min-w-0">
                <p className="whitespace-normal break-words text-left text-[10px] font-bold leading-snug text-slate-700">
                    {value || column.fallback || "-"}
                </p>

                {column.subKey && (
                    <p className="mt-0.5 whitespace-normal break-words text-left text-[8px] font-bold leading-snug text-slate-400">
                        {resolveValue(column.subKey, row, context) || "-"}
                    </p>
                )}
            </div>
        </div>
    );
};

const renderBadgeCell = (row, column, context) => {
    const value = resolveValue(column.key, row, context);
    const text = column.format ? column.format(value, row, context) : value;

    return (
        <div className="flex justify-center py-1">
            <span className="inline-flex max-w-full items-center rounded-full border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[8px] font-black uppercase leading-snug tracking-widest text-[#0AC4E0]">
                <span className="min-w-0 whitespace-normal break-words">
                    {text || "-"}
                </span>
            </span>
        </div>
    );
};

const renderStatusBadgeCell = (row, column, context) => {
    const value = resolveValue(column.key || "status", row, context);
    const active = column.isActive
        ? column.isActive(value, row, context)
        : isActiveValue(value);

    return (
        <div className="flex justify-center py-1">
            <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${active
                    ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                    : "border-rose-100 bg-rose-50 text-rose-600"
                    }`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                />

                {active
                    ? column.activeText || "Aktif"
                    : column.inactiveText || "Nonaktif"}
            </span>
        </div>
    );
};

const renderColumnCell = (row, column, context) => {
    if (typeof column.render === "function") {
        return column.render(row, context);
    }

    if (column.type === "badge") {
        return renderBadgeCell(row, column, context);
    }

    if (column.type === "status") {
        return renderStatusBadgeCell(row, column, context);
    }

    return renderTextCell(row, column, context);
};

const MasterRowActions = ({
    row,
    config,
    navigate,
    onDelete,
    onToggleStatus,
}) => {
    const detailPath = resolvePath(config.routes?.detail, row);
    const editPath = resolvePath(config.routes?.edit, row);

    const showDetail = config.actions?.detail !== false && config.routes?.detail;
    const showEdit = config.actions?.edit !== false && config.routes?.edit;
    const showDelete = config.actions?.delete !== false;

    const showStatus =
        config.actions?.status !== false &&
        config.status &&
        typeof onToggleStatus === "function";

    const statusValue = config.status?.getValue
        ? config.status.getValue(row)
        : row.status;

    return (
        <div className="flex justify-center py-1">
            <div className="flex min-w-[210px] items-center justify-center gap-3">
                <div className="flex shrink-0 items-center gap-1">
                    {showDetail && (
                        <button
                            type="button"
                            onClick={() => navigate(detailPath)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-[#0AC4E0] active:scale-90"
                            title="Lihat Detail"
                        >
                            <Eye size={13} />
                        </button>
                    )}

                    {showEdit && (
                        <button
                            type="button"
                            onClick={() => navigate(editPath)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-amber-500 active:scale-90"
                            title="Edit Data"
                        >
                            <Edit3 size={13} />
                        </button>
                    )}

                    {showDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition-all hover:bg-rose-500 hover:text-white active:scale-90"
                            title="Hapus Data"
                        >
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>

                {showStatus && (
                    <>
                        <div className="h-5 w-px bg-slate-100" />

                        <MasterStatusSwitch
                            value={statusValue}
                            active={
                                typeof config.status.isActive === "function"
                                    ? config.status.isActive(statusValue, row)
                                    : undefined
                            }
                            activeText={config.status.activeText || "Aktif"}
                            inactiveText={config.status.inactiveText || "Nonaktif"}
                            onClick={() => onToggleStatus(row)}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default function MasterReadPage({ config }) {
    const navigate = useNavigate();

    const storageKey = config.storageKey || config.entityKey || "master_read";
    const itemsPerPage = 6;

    const getDefaultFilters = () => {
        const result = {};

        (config.filters || []).forEach((filter) => {
            result[filter.name] =
                localStorage.getItem(`${storageKey}_${filter.name}`) ||
                filter.defaultValue ||
                "all";
        });

        return result;
    };

    const getDefaultActiveFilter = () => {
        const filters = config.filters || [];

        const savedActive = localStorage.getItem(`${storageKey}_active_filter`);
        if (savedActive && filters.some((filter) => filter.name === savedActive)) {
            return savedActive;
        }

        const activeFromSavedValue = filters.find((filter) => {
            const value = localStorage.getItem(`${storageKey}_${filter.name}`);
            return value && value !== "all";
        });

        return activeFromSavedValue?.name || filters[0]?.name || "";
    };

    const [rows, setRows] = useState([]);
    const [auxData, setAuxData] = useState({});
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState(
        localStorage.getItem(`${storageKey}_search`) || "",
    );

    const [filters, setFilters] = useState(getDefaultFilters);
    const [activeFilterName, setActiveFilterName] = useState(
        getDefaultActiveFilter,
    );

    const [currentPage, setCurrentPage] = useState(
        Number(localStorage.getItem(`${storageKey}_page`)) || 1,
    );

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const token = getAuthToken();

            if (!token) {
                navigate("/login");
                return;
            }

            let user = null;
            try {
                user = jwtDecode(token);
            } catch (err) {
                console.warn("Failed to decode JWT:", err);
            }

            if (config.requiresAuth && !user) {
                navigate("/login");
                return;
            }

            if (config.requiresSekolahId && !user?.id_sekolah) {
                Toast.fire({
                    icon: "error",
                    title: "ID Sekolah tidak ditemukan di token Anda",
                });
                return;
            }

            const listEndpoint =
                typeof config.api?.list === "function"
                    ? config.api.list({ user })
                    : config.api?.list || config.endpoint;

            const endpoints = [
                listEndpoint,
                ...(config.api?.fallbackList || config.fallbackEndpoints || []),
            ].filter(Boolean);

            let rawRows = [];

            for (const endpoint of endpoints) {
                try {
                    const response = await axios.get(buildFreshApiUrl(endpoint), {
                        headers: getTokenHeader(),
                    });

                    const normalizedPayload =
                        typeof config.getListPayload === "function"
                            ? config.getListPayload(response.data)
                            : getArrayPayload(response.data);

                    rawRows = normalizedPayload;

                    if (
                        rawRows.length > 0 ||
                        endpoint === endpoints[endpoints.length - 1]
                    ) {
                        break;
                    }
                } catch (error) {
                    console.warn(`Endpoint gagal: ${endpoint}`, error);
                }
            }

            const nextAuxData = {};

            for (const aux of config.auxiliary || []) {
                try {
                    const response = await axios.get(buildFreshApiUrl(aux.endpoint), {
                        headers: getTokenHeader(),
                    });

                    const payload =
                        typeof aux.getPayload === "function"
                            ? aux.getPayload(response.data)
                            : getArrayPayload(response.data);

                    nextAuxData[aux.key] =
                        typeof aux.normalize === "function"
                            ? payload.map(aux.normalize)
                            : payload;
                } catch (error) {
                    console.warn(`Gagal mengambil auxiliary ${aux.key}`, error);
                    nextAuxData[aux.key] = [];
                }
            }

            let normalizedRows = rawRows;

            if (typeof config.normalizeRow === "function") {
                normalizedRows = rawRows.map((item) =>
                    config.normalizeRow(item, {
                        auxData: nextAuxData,
                        config,
                    }),
                );
            }

            if (typeof config.transformRows === "function") {
                normalizedRows = config.transformRows(normalizedRows, {
                    auxData: nextAuxData,
                    config,
                });
            }

            setRows(normalizedRows);
            setAuxData(nextAuxData);
        } catch (error) {
            console.error("MasterReadPage Fetch Error:", error);

            Toast.fire({
                icon: "error",
                title: config.messages?.fetchError || "Gagal memuat data",
            });
        } finally {
            setLoading(false);
        }
    }, [config, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        localStorage.setItem(`${storageKey}_search`, searchTerm);
        localStorage.setItem(`${storageKey}_page`, currentPage);
        localStorage.setItem(`${storageKey}_active_filter`, activeFilterName);

        Object.entries(filters).forEach(([key, value]) => {
            localStorage.setItem(`${storageKey}_${key}`, value);
        });
    }, [storageKey, searchTerm, filters, currentPage, activeFilterName]);

    const activeFilter = useMemo(() => {
        return (config.filters || []).find(
            (filter) => filter.name === activeFilterName,
        );
    }, [config.filters, activeFilterName]);

    const activeFilterItems = useMemo(() => {
        if (!activeFilter) return [];

        return typeof activeFilter.items === "function"
            ? activeFilter.items({
                filters,
                auxData,
                config,
            })
            : activeFilter.items || [];
    }, [activeFilter, filters, auxData, config]);

    const updateActiveFilterName = (name) => {
        setActiveFilterName(name);
        setCurrentPage(1);

        setFilters((prev) => {
            const next = { ...prev };

            (config.filters || []).forEach((filter) => {
                if (filter.name !== name) {
                    next[filter.name] = filter.defaultValue || "all";
                }
            });

            return next;
        });
    };

    const updateFilterValue = (name, value) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));

        setCurrentPage(1);
    };

    const resetFilter = () => {
        setSearchTerm("");
        setCurrentPage(1);

        const nextFilters = {};

        (config.filters || []).forEach((filter) => {
            nextFilters[filter.name] = filter.defaultValue || "all";
            localStorage.removeItem(`${storageKey}_${filter.name}`);
        });

        setFilters(nextFilters);
        setActiveFilterName((config.filters || [])[0]?.name || "");

        localStorage.removeItem(`${storageKey}_search`);
        localStorage.removeItem(`${storageKey}_page`);
        localStorage.removeItem(`${storageKey}_active_filter`);
    };

    const handleToggleStatus = async (row) => {
        if (!config.status) return;

        try {
            const currentStatus = config.status.getValue
                ? config.status.getValue(row)
                : row.status;

            const nextStatus = config.status.getNextValue
                ? config.status.getNextValue(currentStatus, row)
                : !isActiveValue(currentStatus);

            const endpoint =
                typeof config.status.endpoint === "function"
                    ? config.status.endpoint(row)
                    : config.status.endpoint;

            const payload =
                typeof config.status.payload === "function"
                    ? config.status.payload(nextStatus, row)
                    : { status: nextStatus };

            await axios.patch(buildApiUrl(endpoint), payload, {
                headers: getTokenHeader(),
            });

            await fetchData();

            Toast.fire({
                icon: "success",
                title:
                    typeof config.status.successMessage === "function"
                        ? config.status.successMessage(row, nextStatus)
                        : config.messages?.statusSuccess ||
                        "Status berhasil diperbarui",
            });
        } catch (error) {
            console.error("MasterReadPage Toggle Error:", error);

            Toast.fire({
                icon: "error",
                title: config.messages?.statusError || "Gagal memperbarui status",
            });
        }
    };

    const getDeleteEndpoint = (row) => {
        const id = getDefaultId(row, config);

        if (typeof config.api?.delete === "function") return config.api.delete(row);
        if (typeof config.api?.remove === "function") return config.api.remove(row);

        if (config.api?.delete) return config.api.delete;
        if (config.api?.remove) return config.api.remove;

        if (typeof config.api?.update === "function") return config.api.update(id);
        if (typeof config.api?.detail === "function") return config.api.detail(id);

        return null;
    };

    const handleDelete = async (row) => {
        const name =
            resolveValue(config.displayKey || config.titleKey || "nama", row) ||
            config.entityName ||
            "data";

        const result = await Swal.fire({
            title: "Konfirmasi Hapus Data",
            text: `${name} akan dihapus dari daftar. Pastikan data ini memang sudah tidak digunakan.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0AC4E0",
            cancelButtonColor: "#FFFFFF",
            confirmButtonText: "Hapus Data",
            cancelButtonText: "Batalkan",
            reverseButtons: true,
            focusCancel: true,
            customClass: {
                popup: "app-confirm-popup",
                title: "app-confirm-title",
                htmlContainer: "app-confirm-text",
                actions: "app-confirm-actions",
                confirmButton:
                    "app-confirm-button app-confirm-button-primary",
                cancelButton:
                    "app-confirm-button app-confirm-button-secondary",
            },
        });

        if (!result.isConfirmed) return;

        try {
            const endpoint = getDeleteEndpoint(row);

            if (!endpoint) {
                throw new Error("Endpoint delete belum tersedia.");
            }

            try {
                await axios.delete(buildApiUrl(endpoint), {
                    headers: getTokenHeader(),
                });
            } catch (deleteError) {
                if (!config.status) throw deleteError;

                const statusEndpoint =
                    typeof config.status.endpoint === "function"
                        ? config.status.endpoint(row)
                        : config.status.endpoint;

                const payload =
                    typeof config.status.payload === "function"
                        ? config.status.payload(false, row)
                        : { status: false };

                await axios.patch(buildApiUrl(statusEndpoint), payload, {
                    headers: getTokenHeader(),
                });
            }

            await fetchData();

            Toast.fire({
                icon: "success",
                title: config.messages?.deleteSuccess || "Data berhasil dihapus",
            });
        } catch (error) {
            console.error("MasterReadPage Delete Error:", error);

            Toast.fire({
                icon: "error",
                title: config.messages?.deleteError || "Gagal menghapus data",
            });
        }
    };

    const filteredData = useMemo(() => {
        const search = normalizeText(searchTerm);

        let result = rows.filter((row) => {
            const matchesSearch =
                !search ||
                (config.searchKeys || []).some((key) => {
                    const value = resolveValue(key, row, {
                        config,
                        auxData,
                    });

                    return normalizeText(value).includes(search);
                });

            const matchesFilters = (config.filters || []).every((filter) => {
                const value = filters[filter.name] || filter.defaultValue || "all";

                if (value === "all" && filter.skipAll !== false) return true;

                if (typeof filter.predicate === "function") {
                    return filter.predicate(row, value, {
                        filters,
                        auxData,
                        config,
                    });
                }

                const rowValue = resolveValue(filter.key, row, {
                    config,
                    auxData,
                });

                return String(rowValue) === String(value);
            });

            return matchesSearch && matchesFilters;
        });

        if (typeof config.sortRows === "function") {
            result = [...result].sort((a, b) =>
                config.sortRows(a, b, {
                    config,
                    auxData,
                }),
            );
        } else {
            result = [...result].sort(
                (a, b) => getNewestSortValue(b) - getNewestSortValue(a),
            );
        }

        return result;
    }, [rows, searchTerm, filters, config, auxData]);

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const summaryItems = useMemo(() => {
        if (typeof config.summary === "function") {
            return config.summary(rows, {
                filteredData,
                auxData,
                config,
            });
        }

        return [];
    }, [config, rows, filteredData, auxData]);

    const tableColumns = useMemo(() => {
        const numberColumn = {
            header: "NO",
            align: "text-center w-[60px]",
            render: (_, index) => (
                <div className="flex justify-center py-1">
                    <span className="min-w-[18px] text-left font-mono text-[9px] font-bold text-slate-400">
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(
                            2,
                            "0",
                        )}
                    </span>
                </div>
            ),
        };

        const baseContext = {
            config,
            auxData,
            navigate,
            currentPage,
            itemsPerPage,
            refresh: fetchData,
            handlers: {
                toggleStatus: handleToggleStatus,
                deleteRow: handleDelete,
            },
        };

        let columns = [];

        if (typeof config.columns === "function") {
            columns = config.columns(baseContext);
        } else {
            columns = (config.columns || []).map((column) => ({
                header: column.header || column.label,
                align: column.align || "text-left",
                render: (row) => renderColumnCell(row, column, baseContext),
            }));
        }

        const actionColumn =
            config.actions?.enabled === false
                ? null
                : {
                    header: config.actions?.header || "KONTROL DATA",
                    align: config.actions?.align || "text-center w-[260px]",
                    render: (row) => (
                        <MasterRowActions
                            row={row}
                            config={config}
                            navigate={navigate}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                        />
                    ),
                };

        return [
            ...(config.showNumber === false ? [] : [numberColumn]),
            ...columns,
            ...(actionColumn ? [actionColumn] : []),
        ];
    }, [
        config,
        auxData,
        navigate,
        currentPage,
        itemsPerPage,
        fetchData,
        handleToggleStatus,
    ]);

    const createButton = config.routes?.create ? (
        <Button
            text={config.createLabel || `Tambah ${config.entityName || "Data"}`}
            icon={<Plus size={14} />}
            onClick={() => navigate(config.routes.create)}
            className="!rounded-full !bg-[#0AC4E0] !px-6 !py-2.5 !text-[9px] font-black !uppercase text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95"
        />
    ) : null;

    const filterSelectorItems = (config.filters || []).map((filter) => ({
        value: filter.name,
        label: getFilterLabel(filter).toUpperCase(),
    }));

    return (
        <MasterPageShell
            title={config.pageTitle || "Manajemen Data"}
            highlight={config.pageHighlight || config.entityName}
            subtitle={config.subtitle || "Sistem Pemantauan Program"}
            action={createButton}
            contentClassName="flex flex-col"
        >
            <div className="shrink-0 px-10 py-5">
                <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_220px_260px_44px]">
                    <div className="relative">
                        <Input
                            placeholder={
                                config.searchPlaceholder ||
                                `Cari ${config.entityName || "data"}...`
                            }
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full !rounded-xl !bg-slate-50/70 !py-2.5 !pl-11 !text-[11px] font-bold"
                        />

                        <SearchIcon
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                            size={15}
                        />
                    </div>

                    {(config.filters || []).length > 0 && (
                        <>
                            <Dropdown
                                icon={SlidersHorizontal}
                                value={activeFilterName}
                                items={filterSelectorItems}
                                onChange={updateActiveFilterName}
                                className="!rounded-xl !bg-slate-50/70 !py-2 !text-[9px] font-black uppercase"
                            />

                            <Dropdown
                                icon={activeFilter?.icon || Filter}
                                value={
                                    activeFilter
                                        ? filters[activeFilter.name] ||
                                        activeFilter.defaultValue ||
                                        "all"
                                        : "all"
                                }
                                items={activeFilterItems}
                                onChange={(value) =>
                                    activeFilter &&
                                    updateFilterValue(activeFilter.name, value)
                                }
                                className="!rounded-xl !bg-slate-50/70 !py-2 !text-[9px] font-black uppercase"
                            />
                        </>
                    )}

                    <button
                        type="button"
                        onClick={resetFilter}
                        title="Reset Filter"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-[#0AC4E0] hover:text-white active:rotate-180"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="w-fit rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-3 py-1.5 text-[8px] font-black uppercase leading-none tracking-widest text-[#0AC4E0]">
                        <Filter size={11} className="mr-2 inline" />
                        Hasil Filter: {totalItems} {config.countLabel || "Data"}
                    </div>

                    {activeFilter && (
                        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-[8px] font-black uppercase leading-none tracking-widest text-slate-400">
                            Filter Aktif:{" "}
                            <span className="text-slate-700">
                                {getFilterLabel(activeFilter)}
                            </span>
                        </div>
                    )}

                    {loading && (
                        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                            <Loader2 size={11} className="animate-spin" />
                            Memuat Data
                        </div>
                    )}

                    {summaryItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.label}
                                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-[8px] font-black uppercase leading-none tracking-widest text-slate-400"
                            >
                                {Icon && (
                                    <Icon size={11} className="mr-2 inline text-[#0AC4E0]" />
                                )}
                                {item.label}:{" "}
                                <span className="text-slate-700">{item.value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-10 pb-4">
                <div className="master-read-table no-scrollbar flex-1 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                    <Table
                        columns={tableColumns}
                        data={currentData}
                        className="min-w-full border-separate border-spacing-0"
                    />

                    {!loading && currentData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-900 opacity-20">
                            <LayoutGrid size={52} className="mb-4" strokeWidth={1} />

                            <p className="text-xs font-black uppercase tracking-widest">
                                Data Tidak Ditemukan
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto border-t border-slate-50 bg-slate-50/40 px-10 py-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    loading={loading}
                />
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
      .master-read-table {
        background: #ffffff;
      }

      .master-read-table table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
        min-width: max(980px, 100%);
        table-layout: auto;
      }

      .master-read-table thead th {
        background-color: #0AC4E0 !important;
        color: white !important;
        height: 48px !important;
        padding: 0.8rem 1rem !important;
        border: none !important;
        text-align: center !important;
        vertical-align: middle !important;

        font-size: 8.5px !important;
        font-weight: 900 !important;
        line-height: 1.1 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.13em !important;

        position: sticky;
        top: 0;
        z-index: 10;
        min-width: 108px !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
        hyphens: none !important;
      }

      .master-read-table thead th:first-child {
        border-top-left-radius: 1.35rem !important;
      }

      .master-read-table thead th:last-child {
        border-top-right-radius: 1.35rem !important;
      }

      .master-read-table tbody tr {
        height: 62px !important;
        transition: all 0.2s ease;
      }

      .master-read-table tbody td {
        height: 62px !important;
        padding: 0.55rem 1rem !important;
        border-bottom: 1px solid #F1F5F9 !important;
        vertical-align: middle !important;
        background: #ffffff !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
        hyphens: none !important;
      }

      .master-read-table tbody tr:last-child td {
        border-bottom: none !important;
      }

      .master-read-table tbody tr:hover td {
        background-color: rgba(10, 196, 224, 0.04) !important;
      }

      .master-read-table tbody td > div {
        min-height: 42px !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        display: flex !important;
        align-items: center !important;
      }

      .master-read-table tbody td:first-child > div {
        justify-content: center !important;
      }

      .master-read-table tbody td p {
        line-height: 1.25 !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
        hyphens: none !important;
      }

      .master-read-table tbody td p[class*="text-[11px]"] {
        font-size: 10.5px !important;
      }

      .master-read-table tbody td p[class*="text-[9px]"] {
        font-size: 8.5px !important;
      }

      .master-read-table tbody td p[class*="tracking-widest"][class*="text-slate-300"],
      .master-read-table tbody td p[class*="leading-relaxed"][class*="text-slate-400"] {
        display: none !important;
      }

      .master-read-table tbody td .h-10.w-10 {
        height: 2rem !important;
        width: 2rem !important;
        border-radius: 0.8rem !important;
      }

      .master-read-table tbody td .h-10.w-10 svg {
        width: 15px !important;
        height: 15px !important;
      }

      .master-read-table tbody td span.rounded-lg {
        padding: 0.28rem 0.55rem !important;
        font-size: 8px !important;
        line-height: 1 !important;
        border-radius: 0.55rem !important;
      }

      .master-read-table tbody td button {
        flex-shrink: 0;
      }

      .master-read-table tbody td svg {
        flex-shrink: 0;
      }

      .master-read-table tbody td:last-child > div {
        justify-content: center !important;
      }
    `,
                }}
            />
        </MasterPageShell>
    );
}
