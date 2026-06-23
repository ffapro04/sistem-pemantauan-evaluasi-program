/* eslint-disable react/prop-types */
import { Award, Building2, MapPin, School } from "lucide-react";
import Card from "./Card";
import EmptyState from "./EmptyState";

function ProfileList({
    title = "Database",
    subtitle = "Profile List",
    items = [],
    countLabel = "Unit",
    className = "",
    getTitle = (item) => item.nama || item.title || "-",
    getImage = (item) => item.logo || item.image,
    getMeta = (item) => item.npsn || item.meta || "-",
    getLocation = (item) => item.wilayah || item.location || "-",
    getBadge = (item) => item.akreditasi || item.badge || "-",
    metaLabel = "NPSN",
    badgeLabel = "Akreditasi",
}) {
    return (
        <Card
            className={`!m-0 flex h-full min-h-[520px] flex-col overflow-hidden !rounded-2xl !border !border-slate-200/80 !bg-white !p-6 shadow-sm ${className}`}
        >
            <div className="mb-5 flex shrink-0 items-center justify-between border-b border-slate-100 pb-4">
                <div>
                    <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-[#0AC4E0]">
                        {subtitle}
                    </p>

                    <h3 className="text-[15px] font-black tracking-tight text-[#083344]">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-[#0AC4E0]/20 bg-[#0AC4E0]/10 px-3 py-1.5">
                    <Building2 size={12} className="text-[#0AC4E0]" />

                    <span className="text-[10px] font-bold text-[#0AC4E0]">
                        {items.length} {countLabel}
                    </span>
                </div>
            </div>

            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
                {items.length > 0 ? (
                    items.map((item, index) => {
                        const titleValue = getTitle(item);
                        const imageValue = getImage(item);
                        const metaValue = getMeta(item);
                        const locationValue = getLocation(item);
                        const badgeValue = getBadge(item);

                        return (
                            <div
                                key={item.id || index}
                                className="group rounded-xl border border-slate-200/60 bg-slate-50/80 p-4 leading-none shadow-sm transition-all hover:border-[#0AC4E0]/30 hover:bg-white"
                            >
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="relative shrink-0">
                                        {imageValue ? (
                                            <img
                                                src={imageValue}
                                                className="h-12 w-12 rounded-xl border-2 border-white object-cover shadow-sm"
                                                alt={titleValue}
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-[#0AC4E0]/10 text-[#0AC4E0] shadow-sm">
                                                <Building2 size={20} />
                                            </div>
                                        )}

                                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-md border border-white bg-[#083344]">
                                            <span className="text-[7px] font-black text-[#0AC4E0]">
                                                {index + 1}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h4 className="mb-1 truncate text-[13px] font-bold leading-tight text-[#083344] transition-colors group-hover:text-[#0AC4E0]">
                                            {titleValue}
                                        </h4>

                                        <p className="font-mono text-[10px] font-semibold tracking-wide text-slate-400">
                                            {metaLabel}: {metaValue}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2.5 py-2">
                                        <MapPin size={10} className="shrink-0 text-slate-300" />

                                        <span className="truncate text-[10px] font-semibold text-slate-500">
                                            {String(locationValue).split("/").pop() || "-"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 rounded-lg border border-[#0AC4E0]/15 bg-[#0AC4E0]/10 px-2.5 py-2">
                                        <Award size={10} className="shrink-0 text-[#0AC4E0]" />

                                        <span className="truncate text-[10px] font-bold text-[#0891b2]">
                                            {badgeLabel} {badgeValue}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <EmptyState
                        icon={<School size={34} />}
                        title="Data Kosong"
                        description="Profile belum tersedia pada data ini."
                    />
                )}
            </div>
        </Card>
    );
}

export default ProfileList;
