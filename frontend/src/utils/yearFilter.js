export const ALL_YEARS = "ALL";

export function getItemYear(item = {}) {
    return String(
        item.tahun ||
        item.tahun_program ||
        item.year ||
        item.periode_tahun ||
        "",
    ).trim();
}

export function buildYearOptions(items = [], label = "Semua Tahun") {
    const years = [
        ...new Set(items.map((item) => getItemYear(item)).filter(Boolean)),
    ].sort((a, b) => Number(b) - Number(a));

    return [
        { label, value: ALL_YEARS },
        ...years.map((year) => ({
            label: `Tahun ${year}`,
            value: year,
        })),
    ];
}

export function matchYearFilter(item = {}, selectedYear = ALL_YEARS) {
    if (!selectedYear || selectedYear === ALL_YEARS) return true;
    return getItemYear(item) === String(selectedYear);
}
