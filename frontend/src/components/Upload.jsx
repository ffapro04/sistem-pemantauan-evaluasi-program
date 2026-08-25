import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Upload as UploadIcon,
  X,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import AppIconButton from "./ui/AppIconButton";

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024;

const isAcceptedFile = (selectedFile, accept) => {
  if (!accept) return true;

  const acceptedTypes = String(accept)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (acceptedTypes.length === 0) return true;

  const fileType = String(selectedFile?.type || "").toLowerCase();
  const fileName = String(selectedFile?.name || "").toLowerCase();

  return acceptedTypes.some((acceptedType) => {
    if (acceptedType.endsWith("/*")) {
      const category = acceptedType.replace("/*", "");
      return fileType.startsWith(`${category}/`);
    }

    if (acceptedType.startsWith(".")) {
      return fileName.endsWith(acceptedType);
    }

    return fileType === acceptedType;
  });
};

const formatFileSize = (size) => {
  if (!size) return "";

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
};

const getFileNameFromPath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const pathname = /^https?:\/\//i.test(raw)
      ? new URL(raw).pathname
      : raw.split("?")[0];

    const fileName = pathname.split("/").filter(Boolean).pop() || raw;
    return decodeURIComponent(fileName);
  } catch {
    return raw.split("?")[0].split("/").filter(Boolean).pop() || raw;
  }
};

const isImagePath = (value) => {
  const cleanValue = String(value || "").split("?")[0].toLowerCase();
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(cleanValue);
};

const Upload = ({
  label,
  file,
  existingUrl = "",
  existingName = "",
  previewAsImage = false,
  onFileSelect,
  required = false,
  disabled = false,
  className = "",
  accept = ".pdf,image/*,video/*",
  maxSize = DEFAULT_MAX_SIZE,
  buttonText = "Pilih Dokumen",
  helperText = "Maks. 100MB",
}) => {
  const inputRef = useRef(null);
  const [internalFile, setInternalFile] = useState(
    file instanceof File ? file : null,
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    if (file instanceof File) {
      setInternalFile(file);
      return;
    }

    if (file === null || file === undefined || file === "") {
      setInternalFile(null);
    }
  }, [file]);

  const activeFile = file instanceof File ? file : internalFile;
  const existingFileUrl =
    !(activeFile instanceof File) && existingUrl
      ? String(existingUrl).trim()
      : "";
  const cleanExistingName = existingName
    ? getFileNameFromPath(existingName)
    : "";
  const existingFileName =
    typeof file === "string" && file.trim()
      ? getFileNameFromPath(file)
      : cleanExistingName || getFileNameFromPath(existingFileUrl);
  const displayedFileName = activeFile?.name || existingFileName || "";

  const previewUrl = useMemo(() => {
    if (!(activeFile instanceof File)) return "";
    if (!String(activeFile.type || "").startsWith("image/")) return "";

    return URL.createObjectURL(activeFile);
  }, [activeFile]);

  const existingPreviewUrl =
    !previewUrl &&
    existingFileUrl &&
    (previewAsImage || isImagePath(existingFileUrl))
      ? existingFileUrl
      : "";

  const displayedPreviewUrl = previewUrl || existingPreviewUrl;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    if (!isAcceptedFile(selectedFile, accept)) {
      setError("Format file tidak sesuai.");
      setInternalFile(null);
      onFileSelect?.(null);
      return false;
    }

    if (selectedFile.size > maxSize) {
      setError(
        `Ukuran file terlalu besar. Maksimal ${(maxSize / (1024 * 1024)).toFixed(0)} MB.`,
      );
      setInternalFile(null);
      onFileSelect?.(null);
      return false;
    }

    setError(null);
    setInternalFile(selectedFile);
    onFileSelect?.(selectedFile);
    return true;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      validateFile(selectedFile);
    }
  };

  const handleRemove = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setInternalFile(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onFileSelect?.(null);
  };

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      {label && (
        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="group relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={`flex h-40 w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed transition-all ${displayedFileName
              ? "border-emerald-500 bg-emerald-50/30"
              : error
              ? "border-red-500 bg-red-50/50"
              : "border-gray-200 bg-gray-50/50 hover:border-[#0AC4E0] hover:bg-cyan-50/40"
            } ${disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
            }`}
        >
          <div className="flex flex-col items-center justify-center p-5 text-center">
            {displayedFileName ? (
              <>
                {displayedPreviewUrl ? (
                  <div className="mb-3 h-20 w-20 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                    <img
                      src={displayedPreviewUrl}
                      alt="Preview file"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-3 rounded-2xl bg-emerald-500 p-3 text-white shadow-lg shadow-emerald-200">
                    <FileCheck size={20} />
                  </div>
                )}

                <p className="max-w-[220px] truncate text-[9px] font-black uppercase tracking-tight text-emerald-600">
                  {displayedFileName}
                </p>

                {activeFile?.size && (
                  <p className="mt-1 text-[8px] font-bold text-emerald-400">
                    {formatFileSize(activeFile.size)}
                  </p>
                )}

                <p className="mt-1 text-[8px] font-bold uppercase text-emerald-400">
                  {activeFile ? "Siap diunggah" : "File tersimpan"}
                </p>
              </>
            ) : error ? (
                <>
                  <div className="mb-3 rounded-2xl bg-red-500 p-3 text-white shadow-lg">
                  <AlertCircle size={20} />
                </div>

                  <p className="text-[9px] font-black uppercase tracking-tight text-red-600">
                  {error}
                </p>
                </>
            ) : (
              <>
                    <div className="mb-3 rounded-2xl bg-white p-3 text-gray-300 shadow-sm transition-all group-hover:text-[#0AC4E0] group-hover:shadow-md">
                  <UploadIcon size={20} />
                </div>

                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#0AC4E0]">
                      {buttonText}
                </p>

                    <p className="mt-1 text-[7px] font-bold uppercase italic tracking-tight text-gray-300">
                      {helperText}
                </p>
              </>
            )}
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          disabled={disabled}
          onChange={handleFileChange}
          accept={accept}
        />

        {activeFile && !disabled && (
          <AppIconButton
            icon={X}
            iconSize={12}
            strokeWidth={3}
            onClick={handleRemove}
            title="Hapus file"
            ariaLabel="Hapus file"
            variant="danger"
            size="auto"
            className="!absolute !-right-2 !-top-2 !z-20 !rounded-full !border-transparent !bg-red-500 !p-1.5 !text-white shadow-lg hover:!bg-red-600"
          />
        )}
      </div>
    </div>
  );
};

Upload.propTypes = {
  label: PropTypes.node,
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string]),
  existingUrl: PropTypes.string,
  existingName: PropTypes.string,
  previewAsImage: PropTypes.bool,
  onFileSelect: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  buttonText: PropTypes.node,
  helperText: PropTypes.node,
};

export default Upload;

