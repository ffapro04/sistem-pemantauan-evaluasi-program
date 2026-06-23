/* eslint-disable react/prop-types */
import Label from "./Label";

function FormField({ label, children, className = "" }) {
    return (
        <div className={`space-y-2 text-left ${className}`}>
            <Label
                text={label}
                className="!mb-0 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
            />

            {children}
        </div>
    );
}

export default FormField;
