/* eslint-disable react/prop-types */
import Toggle from "./Toggle";
import {
    DetailButton,
    EditButton,
    SendButton,
} from "./ActionButtons";

function AssessmentRowActions({
    row,
    detailPath,
    editPath,
    onNavigate,
    onSend,
    onToggle,
    toggling = {},
}) {
    return (
        <div className="flex items-center justify-end gap-2">
            <DetailButton onClick={() => onNavigate(detailPath(row.id))} />

            {!row.sent && <EditButton onClick={() => onNavigate(editPath(row.id))} />}

            {!row.sent && <SendButton onClick={() => onSend(row.id)} />}

            <div className="ml-2 border-l border-gray-100 pl-2">
                <Toggle
                    checked={row.aktif}
                    onChange={() => onToggle(row.id)}
                    disabled={toggling[row.id]}
                />
            </div>
        </div>
    );
}

export default AssessmentRowActions;
