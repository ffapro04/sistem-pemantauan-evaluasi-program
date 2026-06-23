import React from "react";
import { Navigate } from "react-router-dom";
import MasterFormPage from "../../components/masterCrud/MasterFormPage";
import { kelasConfig } from "../../config/masterCrud/kelas.config";

const isOperatorSekolah = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const idRole = Number(user?.id_role || user?.role_id || 0);
        const role = String(user?.role || user?.nama_role || "").toLowerCase();
        const jabatan = String(user?.jabatan || "").toLowerCase();

        return (
            idRole === 9 ||
            role.includes("operator") ||
            jabatan.includes("operator sekolah") ||
            jabatan.includes("operator")
        );
    } catch {
        return false;
    }
};

export default function CreateKelas() {
    if (!isOperatorSekolah()) {
        return <Navigate to="/sekolah/kelas" replace />;
    }

    return <MasterFormPage config={kelasConfig} mode="create" />;
}
