// Variables globales
let todaysRecords = [];
let tomorrowsRecords = [];
let currentDataset = "today";
let currentRecords = [];
let currentPage = 1;
const itemsPerPage = 15;
let totalPages = 1;
let autoPageInterval = null;
let inactivityTimer = null;

// Referencias DOM
const homeContainer = document.getElementById('home-container');
const searchContainer = document.getElementById('search-container');
const tableContainer = document.getElementById('main-table-container');
const searchTransferBtn = document.getElementById('search-transfer-btn');
const adventureBtn = document.getElementById('adventure-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResult = document.getElementById('search-result');
const searchLegend = document.getElementById('search-legend');
const mainTitle = document.getElementById('main-title');

// Cargar datos
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const [todayResp, tomorrowResp] = await Promise.all([
      fetch('data.json'),
      fetch('data_2.json')
    ]);
    const todayData = await todayResp.json();
    const tomorrowData = await tomorrowResp.json();

    todaysRecords = todayData.template.content || [];
    tomorrowsRecords = tomorrowData.template.content || [];

    currentDataset = "today";
    currentRecords = todaysRecords;
    totalPages = Math.ceil(currentRecords.length / itemsPerPage);
    updateTitle();
    renderTable();
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    tableContainer.innerHTML = `<p style="color:red;text-align:center;">Error loading data.</p>`;
  }
});

function updateTitle() {
  mainTitle.innerText = currentDataset === "today"
    ? "TODAY’S PICK-UP AIRPORT TRANSFERS"
    : "TOMORROW’S PICK-UP AIRPORT TRANSFERS";
}

function renderTable() {
  if (autoPageInterval) clearInterval(autoPageInterval);

  currentRecords = currentDataset === "today" ? todaysRecords : tomorrowsRecords;
  totalPages = Math.ceil(currentRecords.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageRecords = currentRecords.slice(startIndex, startIndex + itemsPerPage);

  let html = `<table>...render filas...</table>`; // equivalente al contenido previo
  let pageInfo = totalPages > 1 ? `<div class="auto-page-info">Page ${currentPage} of ${totalPages}</div>` : '';

  tableContainer.innerHTML = html + pageInfo;
  if (totalPages > 1) startAutoPagination();
}

function startAutoPagination() {
  autoPageInterval = setInterval(() => {
    currentPage = currentPage % totalPages + 1;
    if (currentPage === 1) {
      currentDataset = currentDataset === "today" ? "tomorrow" : "today";
      updateTitle();
    }
    renderTable();
  }, 10000);
}

// Navegación
searchTransferBtn.addEventListener('click', goToSearch);
adventureBtn.addEventListener('click', () => alert('Implement logic'));
backHomeBtn.addEventListener('click', goToHome);

function goToSearch() {
  homeContainer.style.display = 'none';
  searchContainer.style.display = 'block';
  searchLegend.style.display = 'block';
  searchResult.innerHTML = '';
  searchResult.classList.remove('search-result-container', 'error-container');
  clearInterval(autoPageInterval);
  clearTimeout(inactivityTimer);
}

function goToHome() {
  searchContainer.style.display = 'none';
  homeContainer.style.display = 'block';
  currentPage = 1;
  renderTable();
}

// Búsqueda
searchButton.addEventListener('click', () => {
  clearTimeout(inactivityTimer);
  searchLegend.style.display = 'none';
  searchResult.innerHTML = '';
  searchResult.classList.remove('search-result-container', 'error-container');

  const query = searchInput.value.trim().toLowerCase();
  if (!query) return goToHome();

  let record = todaysRecords.find(r => r.id.toLowerCase() === query) 
             || tomorrowsRecords.find(r => r.id.toLowerCase() === query);

  inactivityTimer = setTimeout(goToHome, 20000);
  if (record) {
    searchResult.classList.add('search-result-container');
    searchResult.innerHTML = `
      <p><strong>We got you, here is your transfer</strong></p>
      <table>...detalle de ${record.id}...</table>
    `;
  } else {
    searchResult.classList.add('error-container');
    searchResult.innerHTML = `
      <p>If you have any questions... We're here to assist you!</p>
      <div class="qr-container"><img src="https://miguelgrhub.github.io/Dyspl/Qr.jpeg" alt="QR Code"></div>
    `;
  }
});
