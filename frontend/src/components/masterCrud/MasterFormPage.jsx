// src/components/masterCrud/MasterFormPage.jsx

/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
    RefreshCw,
    Save,
    ChevronLeft,
    Database,
    ShieldCheck,
} from "lucide-react";

import Button from "../Button";
import Label from "../Label";

import MasterPageShell from "./MasterPageShell";
import MasterAlert from "./MasterAlert";
import MasterField from "./MasterField";

import {
    buildApiUrl,
    buildFreshApiUrl,
    getTokenHeader,
    getArrayPayload,
} from "./masterCrudUtils";

const resolveValue = (value, context, fallback = undefined) => {
    if (typeof value === "function") return value(context);
    if (value === undefined) return fallback;
    return value;
};

const getInitialFormData = (config, mode, user = null) => {
    if (typeof config.getInitialValues === "function") {
        return config.getInitialValues({ mode, user });
    }

    const values = {
        ...(config.initialValues || {}),
    };

    (config.sections || []).forEach((section) => {
        (section.fields || []).forEach((field) => {
            if (values[field.name] !== undefined) return;

            if (field.defaultValue !== undefined) {
                values[field.name] = field.defaultValue;
            } else if (field.type === "select") {
                values[field.name] = field.options?.[0]?.value || "";
            } else {
                values[field.name] = "";
            }
        });
    });

    return values;
};

const normalizeDetailPayload = (payload, config, context) => {
    if (typeof config.normalizeDetail === "function") {
        return config.normalizeDetail(payload, context);
    }

    return payload || {};
};

const validateFormByConfig = ({ config, mode, formData, auxData, user }) => {
    const context = {
        config,
        mode,
        formData,
        auxData,
        user,
    };

    if (typeof config.validate === "function") {
        const result = config.validate(context);

        if (result === true) return { valid: true };
        if (typeof result === "string") {
            return { valid: false, message: result };
        }

        return {
            valid: result?.valid !== false,
            message: result?.message || "Data belum lengkap.",
        };
    }

    for (const section of config.sections || []) {
        for (const field of section.fields || []) {
            const hidden = resolveValue(
                field.hidden,
                {
                    field,
                    formData,
                    auxData,
                    mode,
                },
                false,
            );

            if (hidden) continue;

            const required = resolveValue(
                field.required,
                {
                    field,
                    formData,
                    auxData,
                    mode,
                },
                false,
            );

            const requiredOnCreate = resolveValue(
                field.requiredOnCreate,
                {
                    field,
                    formData,
                    auxData,
                    mode,
                },
                false,
            );

            const requiredOnEdit = resolveValue(
                field.requiredOnEdit,
                {
                    field,
                    formData,
                    auxData,
                    mode,
                },
                false,
            );

            const mustValidate =
                required ||
                (mode === "create" && requiredOnCreate) ||
                (mode === "edit" && requiredOnEdit);

            if (!mustValidate) continue;

            const value = formData[field.name];

            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {
                return {
                    valid: false,
                    message: `${field.label || field.name} wajib diisi.`,
                };
            }

            if (
                field.type === "password" &&
                field.minLength &&
                String(value).length < field.minLength
            ) {
                return {
                    valid: false,
                    message: `${field.label || "Password"} minimal ${field.minLength} karakter.`,
                };
            }
        }
    }

    return { valid: true };
};

export default function MasterFormPage({ config, mode = "create" }) {
    const navigate = useNavigate();
    const params = useParams();

    const id = params.id;

    const isCreate = mode === "create";
    const isEdit = mode === "edit";

    const [user, setUser] = useState(null);
    const [userReady, setUserReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
                setUserReady(true);
            } catch (err) {
                console.warn("Failed to decode JWT:", err);
                setUserReady(true);
            }
        } else {
            setUserReady(true);
        }
    }, []);

    const [formData, setFormData] = useState(() =>
        getInitialFormData(config, mode, null),
    );

    useEffect(() => {
        if (userReady && isCreate) {
            setFormData(getInitialFormData(config, mode, user));
        }
    }, [userReady, user, config, mode, isCreate]);

    const [auxData, setAuxData] = useState({});
    const [fetching, setFetching] = useState(isEdit);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [statusNote, setStatusNote] = useState({
        show: false,
        type: null,
        message: "",
    });

    const context = useMemo(
        () => ({
            config,
            mode,
            id,
            params,
            formData,
            auxData,
            user,
            navigate,
            setFormData,
            setStatusNote,
        }),
        [config, mode, id, params, formData, auxData, user, navigate],
    );

    const setField = useCallback(
        (field, value) => {
            setFormData((prev) => {
                const next = {
                    ...prev,
                    [field]: value,
                };

                if (typeof config.onFieldChange === "function") {
                    return config.onFieldChange({
                        field,
                        value,
                        previous: prev,
                        next,
                        formData: prev,
                        auxData,
                        mode,
                    });
                }

                return next;
            });
        },
        [config, auxData, mode],
    );

    const fetchAuxiliary = useCallback(async () => {
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

        setAuxData(nextAuxData);

        return nextAuxData;
    }, [config.auxiliary]);

    const dynamicDeps = (config.auxiliaryDynamic || [])
        .map((aux) => formData[aux.dependsOn])
        .join(",");

    useEffect(() => {
        if (!config.auxiliaryDynamic) return;

        const fetchDynamic = async () => {
            for (const aux of config.auxiliaryDynamic) {
                const endpoint =
                    typeof aux.endpoint === "function"
                        ? aux.endpoint(formData)
                        : null;

                if (!endpoint) {
                    setAuxData((prev) => ({
                        ...prev,
                        [aux.key]: [],
                    }));
                    continue;
                }

                try {
                    const response = await axios.get(buildFreshApiUrl(endpoint), {
                        headers: getTokenHeader(),
                    });

                    const payload =
                        typeof aux.getPayload === "function"
                            ? aux.getPayload(response.data)
                            : getArrayPayload(response.data);

                    setAuxData((prev) => ({
                        ...prev,
                        [aux.key]: payload,
                    }));
                } catch (error) {
                    console.warn(
                        `Gagal fetch dynamic auxiliary ${aux.key}`,
                        error,
                    );

                    setAuxData((prev) => ({
                        ...prev,
                        [aux.key]: [],
                    }));
                }
            }
        };

        fetchDynamic();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.auxiliaryDynamic, dynamicDeps]);

    const fetchDetail = useCallback(
        async (preparedAuxData = {}) => {
            if (!isEdit) return;

            try {
                setFetching(true);

                const detailEndpoint =
                    typeof config.api?.detail === "function"
                        ? config.api.detail(id)
                        : config.api?.detail;

                const response = await axios.get(buildFreshApiUrl(detailEndpoint), {
                    headers: getTokenHeader(),
                });

                const normalized = normalizeDetailPayload(response.data, config, {
                    id,
                    params,
                    auxData: preparedAuxData,
                    mode,
                });

                setFormData((prev) => ({
                    ...prev,
                    ...normalized,
                }));
            } catch (error) {
                console.error("MasterFormPage Fetch Detail Error:", error);

                setStatusNote({
                    show: true,
                    type: "error",
                    message:
                        config.messages?.detailError ||
                        `Gagal mengambil data ${config.entityName || "master"
                        }.`,
                });

                setTimeout(() => {
                    navigate(config.routes?.read || -1);
                }, 1200);
            } finally {
                setFetching(false);
            }
        },
        [config, id, isEdit, mode, navigate, params],
    );

    useEffect(() => {
        const init = async () => {
            const preparedAuxData = await fetchAuxiliary();

            if (isEdit) {
                await fetchDetail(preparedAuxData);
            }
        };

        init();
    }, [fetchAuxiliary, fetchDetail, isEdit]);

    const buildPayload = () => {
        const payloadContext = {
            config,
            mode,
            id,
            params,
            formData,
            auxData,
            user,
        };

        if (typeof config.buildPayload === "function") {
            return config.buildPayload(payloadContext);
        }

        return { ...formData };
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        setStatusNote({
            show: false,
            type: null,
            message: "",
        });

        const validation = validateFormByConfig({
            config,
            mode,
            formData,
            auxData,
            user,
        });

        if (!validation.valid) {
            setStatusNote({
                show: true,
                type: "error",
                message: validation.message || "Data belum lengkap.",
            });

            return;
        }

        setLoading(true);

        try {
            const payload = buildPayload();

            if (typeof config.beforeSubmit === "function") {
                await config.beforeSubmit({
                    config,
                    mode,
                    id,
                    params,
                    formData,
                    payload,
                    auxData,
                    setStatusNote,
                });
            }

            const endpoint =
                mode === "create"
                    ? config.api?.create
                    : typeof config.api?.update === "function"
                        ? config.api.update(id)
                        : config.api?.update;

            const method =
                mode === "create"
                    ? config.api?.createMethod || "post"
                    : config.api?.updateMethod || "patch";

            await axios[method](buildApiUrl(endpoint), payload, {
                headers:
                    payload instanceof FormData
                        ? {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token",
                            )}`,
                        }
                        : getTokenHeader(),
            });

            setStatusNote({
                show: true,
                type: "success",
                message:
                    mode === "create"
                        ? config.messages?.createSuccess ||
                        `${config.entityName || "Data"
                        } berhasil disimpan.`
                        : config.messages?.updateSuccess ||
                        `${config.entityName || "Data"
                        } berhasil diperbarui.`,
            });

            setTimeout(() => {
                navigate(config.routes?.read || -1);
            }, config.redirectDelay || 1400);
        } catch (error) {
            console.error("MasterFormPage Submit Error:", error);
            console.error("Error response:", error.response?.data);

            const errMsg =
                error.response?.data?.message ||
                config.messages?.submitError ||
                "Gagal menyimpan data.";

            setStatusNote({
                show: true,
                type: "error",
                message: Array.isArray(errMsg) ? errMsg.join(", ") : errMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <RefreshCw className="animate-spin text-[#0AC4E0]" size={40} />
            </div>
        );
    }

    const title =
        mode === "create"
            ? config.formTitle?.create || "Tambah Data"
            : config.formTitle?.edit || "Edit Data";

    const highlight = config.pageHighlight || config.entityName || "";

    const submitText =
        mode === "create"
            ? loading
                ? "Menyimpan..."
                : config.submitLabel?.create || "Simpan Data"
            : loading
                ? "Memperbarui..."
                : config.submitLabel?.edit || "Update Data";

    return (
        <MasterPageShell
            title={title}
            highlight={highlight}
            subtitle={config.subtitle || "Sistem Pemantauan Program"}
            backPath={config.routes?.read}
            contentClassName="flex flex-col"
        >
            <MasterAlert note={statusNote} setNote={setStatusNote} />

            <form
                onSubmit={handleSubmit}
                className={
                    config.formGridClassName ||
                    "grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[58%_42%]"
                }
            >
                <div className="no-scrollbar overflow-y-auto px-10 py-7 pb-10">
                    <div className="space-y-6">
                        {(config.sections || []).map((section) => {
                            const hidden = resolveValue(
                                section.hidden,
                                context,
                                false,
                            );

                            if (hidden) return null;

                            const SectionIcon = section.icon || Database;

                            return (
                                <div
                                    key={section.title}
                                    className={
                                        section.className ||
                                        "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5"
                                    }
                                >
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                                            <SectionIcon size={21} />
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                                                {section.title}
                                            </p>

                                            {section.description && (
                                                <p className="text-[9px] font-bold text-gray-400">
                                                    {section.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            section.gridClassName ||
                                            "grid grid-cols-1 gap-4 md:grid-cols-2"
                                        }
                                    >
                                        {(section.fields || []).map((field) => (
                                            <MasterField
                                                key={field.name}
                                                field={field}
                                                value={formData[field.name]}
                                                formData={formData}
                                                auxData={auxData}
                                                mode={mode}
                                                onChange={setField}
                                                showPassword={showPassword}
                                                setShowPassword={
                                                    setShowPassword
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {config.infoBox !== false && (
                            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                                        <ShieldCheck size={21} />
                                    </div>

                                    <p className="text-[10px] font-bold leading-relaxed text-slate-400">
                                        {typeof config.infoBox === "function"
                                            ? config.infoBox(context)
                                            : config.infoBox ||
                                            "Pastikan seluruh data sudah benar sebelum disimpan ke sistem."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex min-h-0 flex-col border-l border-gray-100 p-7">
                    <div className="mb-5">
                        <Label
                            text={config.previewLabel || "Preview Data"}
                            className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                        />

                        <h2 className="text-lg font-black uppercase text-gray-800">
                            {config.previewTitle || "Ringkasan Data"}
                        </h2>
                    </div>

                    <div className="no-scrollbar flex-1 overflow-y-auto">
                        <div className="space-y-3">
                            {(config.preview || []).map((item) => {
                                const value =
                                    typeof item.value === "function"
                                        ? item.value({
                                            formData,
                                            auxData,
                                            mode,
                                            config,
                                        })
                                        : item.key
                                            ? formData[item.key]
                                            : item.value;

                                return (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl bg-slate-50/70 p-4"
                                    >
                                        <Label
                                            text={item.label}
                                            className="!mb-1 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                                        />

                                        <p
                                            className={
                                                item.className ||
                                                "truncate text-[12px] font-black uppercase text-gray-800"
                                            }
                                        >
                                            {value || "-"}
                                        </p>
                                    </div>
                                );
                            })}

                            {(!config.preview ||
                                config.preview.length === 0) && (
                                    <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                                        <Database
                                            className="mx-auto mb-3 text-[#0AC4E0]"
                                            size={32}
                                        />

                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Preview belum dikonfigurasi.
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="mt-5 flex shrink-0 items-center justify-between border-t border-gray-100 pt-5">
                        <Button
                            text="Batal"
                            icon={<ChevronLeft size={14} />}
                            onClick={() => navigate(config.routes?.read || -1)}
                            className="!rounded-full !border !border-slate-100 !bg-white !px-7 !py-3 !text-[9px] font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
                        />

                        <Button
                            text={submitText}
                            icon={<Save size={15} />}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="!rounded-full !bg-[#0AC4E0] !px-8 !py-3 !text-[9px] font-black !uppercase !text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95"
                        />
                    </div>
                </div>
            </form>
        </MasterPageShell>
    );
}
