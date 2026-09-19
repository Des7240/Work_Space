import { supabase } from './supabaseClient.js';

export async function getCategories() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('categories').select('*').order('order', { ascending: true });
  if (error) console.error('Error fetching categories:', error);
  return data || [];
}

export async function getDocuments() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('documents').select('*').order('order', { ascending: true });
  if (error) console.error('Error fetching documents:', error);
  return data || [];
}

export async function addCategory(name) {
  if (!supabase) {
    alert("Chưa kết nối được Supabase (Thiếu biến môi trường).");
    return null;
  }
  // Tính toán order
  const { data: cats, error: countError } = await supabase.from('categories').select('id');
  if (countError) console.error(countError);
  
  const order = cats ? cats.length + 1 : 1;
  
  const { data, error } = await supabase.from('categories').insert([{ name, order }]).select();
  if (error) {
    console.error(error);
    alert('Lỗi khi lưu danh mục: ' + error.message);
  }
  return data ? data[0] : null;
}

export async function addDocument(doc) {
  if (!supabase) return null;
  const { data: docs } = await supabase.from('documents').select('id').eq('category_id', doc.category_id);
  const order = docs ? docs.length + 1 : 1;

  const { data, error } = await supabase.from('documents').insert([{ ...doc, order, is_pinned: false }]).select();
  if (error) console.error(error);
  return data ? data[0] : null;
}

export async function togglePin(docId) {
  if (!supabase) return;
  const { data } = await supabase.from('documents').select('is_pinned').eq('id', docId).single();
  if (data) {
    await supabase.from('documents').update({ is_pinned: !data.is_pinned }).eq('id', docId);
  }
}

export async function updateDocCategoryAndOrder(docId, newCategoryId, newIndex) {
  if (!supabase) return;
  // Cập nhật category_id trước
  await supabase.from('documents').update({ category_id: newCategoryId }).eq('id', docId);
}

export async function deleteDocument(docId) {
  if (!supabase) return;
  await supabase.from('documents').delete().eq('id', docId);
}

export async function deleteCategory(catId) {
  if (!supabase) return;
  // Trên Supabase đã có rule ON DELETE CASCADE nên xóa category sẽ tự xóa luôn documents
  await supabase.from('categories').delete().eq('id', catId);
}

export async function updateCategoryOrder(catId, newIndex) {
  if (!supabase) return;
  // Cần logic phức tạp hơn để update thứ tự hàng loạt, hiện tại tạm để trống
}
