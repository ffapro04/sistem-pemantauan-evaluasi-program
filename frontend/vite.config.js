import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendTarget = "http://localhost:3000";

const bypassSpaNavigation = (req) => {
  const accept = String(req.headers.accept || "");

  if (accept.includes("text/html")) {
    return req.url;
  }

  return undefined;
};

const proxyTarget = {
  target: backendTarget,
  changeOrigin: true,
  secure: false,
  bypass: bypassSpaNavigation,
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/auth": proxyTarget,
      "/users": proxyTarget,
      "/roles": proxyTarget,
      "/wilayah": proxyTarget,
      "/sekolah": proxyTarget,
      "/vendor": proxyTarget,
      "/program": proxyTarget,
      "/assessment": proxyTarget,
      "/assessment-guru": proxyTarget,
      "/notifikasi": proxyTarget,
      "/kepala-dinas": proxyTarget,
      "/admin-agenda": proxyTarget,
      "/google-drive": proxyTarget,
      "/kelas": proxyTarget,
      "/jurusan": proxyTarget,
      "/uploads": proxyTarget,
    },
  },
});
