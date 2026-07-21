// src/components/masterCrud/masterCrudUtils.js

import { getAuthToken } from "../../utils/authSession";

export const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

export const buildApiUrl = (endpoint) => {
    if (!endpoint) return API_BASE_URL;
    if (endpoint.startsWith("http")) return endpoint;
    return `${API_BASE_URL}${endpoint}`;
};

export const buildFreshApiUrl = (endpoint) => {
    const url = buildApiUrl(endpoint);
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}_ts=${Date.now()}`;
};

export const getTokenHeader = () => {
    const token = getAuthToken();

    return {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
        Pragma: "no-cache",
    };
};

export const getArrayPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.user)) return payload.user;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.wilayah)) return payload.wilayah;
    if (Array.isArray(payload?.vendor)) return payload.vendor;
    if (Array.isArray(payload?.vendors)) return payload.vendors;

    return [];
};

export const normalizeText = (value) =>
    String(value || "")
        .trim()
        .toLowerCase();

export const isActiveValue = (value) =>
    value === true || value === "true" || Number(value) === 1;

export const toSafeNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

export const getNestedValue = (object, path, fallback = "-") => {
    if (!path) return fallback;

    const value = String(path)
        .split(".")
        .reduce((result, key) => result?.[key], object);

    return value ?? fallback;
};

export const formatStatusText = (value) => {
    return isActiveValue(value) ? "Aktif" : "Nonaktif";
};

export const cleanWilayahName = (value) => {
    const raw = String(value || "").trim();

    if (!raw || raw === "undefined") return "Wilayah Tidak Diketahui";

    if (raw.includes("/")) {
        return raw.split("/").filter(Boolean).pop() || raw;
    }

    return raw;
};
