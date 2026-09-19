import { supabase } from './supabaseClient.js';

// --- HỆ THỐNG CACHE TRÌNH DUYỆT ---
let cachedCategories = JSON.parse(localStorage.getItem('sb_categories'));
let cachedDocuments = JSON.parse(localStorage.getItem('sb_documents'));
let lastFetchTime = parseInt(localStorage.getItem('sb_last_fetch') || '0', 10);
const CACHE_TTL = 30 * 60 * 1000; // Cache tồn tại trong 30 phút

function saveCacheToLocal() {
  localStorage.setItem('sb_categories', JSON.stringify(cachedCategories || []));
  localStorage.setItem('sb_documents', JSON.stringify(cachedDocuments || []));
}

function updateFetchTime() {
  lastFetchTime = Date.now();
  localStorage.setItem('sb_last_fetch', lastFetchTime.toString());
}
// ----------------------------------

export async function getCategories(force = false) {
  const now = Date.now();
  if (!force && cachedCategories && (now - lastFetchTime < CACHE_TTL)) {
    return cachedCategories;
  }
  
  if (!supabase) return cachedCategories || [];
  const { data, error } = await supabase.from('categories').select('*').order('order', { ascending: true });
  if (error) {
    console.error('Error fetching categories:', error);
    return cachedCategories || [];
  }
  
  cachedCategories = data || [];
  saveCacheToLocal();
  return cachedCategories;
}

export async function getDocuments(force = false) {
  const now = Date.now();
  if (!force && cachedDocuments && (now - lastFetchTime < CACHE_TTL)) {
    return cachedDocuments;
  }
  
  if (!supabase) return cachedDocuments || [];
  const { data, error } = await supabase.from('documents').select('*').order('order', { ascending: true });
  if (error) {
    console.error('Error fetching documents:', error);
    return cachedDocuments || [];
  }
  
  cachedDocuments = data || [];
  saveCacheToLocal();
  updateFetchTime(); // Đánh dấu thời điểm fetch thành công cả 2 bảng
  return cachedDocuments;
}

export async function addCategory(name) {
  if (!supabase) {
    alert("Chưa kết nối được Supabase (Thiếu biến môi trường).");
    return null;
  }
  const order = cachedCategories ? cachedCategories.length + 1 : 1;
  const { data, error } = await supabase.from('categories').insert([{ name, order }]).select();
  if (error) {
    console.error(error);
    alert('Lỗi khi lưu danh mục: ' + error.message);
  }
  
  if (data && data[0]) {
    if (cachedCategories) cachedCategories.push(data[0]);
    saveCacheToLocal();
    return data[0];
  }
  return null;
}

export async function updateCategory(id, name) {
  if (!supabase) return null;
  const { error } = await supabase.from('categories').update({ name }).eq('id', id);
  if (!error && cachedCategories) {
    const cat = cachedCategories.find(c => c.id === id);
    if (cat) cat.name = name;
    saveCacheToLocal();
  }
  return error ? null : true;
}

export async function addDocument(doc) {
  if (!supabase) return null;
  const order = cachedDocuments ? cachedDocuments.filter(d => d.category_id === doc.category_id).length + 1 : 1;

  const { data, error } = await supabase.from('documents').insert([{ ...doc, order, is_pinned: false }]).select();
  if (error) console.error(error);
  
  if (data && data[0]) {
    if (cachedDocuments) cachedDocuments.push(data[0]);
    saveCacheToLocal();
    return data[0];
  }
  return null;
}

export async function updateDocument(id, doc) {
  if (!supabase) return null;
  const { error } = await supabase.from('documents').update(doc).eq('id', id);
  if (!error && cachedDocuments) {
    const cachedDoc = cachedDocuments.find(d => d.id === id);
    if (cachedDoc) Object.assign(cachedDoc, doc);
    saveCacheToLocal();
  }
  return error ? null : true;
}

export async function togglePin(docId) {
  if (!supabase) return;
  const doc = cachedDocuments ? cachedDocuments.find(d => d.id === docId) : null;
  const currentPin = doc ? doc.is_pinned : false; // Lấy từ cache nếu có

  const { error } = await supabase.from('documents').update({ is_pinned: !currentPin }).eq('id', docId);
  if (!error && doc) {
    doc.is_pinned = !currentPin;
    saveCacheToLocal();
  }
}

// Cập nhật vị trí nhiều danh mục
export async function saveCategoriesOrder(orderedIds) {
  if (!supabase) return;
  const promises = orderedIds.map((id, index) => 
    supabase.from('categories').update({ order: index + 1 }).eq('id', id)
  );
  await Promise.all(promises);
  if (cachedCategories) {
    cachedCategories.forEach(c => {
      const idx = orderedIds.indexOf(c.id);
      if (idx > -1) c.order = idx + 1;
    });
    cachedCategories.sort((a,b) => a.order - b.order);
    saveCacheToLocal();
  }
}

export async function deleteDocument(docId) {
  if (!supabase) return;
  const { error } = await supabase.from('documents').delete().eq('id', docId);
  if (!error && cachedDocuments) {
    cachedDocuments = cachedDocuments.filter(d => d.id !== docId);
    saveCacheToLocal();
  }
}

export async function deleteCategory(catId) {
  if (!supabase) return;
  const { error } = await supabase.from('categories').delete().eq('id', catId);
  if (!error) {
    if (cachedCategories) cachedCategories = cachedCategories.filter(c => c.id !== catId);
    if (cachedDocuments) cachedDocuments = cachedDocuments.filter(d => d.category_id !== catId);
    saveCacheToLocal();
  }
}

// Cập nhật vị trí nhiều tài liệu sau khi kéo thả
export async function saveDocumentsOrder(newCategoryId, orderedIds) {
  if (!supabase) return;
  const promises = orderedIds.map((id, index) => 
    supabase.from('documents').update({ category_id: newCategoryId, order: index + 1 }).eq('id', id)
  );
  await Promise.all(promises);
  if (cachedDocuments) {
    cachedDocuments.forEach(d => {
      const idx = orderedIds.indexOf(d.id);
      if (idx > -1) {
        d.order = idx + 1;
        d.category_id = newCategoryId;
      }
    });
    saveCacheToLocal();
  }
}
