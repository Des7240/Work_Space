import { getCategories, getDocuments, togglePin, deleteDocument, deleteCategory, saveCategoriesOrder, saveDocumentsOrder } from './api.js';
import Sortable from 'sortablejs';

const categoriesContainer = document.getElementById('categories-container');
const iframe = document.getElementById('document-iframe');
const emptyViewer = document.getElementById('empty-viewer');
const currentDocTitle = document.getElementById('current-doc-title');
const openNewTabBtn = document.getElementById('open-new-tab-btn');

let currentUrl = '';

export function applySearchFilter() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  const text = searchInput.value.toLowerCase();
  const items = document.querySelectorAll('.document-item');
  items.forEach(item => {
    const title = item.querySelector('.doc-title').textContent.toLowerCase();
    if (title.includes(text)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// Xử lý đóng Dropdown khi click ra ngoài
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-content.show').forEach(el => {
      el.classList.remove('show');
    });
  }
});

export async function renderCategories() {
  const categories = await getCategories();
  const documents = await getDocuments();
  
  categoriesContainer.innerHTML = '';
  
  categories.forEach(cat => {
    const catDocs = documents.filter(d => d.category_id === cat.id);
    
    const catEl = document.createElement('div');
    catEl.className = 'category-item';
    catEl.setAttribute('data-cat-id', cat.id);
    
    // Header danh mục
    const catHeader = document.createElement('div');
    catHeader.className = 'category-header';
    catHeader.innerHTML = `
      <span class="cat-title-toggle" style="flex:1;"><i class="fas fa-chevron-down" style="margin-right: 5px;"></i> ${cat.name}</span>
      <div>
        <button class="icon-btn add-doc-btn" data-cat-id="${cat.id}" title="Thêm tài liệu"><i class="fas fa-plus"></i></button>
        <div class="dropdown">
          <button class="icon-btn dropbtn" title="Tùy chọn"><i class="fas fa-ellipsis-v"></i></button>
          <div class="dropdown-content">
            <div class="dropdown-item edit-cat-btn"><i class="fas fa-edit"></i> Đổi tên</div>
            <div class="dropdown-item danger delete-cat-btn"><i class="fas fa-trash-alt"></i> Xóa</div>
          </div>
        </div>
      </div>
    `;
    
    // Xử lý thu gọn/mở rộng danh mục
    const titleToggle = catHeader.querySelector('.cat-title-toggle');
    titleToggle.addEventListener('click', () => {
      catEl.classList.toggle('collapsed');
    });

    // Mở Dropdown danh mục
    const catDropBtn = catHeader.querySelector('.dropbtn');
    const catDropContent = catHeader.querySelector('.dropdown-content');
    catDropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-content.show').forEach(el => {
        if (el !== catDropContent) el.classList.remove('show');
      });
      catDropContent.classList.toggle('show');
    });

    // Xử lý nút xóa danh mục
    const delCatBtn = catHeader.querySelector('.delete-cat-btn');
    delCatBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      catDropContent.classList.remove('show');
      if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}" và toàn bộ tài liệu bên trong không?`)) {
        await deleteCategory(cat.id);
        renderCategories();
      }
    });

    // Xử lý nút sửa danh mục
    const editCatBtn = catHeader.querySelector('.edit-cat-btn');
    editCatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      catDropContent.classList.remove('show');
      document.getElementById('category-id-input').value = cat.id;
      document.getElementById('category-name-input').value = cat.name;
      document.getElementById('category-modal').classList.add('active');
    });
    
    // Danh sách tài liệu trong danh mục
    const docListEl = document.createElement('div');
    docListEl.className = 'document-list';
    docListEl.id = `cat-docs-${cat.id}`;
    docListEl.setAttribute('data-cat-id', cat.id);
    
    // Sắp xếp: Pinned lên đầu, sau đó theo order
    catDocs.sort((a, b) => {
      if (a.is_pinned === b.is_pinned) return a.order - b.order;
      return a.is_pinned ? -1 : 1;
    });

    catDocs.forEach(doc => {
      const docEl = document.createElement('div');
      docEl.className = 'document-item neu-box';
      docEl.setAttribute('data-doc-id', doc.id);
      docEl.style.padding = '10px';
      docEl.style.marginBottom = '5px';
      
      const pinClass = doc.is_pinned ? 'pinned' : '';
      
      docEl.innerHTML = `
        <div class="doc-info" style="flex:1;" data-url="${doc.url}" data-title="${doc.title}">
          <div class="doc-title">${doc.title}</div>
          <div class="doc-url">${doc.url}</div>
        </div>
        <div class="doc-actions">
          <button class="icon-btn pin-btn ${pinClass}" data-id="${doc.id}" title="Ghim"><i class="fas fa-thumbtack"></i></button>
          <div class="dropdown">
            <button class="icon-btn dropbtn" title="Tùy chọn"><i class="fas fa-ellipsis-v"></i></button>
            <div class="dropdown-content">
              <div class="dropdown-item edit-doc-btn"><i class="fas fa-edit"></i> Sửa</div>
              <div class="dropdown-item danger delete-doc-btn"><i class="fas fa-trash-alt"></i> Xóa</div>
            </div>
          </div>
        </div>
      `;
      
      // Xử lý click để xem tài liệu
      const infoArea = docEl.querySelector('.doc-info');
      infoArea.addEventListener('click', () => {
        openDocument(doc.title, doc.url);
      });
      
      // Xử lý sự kiện Ghim
      const pinBtn = docEl.querySelector('.pin-btn');
      pinBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Ngăn không cho click truyền xuống doc-info
        await togglePin(doc.id);
        renderCategories(); // Render lại để cập nhật thứ tự
      });

      // Mở Dropdown tài liệu
      const docDropBtn = docEl.querySelector('.dropbtn');
      const docDropContent = docEl.querySelector('.dropdown-content');
      docDropBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown-content.show').forEach(el => {
          if (el !== docDropContent) el.classList.remove('show');
        });
        docDropContent.classList.toggle('show');
      });

      // Xử lý sự kiện Xóa tài liệu
      const delDocBtn = docEl.querySelector('.delete-doc-btn');
      delDocBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        docDropContent.classList.remove('show');
        if (confirm(`Xóa tài liệu "${doc.title}"?`)) {
          await deleteDocument(doc.id);
          renderCategories();
        }
      });

      // Xử lý sự kiện Sửa tài liệu
      const editDocBtn = docEl.querySelector('.edit-doc-btn');
      editDocBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        docDropContent.classList.remove('show');
        document.getElementById('doc-id-input').value = doc.id;
        document.getElementById('doc-category-id-input').value = doc.category_id;
        document.getElementById('doc-title-input').value = doc.title;
        document.getElementById('doc-url-input').value = doc.url;
        document.getElementById('doc-notes-input').value = doc.notes || '';
        document.getElementById('document-modal').classList.add('active');
      });
      
      docListEl.appendChild(docEl);
    });
    
    catEl.appendChild(catHeader);
    catEl.appendChild(docListEl);
    categoriesContainer.appendChild(catEl);

    // Kích hoạt SortableJS cho danh sách này
    new Sortable(docListEl, {
      group: 'shared', // Cho phép kéo thả giữa các danh mục
      animation: 150,
      handle: '.doc-info', // Cho phép nắm vào toàn bộ vùng thông tin để kéo
      ghostClass: 'neu-pressed',
      onEnd: async function (evt) {
        const newCatId = evt.to.getAttribute('data-cat-id');
        const items = evt.to.querySelectorAll('.document-item');
        const orderedIds = Array.from(items).map(item => item.getAttribute('data-doc-id'));
        await saveDocumentsOrder(newCatId, orderedIds);
      }
    });
  });


  // Sau khi render xong, tự động áp dụng lại bộ lọc tìm kiếm hiện tại (nếu có)
  applySearchFilter();
}

// Xử lý link để nhúng iframe được mượt mà hơn
function getEmbedUrl(url) {
  try {
    if (url.includes('google.com')) {
      // 1. Nếu là link Thư mục (Folder) Google Drive (Bắt buộc phải dùng widget)
      const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (folderMatch) {
        return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
      }
      
      // 2. Với các file Docs/Sheets/Slides thông thường, giữ nguyên link gốc
      // để người dùng có thể giữ được thanh công cụ chỉnh sửa (Edit) trong Iframe.
    }
  } catch(e) {}
  return url;
}

function openDocument(title, url) {
  emptyViewer.style.display = 'none';
  iframe.style.display = 'block';
  
  // Dùng link đã xử lý cho iframe
  iframe.src = getEmbedUrl(url);
  
  currentDocTitle.textContent = title;
  currentUrl = url;
  
  openNewTabBtn.disabled = false;
  openNewTabBtn.onclick = () => {
    // Nút mở tab mới vẫn mở link gốc ban đầu để có thể chỉnh sửa
    window.open(url, '_blank');
  };
}

// Logic Sidebar Resizer & Toggle
export function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const resizer = document.getElementById('resizer');
  const closeBtn = document.getElementById('close-sidebar-btn');
  const openBtn = document.getElementById('open-sidebar-btn');
  
  // Đóng / Mở Sidebar
  closeBtn.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
  });
  
  openBtn.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
  });
  
  // Kéo thả thay đổi kích thước Sidebar
  let isResizing = false;
  let lastDownX = 0;
  
  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    lastDownX = e.clientX;
    resizer.classList.add('resizing');
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const offsetRight = document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
    const newWidth = e.clientX;
    // Giới hạn width trong CSS đã lo, nhưng cần set qua biến JS để ghi đè
    sidebar.style.width = newWidth + 'px';
  });
  
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('resizing');
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  });

  // Đóng / Mở Viewer Header
  const viewerHeader = document.getElementById('viewer-header');
  const hideHeaderBtn = document.getElementById('hide-header-btn');
  const restoreHeaderBtn = document.getElementById('restore-header-btn');

  hideHeaderBtn.addEventListener('click', () => {
    viewerHeader.classList.add('hidden');
    restoreHeaderBtn.style.display = 'block';
  });

  restoreHeaderBtn.addEventListener('click', () => {
    viewerHeader.classList.remove('hidden');
    restoreHeaderBtn.style.display = 'none';
  });
  
  restoreHeaderBtn.addEventListener('click', () => {
    viewerHeader.classList.remove('hidden');
    restoreHeaderBtn.style.display = 'none';
  });
  
  // Logic Tìm kiếm
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applySearchFilter();
    });
  }
}

// Logic kéo thả Danh mục
export function setupCategoriesSortable() {
  new Sortable(categoriesContainer, {
    animation: 150,
    handle: '.category-header', // Nắm phần tiêu đề để kéo thả danh mục
    ghostClass: 'neu-pressed',
    onEnd: async function (evt) {
      const items = categoriesContainer.querySelectorAll('.category-item');
      const orderedIds = Array.from(items).map(item => item.getAttribute('data-cat-id'));
      await saveCategoriesOrder(orderedIds);
    }
  });
}
