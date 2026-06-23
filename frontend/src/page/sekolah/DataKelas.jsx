import React from "react";
import { jwtDecode } from "jwt-decode";
import MasterReadPage from "../../components/masterCrud/MasterReadPage";
import { kelasConfig } from "../../config/masterCrud/kelas.config";

const getCurrentUser = () => {
    try {
        const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");

        if (userFromStorage && Object.keys(userFromStorage).length > 0) {
            return userFromStorage;
        }

        const token = localStorage.getItem("token");
        if (!token) return {};

        return jwtDecode(token);
    } catch {
        return {};
    }
};

const isOperatorSekolah = () => {
    const user = getCurrentUser();

    const idRole = Number(user?.id_role || user?.role_id || 0);
    const role = String(user?.role || user?.nama_role || "").toLowerCase();
    const jabatan = String(user?.jabatan || "").toLowerCase();

    return (
        idRole === 9 ||
        role.includes("operator") ||
        jabatan.includes("operator sekolah") ||
        jabatan.includes("operator")
    );
};

const getReadOnlyKelasConfig = () => {
    return {
        ...kelasConfig,
        subtitle: "Daftar kelas pada sekolah Anda",
        routes: {
            read: kelasConfig.routes.read,
            detail: kelasConfig.routes.detail,
        },
        api: {
            list: kelasConfig.api.list,
            detail: kelasConfig.api.detail,
        },
        status: null,
        deleteConfirmation: null,
    };
};

export default function DataKelas() {
    const config = isOperatorSekolah()
        ? kelasConfig
        : getReadOnlyKelasConfig();

    return <MasterReadPage config={config} />;
}