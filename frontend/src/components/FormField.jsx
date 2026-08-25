import PropTypes from "prop-types";
import Label from "./Label";

function FormField({ label, children, className = "", required = false }) {
    return (
        <div className={`space-y-2 text-left ${className}`}>
            <Label
                text={label}
                required={required}
                className="!mb-0 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
            />

            {children}
        </div>
    );
}

FormField.propTypes = {
    label: PropTypes.node,
    children: PropTypes.node,
    className: PropTypes.string,
    required: PropTypes.bool,
};

export default FormField;
