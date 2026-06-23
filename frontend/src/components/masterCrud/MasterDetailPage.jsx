// src/components/masterCrud/MasterDetailPage.jsx

/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
    Edit3,
    RefreshCw,
    Database,
    Mail,
    Fingerprint,
} from "lucide-react";

import Button from "../Button";
import MasterPageShell from "./MasterPageShell";
import MasterAlert from "./MasterAlert";

import {
    buildApiUrl,
    getTokenHeader,
    getArrayPayload,
    getNestedValue,
    isActiveValue,
} from "./masterCrudUtils";

const resolveValue = (source, data, context = {}, fallback = "-") => {
    try {
        if (typeof source === "function") {
            const result = source(data, context);

            return result !== undefined && result !== null && result !== ""
                ? result
                : fallback;
        }

        if (typeof source === "string") {
            return getNestedValue(data, source, fallback);
        }

        if (source !== undefined && source !== null && source !== "") {
            return source;
        }

        return fallback;
    } catch {
        return fallback;
    }
};

const resolvePath = (pathOrFn, data, fallback = "#") => {
    if (typeof pathOrFn === "function") return pathOrFn(data);
    return pathOrFn || fallback;
};

const getInitial = (value) => {
    const raw = String(value || "D").trim();
    return raw.charAt(0).toUpperCase();
};

const getSafeImage = (value) => {
    if (!value || value === "-") return "";
    return String(value);
};

const shouldHideDetailItem = (item) => {
    const key = String(item?.key || item?.name || "").toLowerCase();
    const label = String(item?.label || "").toLowerCase();

    const hiddenFields = [
        "latitude",
        "longitude",
        "lat",
        "lng",
        "logo",
        "logo_url",
        "image",
        "gambar",
        "foto",
        "password",
        "password_hash",
    ];

    return (
        item?.hidden === true ||
        item?.hiddenDetail === true ||
        item?.detailHidden === true ||
        item?.type === "image" ||
        hiddenFields.includes(key) ||
        hiddenFields.includes(label) ||
        label.includes("latitude") ||
        label.includes("longitude")
    );
};

const unwrapDetailPayload = (payload) => {
    if (!payload) return {};

    if (payload.data && typeof payload.data === "object") {
        return payload.data;
    }

    if (payload.result && typeof payload.result === "object") {
        return payload.result;
    }

    return payload;
};

const DetailBadge = ({ item, data, context }) => {
    const BadgeIcon = item.icon;
    const value = resolveValue(item.value || item.key, data, context, "");

    const active =
        typeof item.isActive === "function"
            ? item.isActive(value, data, context)
            : item.type === "status"
                ? isActiveValue(value)
                : true;

    const text =
        typeof item.format === "function"
            ? item.format(value, data, context)
            : value;

    if (!text) return null;

    if (item.type === "status") {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] ${active
                        ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                        : "bg-rose-50 text-rose-600 ring-1 ring-rose-100"
                    }`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                />

                {active
                    ? item.activeText || "Aktif"
                    : item.inactiveText || "Nonaktif"}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0AC4E0]/7 px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#0AC4E0] ring-1 ring-[#0AC4E0]/10">
            {BadgeIcon && <BadgeIcon size={10} />}
            {text}
        </span>
    );
};

const HeaderLogo = ({ image, initial, title, icon: AvatarIcon }) => {
    const safeImage = getSafeImage(image);

    return (
        <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] bg-slate-100 text-[#0AC4E0] ring-1 ring-slate-200 shadow-sm">
            {safeImage ? (
                <img
                    src={safeImage}
                    alt={title || "Logo"}
                    className="h-full w-full object-cover"
                />
            ) : AvatarIcon ? (
                <AvatarIcon size={28} />
            ) : (
                <span className="text-3xl font-black uppercase leading-none">
                    {getInitial(initial)}
                </span>
            )}
        </div>
    );
};

const DetailRecordItem = ({ item, data, context }) => {
    if (shouldHideDetailItem(item)) return null;

    if (typeof item.render === "function") {
        return item.render(data, context);
    }

    const rawValue =
        typeof item.value === "function"
            ? item.value(data, context)
            : resolveValue(item.key, data, context, "-");

    const value =
        item.format && item.type !== "image"
            ? item.format(rawValue, data, context)
            : rawValue;

    return (
        <div className="min-w-0 border-b border-slate-200/80 pb-5 pt-4">
            <p className="text-[8.5px] font-black uppercase tracking-[0.22em] text-slate-400">
                {item.label}
            </p>

            <p className="mt-2 break-words text-[13px] font-bold leading-snug text-slate-900">
                {value || "-"}
            </p>
        </div>
    );
};

export default function MasterDetailPage({ config }) {
    const navigate = useNavigate();
    const params = useParams();
    const id = params.id;

    const [data, setData] = useState(null);
    const [auxData, setAuxData] = useState({});
    const [loading, setLoading] = useState(true);

    const [statusNote, setStatusNote] = useState({
        show: false,
        type: null,
        message: "",
    });

    const fetchAuxiliary = useCallback(async () => {
        const nextAuxData = {};

        for (const aux of config.auxiliary || []) {
            try {
                const response = await axios.get(buildApiUrl(aux.endpoint), {
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

        setAuxData(nextAuxData);

        return nextAuxData;
    }, [config.auxiliary]);

    const fetchDetail = useCallback(
        async (preparedAuxData = {}) => {
            try {
                setLoading(true);

                const endpoint =
                    typeof config.api?.detail === "function"
                        ? config.api.detail(id)
                        : config.api?.detail;

                const response = await axios.get(buildApiUrl(endpoint), {
                    headers: getTokenHeader(),
                });

                const rawDetail = unwrapDetailPayload(response.data);

                const normalized =
                    typeof config.normalizeDetail === "function"
                        ? config.normalizeDetail(rawDetail, {
                            id,
                            params,
                            auxData: preparedAuxData,
                            mode: "detail",
                            config,
                        })
                        : typeof config.normalizeRow === "function"
                            ? config.normalizeRow(rawDetail, {
                                id,
                                params,
                                auxData: preparedAuxData,
                                mode: "detail",
                                config,
                            })
                            : rawDetail;

                setData(normalized);
            } catch (error) {
                console.error("MasterDetailPage Fetch Error:", error);

                setStatusNote({
                    show: true,
                    type: "error",
                    message:
                        config.messages?.detailError ||
                        `Gagal mengambil detail ${config.entityName || "data"
                        }.`,
                });

                setTimeout(() => {
                    navigate(config.routes?.read || -1);
                }, 1200);
            } finally {
                setLoading(false);
            }
        },
        [config, id, navigate, params],
    );

    useEffect(() => {
        const init = async () => {
            const preparedAuxData = await fetchAuxiliary();
            await fetchDetail(preparedAuxData);
        };

        init();
    }, [fetchAuxiliary, fetchDetail]);

    const context = useMemo(
        () => ({
            config,
            id,
            params,
            data,
            auxData,
            navigate,
            refresh: fetchDetail,
        }),
        [config, id, params, data, auxData, navigate, fetchDetail],
    );

    const detailConfig = config.detail || {};

    const titleValue = resolveValue(
        detailConfig.titleKey || config.displayKey || "nama",
        data,
        context,
        config.entityName || "Detail Data",
    );

    const subtitleValue = resolveValue(
        detailConfig.subtitleKey || "email",
        data,
        context,
        "",
    );

    const initialValue = resolveValue(
        detailConfig.initialKey ||
        detailConfig.titleKey ||
        config.displayKey ||
        "nama",
        data,
        context,
        "D",
    );

    const avatarImage = resolveValue(
        detailConfig.avatarImage,
        data,
        context,
        "",
    );

    const detailSections = useMemo(() => {
        if (detailConfig.sections?.length) return detailConfig.sections;

        const fields = [];

        (config.sections || []).forEach((section) => {
            (section.fields || []).forEach((field) => {
                const detailItem = {
                    label: field.label,
                    key: field.name,
                    name: field.name,
                    icon: field.icon,
                    type: field.type,
                    hidden: field.hiddenDetail || field.detailHidden,
                };

                if (field.type === "password") return;
                if (shouldHideDetailItem(detailItem)) return;

                fields.push(detailItem);
            });
        });

        return [
            {
                title: "Informasi Data",
                description: "Ringkasan detail data master.",
                icon: Database,
                items: fields,
            },
        ];
    }, [config.sections, detailConfig.sections]);

    const detailItems = detailSections
        .flatMap((section) =>
            (section.items || []).map((item) => ({
                ...item,
                sectionTitle: section.title,
            })),
        )
        .filter((item) => !shouldHideDetailItem(item));

    const editButton =
        config.routes?.edit && config.actions?.edit !== false ? (
            <Button
                text={config.detail?.editLabel || "Edit Data"}
                icon={<Edit3 size={14} />}
                onClick={() => navigate(resolvePath(config.routes.edit, data))}
                className="!rounded-full !bg-[#0AC4E0] !px-6 !py-2.5 !text-[9px] !font-black !uppercase !text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95"
            />
        ) : null;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <RefreshCw className="animate-spin text-[#0AC4E0]" size={40} />
            </div>
        );
    }

    return (
        <MasterPageShell
            title={config.detailTitle || "Detail Data"}
            highlight={config.pageHighlight || config.entityName}
            subtitle={config.subtitle || "Sistem Pemantauan Program"}
            backPath={config.routes?.read}
            action={editButton}
            contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]"
        >
            <MasterAlert note={statusNote} setNote={setStatusNote} />

            <main className="flex min-h-0 flex-1 flex-col px-10 py-6">
                <section className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.05)]">
                    <div className="relative px-8 pb-7 pt-7">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0AC4E0]/70 via-[#0AC4E0] to-[#0AC4E0]/60" />
                        <div className="absolute right-10 top-6 h-28 w-28 rounded-full bg-[#0AC4E0]/6 blur-3xl" />

                        <div className="flex items-start justify-between gap-7">
                            <div className="flex min-w-0 items-start gap-5">
                                <HeaderLogo
                                    image={avatarImage}
                                    initial={initialValue}
                                    title={titleValue}
                                    icon={detailConfig.avatarIcon}
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        {(detailConfig.badges || []).map(
                                            (badge, index) => (
                                                <DetailBadge
                                                    key={`${badge.label ||
                                                        badge.key ||
                                                        index
                                                        }`}
                                                    item={badge}
                                                    data={data}
                                                    context={context}
                                                />
                                            ),
                                        )}
                                    </div>

                                    <p className="text-[8px] font-black uppercase tracking-[0.35em] text-[#0AC4E0]">
                                        {detailConfig.sideLabel ||
                                            "Data Registry"}
                                    </p>

                                    <h2 className="mt-2 max-w-5xl text-[26px] font-black uppercase leading-none tracking-[-0.04em] text-slate-950">
                                        {titleValue || "-"}
                                    </h2>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        {subtitleValue && (
                                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 ring-1 ring-slate-100">
                                                <Mail
                                                    size={12}
                                                    className="text-[#0AC4E0]"
                                                />
                                                {subtitleValue}
                                            </div>
                                        )}

                                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 ring-1 ring-slate-100">
                                            <Fingerprint
                                                size={12}
                                                className="text-[#0AC4E0]"
                                            />
                                            ID: {id || "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden shrink-0 text-right xl:block">
                                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-slate-300">
                                    Record Detail
                                </p>

                                <p className="mt-2 text-[18px] font-black uppercase tracking-tight text-slate-900">
                                    {detailItems.length} Atribut
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex h-12 items-center justify-center px-8">
                        <div className="absolute left-8 right-8 top-1/2 h-px -translate-y-1/2 bg-slate-200" />

                        <div className="relative z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 shadow-sm">
                            <span className="h-4 w-px bg-[#0AC4E0]/30" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#0AC4E0]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#0AC4E0]/60" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#0AC4E0]/35" />
                            <span className="h-4 w-px bg-[#0AC4E0]/30" />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/55 px-8 pb-8 pt-6">
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-800">
                                    Informasi Detail
                                </p>

                                <p className="mt-1 text-[10px] font-bold text-slate-400">
                                    Ringkasan atribut utama data yang ditopang
                                    oleh identitas utama di bagian atas.
                                </p>
                            </div>

                            <div className="hidden rounded-full bg-white px-4 py-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0] shadow-sm md:block">
                                Attribute Board
                            </div>
                        </div>

                        <div className="rounded-[1.7rem] border border-slate-200 bg-white px-6 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
                            <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2 xl:grid-cols-3">
                                {detailItems.map((item, index) => (
                                    <DetailRecordItem
                                        key={`${item.sectionTitle || "section"
                                            }-${item.label}-${index}`}
                                        item={item}
                                        data={data}
                                        context={context}
                                    />
                                ))}

                                {detailItems.length === 0 && (
                                    <div className="col-span-full py-14 text-center">
                                        <Database
                                            className="mx-auto mb-3 text-[#0AC4E0]"
                                            size={32}
                                        />

                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Detail belum dikonfigurasi.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </MasterPageShell>
    );
}
