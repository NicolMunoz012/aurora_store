-- Migration: add_store_logo
-- Adds logoUrl and logoKey columns to store_config table.
-- These replace the previous primary/secondary logo fields (which were never
-- applied to production) and provide a single configurable store logo.

ALTER TABLE "store_config"
  ADD COLUMN IF NOT EXISTS "logoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "logoKey" TEXT;
