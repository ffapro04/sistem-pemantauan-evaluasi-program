// src/components/masterCrud/MasterStatusSwitch.jsx

import PropTypes from "prop-types";
import AppSwitch from "../ui/AppSwitch";
import { isActiveValue } from "./masterCrudUtils";

export default function MasterStatusSwitch({
    value,
    active,
    activeText = "Aktif",
    inactiveText = "Nonaktif",
    onClick,
}) {
    const isActive =
        typeof active === "boolean" ? active : isActiveValue(value);

    return (
        <AppSwitch
            checked={isActive}
            onClick={onClick}
            activeText={activeText}
            inactiveText={inactiveText}
            size="sm"
            tone="cyan"
        />
    );
}

MasterStatusSwitch.propTypes = {
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.number]),
    active: PropTypes.bool,
    activeText: PropTypes.node,
    inactiveText: PropTypes.node,
    onClick: PropTypes.func,
};
