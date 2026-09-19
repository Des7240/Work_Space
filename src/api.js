// Mock data for UI development before hooking up Supabase
let categories = [
  { id: 'c1', name: 'Tài liệu chung', order: 1 },
  { id: 'c2', name: 'Thiết kế (Figma)', order: 2 },
];

let documents = [
  { id: 'd1', category_id: 'c1', title: 'Đặc tả yêu cầu (SRS)', url: 'https://vi.wikipedia.org/wiki/Công_nghệ_thông_tin', notes: 'Đọc kỹ phần UI', is_pinned: true, order: 1 },
  { id: 'd2', category_id: 'c1', title: 'Tiến độ dự án (Sheet)', url: 'https://example.com', notes: '', is_pinned: false, order: 2 },
  { id: 'd3', category_id: 'c2', title: 'Figma Design', url: 'https://vi.wikipedia.org/wiki/Figma', notes: 'Bản draft 1', is_pinned: true, order: 1 },
];

export async function getCategories() {
  return categories.sort((a, b) => a.order - b.order);
}

export async function getDocuments() {
  return documents.sort((a, b) => a.order - b.order);
}

// Giả lập hàm gọi API
export async function addCategory(name) {
  const newCat = { id: 'c' + Date.now(), name, order: categories.length + 1 };
  categories.push(newCat);
  return newCat;
}

export async function addDocument(doc) {
  const newDoc = { id: 'd' + Date.now(), ...doc, order: documents.filter(d => d.category_id === doc.category_id).length + 1, is_pinned: false };
  documents.push(newDoc);
  return newDoc;
}

export async function togglePin(docId) {
  const doc = documents.find(d => d.id === docId);
  if (doc) {
    doc.is_pinned = !doc.is_pinned;
  }
}

export async function updateDocCategoryAndOrder(docId, newCategoryId, newIndex) {
  const doc = documents.find(d => d.id === docId);
  if (doc) {
    // Tạm thời với mock data ta chỉ cập nhật category, order sẽ tự update khi reload hoặc làm tương đối
    doc.category_id = newCategoryId;
  }
}

export async function deleteDocument(docId) {
  documents = documents.filter(d => d.id !== docId);
}

export async function deleteCategory(catId) {
  // Xóa danh mục
  categories = categories.filter(c => c.id !== catId);
  // Xóa các tài liệu thuộc danh mục đó
  documents = documents.filter(d => d.category_id !== catId);
}

export async function updateCategoryOrder(catId, newIndex) {
  const catIndex = categories.findIndex(c => c.id === catId);
  if (catIndex > -1) {
    const [cat] = categories.splice(catIndex, 1);
    categories.splice(newIndex, 0, cat);
    // Cập nhật lại thuộc tính order cho toàn bộ mảng
    categories.forEach((c, idx) => c.order = idx + 1);
  }
}
