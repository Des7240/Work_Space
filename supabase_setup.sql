-- Chạy đoạn mã này trong tab "SQL Editor" của Supabase

-- 1. Tạo bảng Categories (Danh mục)
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tạo bảng Documents (Tài liệu)
CREATE TABLE documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  notes text,
  is_pinned boolean DEFAULT false,
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cho phép tất cả mọi người đọc/ghi (Shared Workspace)
-- Bật RLS nhưng tạo policy cho phép public (anon) full access
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write categories" ON categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/write documents" ON documents
  FOR ALL USING (true) WITH CHECK (true);
