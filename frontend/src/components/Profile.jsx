/* eslint-disable react/prop-types */
import { User, Mail, ShieldCheck } from "lucide-react";

function Profile({ user }) {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                        <User size={24} />
                    </div>

                    <div className="min-w-0 text-left">
                        <h3 className="truncate text-sm font-black uppercase tracking-tight text-slate-800">
                            {user?.nama || "Pengguna"}
                        </h3>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                            {user?.email || "Email belum tersedia"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-3">
                <InfoRow
                    icon={<Mail size={15} />}
                    label="Email"
                    value={user?.email || "-"}
                />

                <InfoRow
                    icon={<ShieldCheck size={15} />}
                    label="Role"
                    value={user?.role || user?.jenis || "-"}
                />
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3">
            <div className="flex items-center gap-3 text-slate-400">
                {icon}
                <span className="text-[11px] font-black uppercase tracking-widest">
                    {label}
                </span>
            </div>

            <span className="max-w-[180px] truncate text-right text-xs font-bold text-slate-600">
                {value}
            </span>
        </div>
    );
}

export default Profile;
