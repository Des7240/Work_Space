const themeToggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;
const icon = themeToggleBtn.querySelector('i');

// Lấy theme từ localStorage hoặc mặc định là dark
const currentTheme = localStorage.getItem('theme') || 'dark';
setTheme(currentTheme);

themeToggleBtn.addEventListener('click', () => {
  const newTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
});

function setTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  if (theme === 'dark') {
    icon.className = 'fas fa-sun'; // Nếu đang dark, hiển thị icon mặt trời để chuyển qua light
  } else {
    icon.className = 'fas fa-moon';
  }
}
