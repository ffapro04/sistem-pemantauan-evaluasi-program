import PropTypes from "prop-types";
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

EmptyState.propTypes = {
    icon: PropTypes.node,
    title: PropTypes.node,
    description: PropTypes.node,
    className: PropTypes.string,
};

export default EmptyState;

