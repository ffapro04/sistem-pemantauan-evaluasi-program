import PropTypes from "prop-types";
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

AssessmentRowActions.propTypes = {
    row: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sent: PropTypes.bool,
        aktif: PropTypes.bool,
    }).isRequired,
    detailPath: PropTypes.func.isRequired,
    editPath: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    toggling: PropTypes.object,
};

export default AssessmentRowActions;
