const ROLE_LABELS = {
    ADMIN: "Admin",
    HO: "Head Office",
    HEAD_OFFICE: "Head Office",
    AREA_OFFICER: "Area Officer",
    AO: "Area Officer",
    VENDOR: "Vendor",
    NARASUMBER: "Narasumber",
    SEKOLAH: "Sekolah",
    KEPALA_SEKOLAH: "Kepala Sekolah",
    GURU: "Guru",
    SYSTEM: "System",
};

const getFirstValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

export function normalizeChatRole(role) {
    const value = String(role || "").trim();
    if (!value) return "";

    const key = value.toUpperCase().replace(/[\s-]+/g, "_");
    return ROLE_LABELS[key] || value;
}

export function getChatUserId(item = {}) {
    return getFirstValue(
        item.id_user,
        item.user_id,
        item.id_sender,
        item.sender_id,
        item.created_by,
        item.user?.id,
        item.user?.id_user,
    );
}

export function getChatSenderName(item = {}, fallback = "User") {
    return (
        getFirstValue(
            item.nama_user,
            item.sender_name,
            item.nama_pengirim,
            item.name,
            item.user_name,
            item.user?.nama,
            item.user?.name,
            item.user?.nama_lengkap,
        ) || fallback
    );
}

export function normalizeTerminChatMessage(item = {}, options = {}) {
    const {
        currentUserId,
        context = null,
        formatDateTime,
        fallbackName = "User",
    } = options;

    const senderId = getChatUserId(item);
    const self =
        Boolean(item.self) ||
        (senderId !== undefined &&
            currentUserId !== undefined &&
            String(senderId) === String(currentUserId));

    const formatted = formatDateTime
        ? formatDateTime(item.created_at || item.createdAt || item.time)
        : {};

    return {
        id_chat: item.id_chat || item.id || `${senderId || "chat"}-${item.created_at || item.createdAt || ""}`,
        sender: getChatSenderName(item, fallbackName),
        senderId,
        receiver: getFirstValue(item.receiver_name, item.nama_penerima, item.penerima, item.receiver?.name, ""),
        role: normalizeChatRole(getFirstValue(item.role_user, item.sender_role, item.role, item.user?.role, "")),
        text: getFirstValue(item.pesan, item.message, item.text, ""),
        self,
        dateLabel: formatted.label || item.dateLabel || "",
        time: formatted.time || item.time || "",
        createdAt: item.created_at || item.createdAt || null,
        context,
    };
}
