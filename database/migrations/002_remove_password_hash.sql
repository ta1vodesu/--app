-- users テーブルから password_hash カラムを削除
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
