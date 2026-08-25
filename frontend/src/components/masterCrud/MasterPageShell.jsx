// src/components/masterCrud/MasterPageShell.jsx

import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PageShell from "../ui/PageShell";

export default function MasterPageShell({
    title = "Manajemen Data",
    highlight = "",
    subtitle = "Sistem Monitoring dan Evaluasi Program",
    children,
    action,
    backPath,
    backLabel = "Kembali",
    className = "",
    contentClassName = "",
}) {
    const navigate = useNavigate();

    const backAction = backPath
        ? {
            label: backLabel,
            icon: <ChevronLeft size={14} />,
            onClick: () => navigate(backPath),
        }
        : undefined;

    return (
        <PageShell
            frame
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            action={action}
            backAction={backAction}
            className={className}
            contentClassName={contentClassName}
        >
            {children}
        </PageShell>
    );
}

MasterPageShell.propTypes = {
    title: PropTypes.node,
    highlight: PropTypes.node,
    subtitle: PropTypes.node,
    children: PropTypes.node,
    action: PropTypes.node,
    backPath: PropTypes.string,
    backLabel: PropTypes.string,
    className: PropTypes.string,
    contentClassName: PropTypes.string,
};
