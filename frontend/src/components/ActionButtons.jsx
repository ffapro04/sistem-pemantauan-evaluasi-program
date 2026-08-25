import PropTypes from "prop-types";
import { Edit3, Power, PowerOff, Eye, Send, Trash2 } from "lucide-react";
import AppIconButton from "./ui/AppIconButton";

/**
 * ActionButtons - Wrapper untuk mengelompokkan tombol aksi.
 */
function ActionButtons({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

ActionButtons.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * ActionIcon - Versi Modern & Minimalis
 */
const ActionIcon = ({ icon: Icon, onClick, variant = "primary", title }) => (
  <AppIconButton
    icon={Icon}
    onClick={onClick}
    title={title}
    variant={variant}
    size="md"
    iconSize={15}
    strokeWidth={2}
  />
);

ActionIcon.propTypes = {
  icon: PropTypes.elementType,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["primary", "gray", "warning", "danger", "success"]),
  title: PropTypes.string,
};

export const EditButton = ({ onClick }) => (
  <ActionIcon
    icon={Edit3}
    onClick={onClick}
    variant="primary"
    title="Edit Data"
  />
);

EditButton.propTypes = {
  onClick: PropTypes.func,
};

export const DetailButton = ({ onClick }) => (
  <ActionIcon
    icon={Eye}
    onClick={onClick}
    variant="gray"
    title="Lihat Detail"
  />
);

DetailButton.propTypes = {
  onClick: PropTypes.func,
};

export const SendButton = ({ onClick }) => (
  <ActionIcon
    icon={Send}
    onClick={onClick}
    variant="warning"
    title="Kirim Data"
  />
);

SendButton.propTypes = {
  onClick: PropTypes.func,
};

export const DeleteButton = ({ onClick }) => (
  <ActionIcon
    icon={Trash2}
    onClick={onClick}
    variant="danger"
    title="Hapus Data"
  />
);

DeleteButton.propTypes = {
  onClick: PropTypes.func,
};

export const ToggleStatusButton = ({ isActive, onClick }) => (
  <ActionIcon
    icon={isActive ? PowerOff : Power}
    onClick={onClick}
    variant={isActive ? "danger" : "success"}
    title={isActive ? "Non-aktifkan" : "Aktifkan"}
  />
);

ToggleStatusButton.propTypes = {
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};

export default ActionButtons;
