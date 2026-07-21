export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value) => {
    const email = String(value || "").trim();
    return EMAIL_PATTERN.test(email);
};

export const validateEmailField = (value, label = "Email") => {
    const email = String(value || "").trim();

    if (!email) {
        return `${label} wajib diisi.`;
    }

    if (!isValidEmail(email)) {
        return `Format ${label.toLowerCase()} tidak sesuai.`;
    }

    return "";
};

export const validatePasswordField = (
    value,
    label = "Password",
    minLength = 8,
) => {
    const password = String(value || "").trim();

    if (password.length < minLength) {
        return `${label} minimal ${minLength} karakter.`;
    }

    return "";
};
