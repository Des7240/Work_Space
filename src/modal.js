import { addCategory, addDocument } from './api.js';
import { renderCategories } from './ui.js';

export function setupModals() {
  const catModal = document.getElementById('category-modal');
  const docModal = document.getElementById('document-modal');
  
  // Nút mở modal
  const addCatBtn = document.getElementById('add-category-btn');
  addCatBtn.addEventListener('click', () => {
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
    if (name) {
      await addCategory(name);
      catNameInput.value = '';
      catModal.classList.remove('active');
      renderCategories();
    }
  });
  
  // Ủy quyền sự kiện mở modal thêm tài liệu từ sidebar
  document.getElementById('categories-container').addEventListener('click', (e) => {
    const btn = e.target.closest('.add-doc-btn');
    if (btn) {
      const catId = btn.getAttribute('data-cat-id');
      document.getElementById('doc-category-id-input').value = catId;
      docModal.classList.add('active');
    }
  });
  
  // Lưu tài liệu
  const saveDocBtn = document.getElementById('save-document-btn');
  saveDocBtn.addEventListener('click', async () => {
    const title = document.getElementById('doc-title-input').value.trim();
    const url = document.getElementById('doc-url-input').value.trim();
    const notes = document.getElementById('doc-notes-input').value.trim();
    const catId = document.getElementById('doc-category-id-input').value;
    
    if (title && url) {
      await addDocument({ title, url, notes, category_id: catId });
      document.getElementById('doc-title-input').value = '';
      document.getElementById('doc-url-input').value = '';
      document.getElementById('doc-notes-input').value = '';
      docModal.classList.remove('active');
      renderCategories();
    }
  });
}
