-- Performance indexes for Sistem Pemantauan dan Evaluasi Program
-- Generated 2026-08-20 as part of the performance remediation plan.
--
-- Cara pakai:
--   1. Jalankan langsung terhadap database produksi via psql, SATU statement per koneksi/waktu:
--        psql "$DATABASE_URL" -f backend/scripts/2026-08-perf-indexes.sql
--   2. Tidak ada TypeORM migration system di project ini (synchronize: false, tidak ada
--      migrations/ folder) -- ini bukan pengganti migration, cuma script SQL manual.
--   3. CREATE INDEX CONCURRENTLY TIDAK BISA jalan di dalam transaksi (BEGIN/COMMIT).
--      psql secara default menjalankan tiap statement sebagai transaksi implisit sendiri,
--      jadi script ini AMAN dijalankan apa adanya asal tidak dibungkus manual dalam BEGIN...COMMIT.
--   4. CONCURRENTLY menghindari full table lock, tapi tetap menambah beban I/O -- jalankan
--      saat traffic rendah.
--   5. Semua statement idempotent (IF NOT EXISTS) -- aman dijalankan ulang.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_t_fase_id_program
  ON t_fase (id_program);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_t_kegiatans_id_fase
  ON t_kegiatans (id_fase);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_t_kegiatans_status_kegiatan
  ON t_kegiatans (status_kegiatan);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_m_users_id_role
  ON m_users (id_role);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_m_users_id_sekolah
  ON m_users (id_sekolah);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_jawaban_id_pertanyaan
  ON assessment_jawaban (id_pertanyaan);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_m_sekolah_id_wilayah
  ON m_sekolah (id_wilayah);

-- Kolom array (int[]) yang dipakai lewat "id_sekolah = ANY(target_sekolah_ids)"
-- di assessment.service.ts -- GIN index jauh lebih efektif untuk pola query ini
-- dibanding B-tree biasa.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_t_assessment_target_sekolah_ids_gin
  ON t_assessment USING GIN (target_sekolah_ids);
