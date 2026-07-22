import Swal from "sweetalert2";
import { toast } from "react-toastify";

const toastOptions = {
  position: "top-center",
  autoClose: 3200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  theme: "light",
};

export const notify = {
  success: (message, options = {}) => toast.success(message, { ...toastOptions, ...options }),
  error: (message, options = {}) => toast.error(message, { ...toastOptions, ...options }),
  warning: (message, options = {}) => toast.warning(message, { ...toastOptions, ...options }),
  info: (message, options = {}) => toast.info(message, { ...toastOptions, ...options }),
};

export async function showConfirmDialog({
  title = "Konfirmasi",
  text,
  confirmButtonText = "Ya, lanjutkan",
  cancelButtonText = "Batal",
  icon = "warning",
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "app-confirm-popup",
      title: "app-confirm-title",
      htmlContainer: "app-confirm-text",
      actions: "app-confirm-actions",
      confirmButton: "app-confirm-button app-confirm-button-primary",
      cancelButton: "app-confirm-button app-confirm-button-secondary",
    },
  });

  return result.isConfirmed;
}

