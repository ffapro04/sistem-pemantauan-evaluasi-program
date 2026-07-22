/* eslint-disable react/prop-types */
import PageState from "./ui/PageState";

function EmptyState({
    icon,
    title = "Data Kosong",
    description = "Belum ada data yang tersedia.",
    className = "",
}) {
    return (
        <PageState
            title={title}
            description={description}
            eyebrow="Status Data"
            icon={icon ? () => icon : undefined}
            className={`min-h-[220px] bg-transparent px-0 ${className}`}
        />
    );
}

export default EmptyState;

