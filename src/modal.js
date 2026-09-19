import { addCategory, addDocument, updateCategory, updateDocument } from './api.js';
import { renderCategories } from './ui.js';

export function setupModals() {
  const catModal = document.getElementById('category-modal');
  const docModal = document.getElementById('document-modal');
  
  // Nút mở modal thêm mới danh mục
  const addCatBtn = document.getElementById('add-category-btn');
  addCatBtn.addEventListener('click', () => {
    document.getElementById('category-id-input').value = '';
    document.getElementById('category-name-input').value = '';
    catModal.classList.add('active');
  });
  
  // Đóng modal
  const closeBtns = document.querySelectorAll('.close-modal-btn');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catModal.classList.remove('active');
      docModal.classList.remove('active');
    });
  });
  
  // Lưu danh mục
  const saveCatBtn = document.getElementById('save-category-btn');
  const catNameInput = document.getElementById('category-name-input');
  
  saveCatBtn.addEventListener('click', async () => {
    const name = catNameInput.value.trim();
    const id = document.getElementById('category-id-input').value;
    if (name) {
      if (id) {
        await updateCategory(id, name);
      } else {
        await addCategory(name);
      }
      catNameInput.value = '';
      document.getElementById('category-id-input').value = '';
      catModal.classList.remove('active');
      renderCategories();
    }
  });
  
  // Ủy quyền sự kiện mở modal thêm tài liệu từ sidebar
  document.getElementById('categories-container').addEventListener('click', (e) => {
    const btn = e.target.closest('.add-doc-btn');
    if (btn) {
      document.getElementById('doc-id-input').value = '';
      document.getElementById('doc-title-input').value = '';
      document.getElementById('doc-url-input').value = '';
      document.getElementById('doc-notes-input').value = '';
      const catId = btn.getAttribute('data-cat-id');
      document.getElementById('doc-category-id-input').value = catId;
      docModal.classList.add('active');
    }
  });
  
  // Lưu tài liệu
  const saveDocBtn = document.getElementById('save-document-btn');
  saveDocBtn.addEventListener('click', async () => {
    const id = document.getElementById('doc-id-input').value;
    const title = document.getElementById('doc-title-input').value.trim();
    const url = document.getElementById('doc-url-input').value.trim();
    const notes = document.getElementById('doc-notes-input').value.trim();
    const catId = document.getElementById('doc-category-id-input').value;
    
    if (title && url) {
      if (id) {
        await updateDocument(id, { title, url, notes, category_id: catId });
      } else {
        await addDocument({ title, url, notes, category_id: catId });
      }
      document.getElementById('doc-id-input').value = '';
      document.getElementById('doc-title-input').value = '';
      document.getElementById('doc-url-input').value = '';
      document.getElementById('doc-notes-input').value = '';
      docModal.classList.remove('active');
      renderCategories();
    }
  });
}
