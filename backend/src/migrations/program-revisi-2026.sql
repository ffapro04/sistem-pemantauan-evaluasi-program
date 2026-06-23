-- ============================================================
-- Migration: Program Revisi 2026
-- Tambah jenis_program, komentar kegiatan, guru rating,
-- tracking upload/approve/reject
-- ============================================================

-- 1. Tambah jenis_program ke t_program
ALTER TABLE t_program
  ADD COLUMN IF NOT EXISTS jenis_program VARCHAR(20) DEFAULT 'PROJECT';

-- 2. Tambah status_kegiatan dan guru rating ke t_kegiatans
ALTER TABLE t_kegiatans
  ADD COLUMN IF NOT EXISTS status_kegiatan VARCHAR(50) DEFAULT 'LOCKED',
  ADD COLUMN IF NOT EXISTS guru_rating     INTEGER       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guru_comment    TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guru_rated_by   INTEGER       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guru_rated_at   TIMESTAMP     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approved_at     TIMESTAMP     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMP     DEFAULT NULL;

-- 3. Tambah tracking ke t_persyaratan_kegiatan
ALTER TABLE t_persyaratan_kegiatan
  ADD COLUMN IF NOT EXISTS uploaded_by    INTEGER   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS uploaded_at    TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ao_reviewed_by INTEGER   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ao_reviewed_at TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approved_by    INTEGER   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approved_at    TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rejected_by    INTEGER   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rejected_at    TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT     DEFAULT NULL;

-- 4. Tambah tracking ke t_persyaratan_termin
ALTER TABLE t_persyaratan_termin
  ADD COLUMN IF NOT EXISTS uploaded_by     INTEGER   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS uploaded_at     TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approved_by     INTEGER   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approved_at     TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rejected_by     INTEGER   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rejected_at     TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT      DEFAULT NULL;

-- 5. Buat tabel komentar per kegiatan
CREATE TABLE IF NOT EXISTS t_kegiatan_comment (
  id_comment              SERIAL        PRIMARY KEY,
  id_kegiatan             INTEGER       NOT NULL REFERENCES t_kegiatans(id_kegiatans) ON DELETE CASCADE,
  id_persyaratan          INTEGER       DEFAULT NULL,
  id_user                 INTEGER       NOT NULL,
  nama_user               VARCHAR(150)  NOT NULL,
  role_user               VARCHAR(50)   NOT NULL,
  comment_text            TEXT          NOT NULL,
  comment_type            VARCHAR(20)   NOT NULL DEFAULT 'AO_REVIEW',
  attachment_file         VARCHAR(255)  DEFAULT NULL,
  attachment_original_name VARCHAR(255) DEFAULT NULL,
  created_at              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kegiatan_comment_kegiatan ON t_kegiatan_comment(id_kegiatan);
CREATE INDEX IF NOT EXISTS idx_kegiatan_comment_user     ON t_kegiatan_comment(id_user);
CREATE INDEX IF NOT EXISTS idx_kegiatan_comment_type     ON t_kegiatan_comment(comment_type);

-- 6. Update data lama: kegiatan urutan 1 di tiap fase yang termin luarnya sudah semua APPROVED
-- Set status_kegiatan = 'UNLOCKED' untuk kegiatan pertama jika syarat terpenuhi
UPDATE t_kegiatans k
SET    status_kegiatan = 'UNLOCKED'
WHERE  k.urutan = 1
  AND  k.id_fase IN (
         SELECT DISTINCT t.id_fase
         FROM   t_termin t
         WHERE  t.id_kegiatans IS NULL
           AND  t.id_fase IS NOT NULL
           AND  NOT EXISTS (
                  SELECT 1 FROM t_persyaratan_termin pt
                  WHERE pt.id_termin = t.id_termin
                    AND pt.status <> 'APPROVED'
                )
       );

-- 7. Update kegiatan yang semua persyaratannya APPROVED → tandai APPROVED
UPDATE t_kegiatans k
SET    status_kegiatan = 'APPROVED',
       approved_at     = CURRENT_TIMESTAMP
WHERE  status_kegiatan IN ('LOCKED', 'UNLOCKED')
  AND  EXISTS (
         SELECT 1 FROM t_persyaratan_kegiatan pk
         WHERE pk.id_kegiatans = k.id_kegiatans
       )
  AND  NOT EXISTS (
         SELECT 1 FROM t_persyaratan_kegiatan pk
         WHERE pk.id_kegiatans = k.id_kegiatans
           AND pk.status <> 'APPROVED'
       );
