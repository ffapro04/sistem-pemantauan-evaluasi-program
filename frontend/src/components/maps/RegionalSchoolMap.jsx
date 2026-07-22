/* eslint-disable react/prop-types */
import { useEffect, useMemo } from "react";
import {
    GeoJSON,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import { MapPin, School } from "lucide-react";
import indonesiaGeoJson from "../../assets/maps/indonesia-province-simple.json";

const DEFAULT_CENTER = [-2.5489, 118.0149];
const DEFAULT_ZOOM = 5;
const INDONESIA_MAX_BOUNDS = [
    [-13.0, 92.0],
    [8.2, 143.5],
];
const INDONESIA_GEOJSON_STYLE = {
    color: "#0AC4E0",
    weight: 1.3,
    opacity: 0.85,
    fillColor: "#0AC4E0",
    fillOpacity: 0.09,
};

const schoolIcon = L.divIcon({
    className: "school-map-marker",
    html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 14px;
      background: #0AC4E0;
      border: 3px solid white;
      box-shadow: 0 14px 28px rgba(10,196,224,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
      font-size: 14px;
    ">
      S
    </div>
  `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
});

function getLat(school) {
    return Number(
        school?.latitude ||
        school?.lat ||
        school?.koordinat_lat ||
        school?.lokasi_lat ||
        school?.sekolah?.latitude ||
        school?.sekolah?.lat,
    );
}

function getLng(school) {
    return Number(
        school?.longitude ||
        school?.lng ||
        school?.lon ||
        school?.koordinat_lng ||
        school?.lokasi_lng ||
        school?.sekolah?.longitude ||
        school?.sekolah?.lng,
    );
}

function getSchoolName(school) {
    return school?.nama_sekolah || school?.nama || "Sekolah";
}

function getSchoolAddress(school) {
    return (
        school?.alamat ||
        school?.alamat_sekolah ||
        school?.address ||
        "Alamat belum tersedia"
    );
}

function getSchoolLevel(school) {
    return (
        school?.jenjang ||
        school?.jenjang_sekolah ||
        school?.tingkat ||
        school?.level ||
        "Sekolah"
    );
}

function getWilayahName(school) {
    return (
        school?.wilayah?.nama_wilayah?.split("/")?.filter(Boolean)?.pop() ||
        school?.nama_wilayah ||
        "Wilayah belum terbaca"
    );
}

function getWilayahCenter(wilayah) {
    const lat = Number(
        wilayah?.latitude || wilayah?.lat || wilayah?.koordinat_lat,
    );

    const lng = Number(
        wilayah?.longitude || wilayah?.lng || wilayah?.lon || wilayah?.koordinat_lng,
    );

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return [lat, lng];
    }

    return DEFAULT_CENTER;
}

function MapAutoFocus({ schools, wilayah, mode }) {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize({ pan: false });

        const validPositions = schools
            .map((school) => [getLat(school), getLng(school)])
            .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

        if (validPositions.length > 1) {
            const bounds = L.latLngBounds(validPositions);

            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: mode === "admin" ? 7 : 10,
            });

            return;
        }

        if (validPositions.length === 1) {
            map.setView(validPositions[0], mode === "admin" ? 7 : 10);
            return;
        }

        map.setView(getWilayahCenter(wilayah), mode === "admin" ? 5 : 8);
    }, [map, schools, wilayah, mode]);

    return null;
}

function MapResizeGuard({ refreshKey }) {
    const map = useMap();

    useEffect(() => {
        const refresh = () => {
            map.invalidateSize({ pan: false });
        };

        refresh();
        const timers = [80, 240, 520, 900].map((delay) =>
            window.setTimeout(refresh, delay),
        );
        window.addEventListener("resize", refresh);

        return () => {
            timers.forEach((timer) => window.clearTimeout(timer));
            window.removeEventListener("resize", refresh);
        };
    }, [map, refreshKey]);

    return null;
}

export default function RegionalSchoolMap({
    schools = [],
    wilayah = null,
    mode = "regional",
    title,
    subtitle,
}) {
    const mappedSchools = useMemo(() => {
        return schools
            .map((school) => ({
                ...school,
                __lat: getLat(school),
                __lng: getLng(school),
            }))
            .filter(
                (school) =>
                    Number.isFinite(school.__lat) && Number.isFinite(school.__lng),
            );
    }, [schools]);

    const center = getWilayahCenter(wilayah);

    const mapTitle =
        title || (mode === "admin" ? "Peta Sebaran Semua Sekolah" : "Peta Sebaran Sekolah");

    const mapSubtitle =
        subtitle ||
        (mode === "admin"
            ? "Menampilkan seluruh sekolah yang terdaftar dalam sistem"
            : "Zoom dibatasi sesuai wilayah/provinsi otoritas");

    return (
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                    <h2 className="text-[14px] font-black tracking-tight text-slate-800">
                        {mapTitle}
                    </h2>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {mapSubtitle}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                    <MapPin size={18} />
                </div>
            </div>

            <div className="relative h-[460px] w-full overflow-hidden bg-cyan-50/30">
                {mappedSchools.length === 0 && (
                    <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-white/80 text-center backdrop-blur-sm">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                            <School size={28} />
                        </div>

                        <p className="mt-4 text-[12px] font-black uppercase tracking-widest text-slate-400">
                            Koordinat sekolah belum tersedia
                        </p>

                        <p className="mt-2 max-w-sm text-[11px] font-semibold leading-5 text-slate-400">
                            Tambahkan latitude dan longitude pada data sekolah agar marker
                            tampil di peta.
                        </p>
                    </div>
                )}

                <MapContainer
                    center={center}
                    zoom={DEFAULT_ZOOM}
                    minZoom={mode === "admin" ? 4 : 5}
                    maxZoom={13}
                    maxBounds={INDONESIA_MAX_BOUNDS}
                    maxBoundsViscosity={1}
                    scrollWheelZoom
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <GeoJSON
                        data={indonesiaGeoJson}
                        style={INDONESIA_GEOJSON_STYLE}
                        interactive={false}
                    />

                    <MapAutoFocus schools={mappedSchools} wilayah={wilayah} mode={mode} />
                    <MapResizeGuard refreshKey={`${mappedSchools.length}-${mode}`} />

                    {mappedSchools.map((school) => (
                        <Marker
                            key={school.id_sekolah || school.id}
                            position={[school.__lat, school.__lng]}
                            icon={schoolIcon}
                        >
                            <Popup>
                                <div className="min-w-[230px]">
                                    <p className="text-sm font-black uppercase text-slate-900">
                                        {getSchoolName(school)}
                                    </p>

                                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                                        {getSchoolAddress(school)}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="rounded-xl bg-cyan-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                            {getSchoolLevel(school)}
                                        </span>

                                        <span className="rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            {getWilayahName(school)}
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </section>
    );
}
