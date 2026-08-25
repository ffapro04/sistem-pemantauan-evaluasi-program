// Role identifier strings compared against the decoded JWT `role`/`nama_role`
// field. These are the exact lowercase strings used in strict equality
// (`role === ...`) checks in src/page/otorisasi/Login.jsx and src/App.jsx.
export const ROLE_ADMIN = "admin";
export const ROLE_PENGURUS = "pengurus";
export const ROLE_VENDOR = "vendor";
export const ROLE_SEKOLAH = "sekolah";
