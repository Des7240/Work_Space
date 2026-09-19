import './theme.js';
// Import UI and API later
import { renderCategories, setupSidebar, setupCategoriesSortable } from './ui.js';
import { setupModals } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('App initialized');
  setupModals();
  setupSidebar();
  setupCategoriesSortable();
  renderCategories();
});
