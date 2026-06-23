-- Migration: Add additional fields to assessment_guru table
-- Date: 2026-06-09
-- Purpose: Menambahkan field email_guru, no_telepon, mata_pelajaran, nip

-- Cek apakah kolom sudah ada sebelum menambahkan
DO $$ 
BEGIN
    -- Add email_guru if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_guru' AND column_name = 'email_guru'
    ) THEN
        ALTER TABLE assessment_guru 
        ADD COLUMN email_guru VARCHAR(255) NULL;
    END IF;

    -- Add no_telepon if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_guru' AND column_name = 'no_telepon'
    ) THEN
        ALTER TABLE assessment_guru 
        ADD COLUMN no_telepon VARCHAR(20) NULL;
    END IF;

    -- Add mata_pelajaran if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_guru' AND column_name = 'mata_pelajaran'
    ) THEN
        ALTER TABLE assessment_guru 
        ADD COLUMN mata_pelajaran VARCHAR(100) NULL;
    END IF;

    -- Add nip if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_guru' AND column_name = 'nip'
    ) THEN
        ALTER TABLE assessment_guru 
        ADD COLUMN nip VARCHAR(50) NULL;
    END IF;
END $$;

-- Verify
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'assessment_guru'
ORDER BY ordinal_position;
