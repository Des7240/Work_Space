import { createClient } from '@supabase/supabase-js';

// Đọc URL và Key từ biến môi trường (Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Khởi tạo client (Sẽ trả về null nếu chưa có key để ta fallback sang mock data)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
