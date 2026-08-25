import PropTypes from "prop-types";
import { FileUp, FileBox, Loader2 } from "lucide-react";

function FileDropzone({
    label,
    fileName,
    accept,
    onChange,
    variant = "default",
    loading = false,
}) {
    const isConvert = variant === "convert";

    return (
        <label
            className={`flex h-[105px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition ${isConvert
                    ? "border-purple-100 bg-purple-50/50 hover:bg-purple-50"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
        >
            {loading ? (
                <Loader2 size={22} className="mb-2 animate-spin text-purple-500" />
            ) : isConvert ? (
                <FileBox size={22} className="mb-2 text-purple-400" />
            ) : (
                <FileUp size={22} className="mb-2 text-[#0AC4E0]" />
            )}

            <span
                className={`w-full truncate text-[11px] font-bold ${isConvert ? "text-purple-600" : "text-slate-500"
                    }`}
            >
                {loading ? "Mengonversi..." : fileName || label}
            </span>

            <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={onChange}
            />
        </label>
    );
}

FileDropzone.propTypes = {
    label: PropTypes.node,
    fileName: PropTypes.string,
    accept: PropTypes.string,
    onChange: PropTypes.func,
    variant: PropTypes.oneOf(["default", "convert"]),
    loading: PropTypes.bool,
};

export default FileDropzone;
