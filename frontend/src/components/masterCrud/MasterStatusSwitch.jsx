// src/components/masterCrud/MasterStatusSwitch.jsx

/* eslint-disable react/prop-types */
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
