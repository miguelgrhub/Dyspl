// ==================== Variables globales ====================
let todaysRecords = [];        // Registros de today (data.json)
let tomorrowsRecords = [];     // Registros de tomorrow (data_2.json)
let currentDataset = "today";  // "today" o "tomorrow"
let currentRecords = [];       // Conjunto de registros actual
let currentPage = 1;           // Página actual
const itemsPerPage = 15;       // Registros por "página"
let totalPages = 1;            // Se calculará al cargar
let autoPageInterval = null;   // Intervalo para auto-cambiar página cada 10s
let inactivityTimer = null;    // Temporizador de inactividad en la pantalla de búsqueda

// Referencias a elementos del DOM
const homeContainer      = document.getElementById('home-container');
const searchContainer    = document.getElementById('search-container');
const tableContainer     = document.getElementById('table-container');
const searchTransferBtn  = document.getElementById('search-transfer-btn');
const adventureBtn       = document.getElementById('adventure-btn');
const backHomeBtn        = document.getElementById('back-home-btn');
const searchInput        = document.getElementById('search-input');
const searchButton       = document.getElementById('search-button');
const searchResult       = document.getElementById('search-result');
const searchLegend       = document.getElementById('search-legend');
const mainTitle          = document.getElementById('main-title');

// ==================== Cargar ambos JSON ====================
window.addEventListener('DOMContentLoaded', async () => {
  console.log('📌 DOMContentLoaded: empezando carga de datos');
  try {
    console.log('🔄 Haciendo fetch de data.json y data_2.json en paralelo');
    const [todayResp, tomorrowResp] = await Promise.all([
      fetch('data.json'),
      fetch('data_2.json')
    ]);

    if (!todayResp.ok)    throw new Error(`Fetch failed for data.json: ${todayResp.status} ${todayResp.statusText}`);
    if (!tomorrowResp.ok) throw new Error(`Fetch failed for data_2.json: ${tomorrowResp.status} ${tomorrowResp.statusText}`);

    console.log('✅ Ambos fetch OK, parseando JSON…');
    const todayData    = await todayResp.json();
    const tomorrowData = await tomorrowResp.json();

    // *** CORRECCIÓN: Asignamos a las variables globales en lugar de redeclarar ***
    todaysRecords    = todayData.template?.content || [];
    tomorrowsRecords = tomorrowData.template?.content || [];

    console.log('todayData.template:', todayData.template);
    console.log('Número de registros de hoy:', todaysRecords.length);
    console.log('tomorrowData.template:', tomorrowData.template);
    console.log('Número de registros de mañana:', tomorrowsRecords.length);

    // Empezamos mostrando los registros de hoy
    currentDataset = "today";
    currentRecords = todaysRecords;
    totalPages     = Math.ceil(currentRecords.length / itemsPerPage);
    console.log(`Total pages calculadas: ${totalPages}`);

    updateTitle();
    renderTable();
  } catch (error) {
    console.error('🔥 Error al cargar o procesar los datos:', error);
    console.error(error.stack);
    if (tableContainer) {
      tableContainer.innerHTML = `<p style="color:red;text-align:center;">Error loading data.</p>`;
    }
  }
});

// ==================== Actualizar título según dataset ====================
function updateTitle() {
  mainTitle.innerText = currentDataset === "today"
    ? "TODAY’S PICK-UP AIRPORT TRANSFERS"
    : "TOMORROW’S PICK-UP AIRPORT TRANSFERS";
}

// ==================== Renderizar tabla con paginación auto ====================
function renderTable() {
  if (autoPageInterval) {
    clearInterval(autoPageInterval);
    autoPageInterval = null;
  }

  currentRecords = (currentDataset === "today") ? todaysRecords : tomorrowsRecords;
  totalPages     = Math.ceil(currentRecords.length / itemsPerPage);

  const startIndex  = (currentPage - 1) * itemsPerPage;
  const endIndex    = startIndex + itemsPerPage;
  const pageRecords = currentRecords.slice(startIndex, endIndex);

  let tableHTML = `
    <div class="bktable">
      <table>
        <thead>
          <tr>
            <th>Booking No.</th>
            <th>Flight No.</th>
            <th>Hotel</th>
            <th>Pick-Up time</th>
          </tr>
        </thead>
        <tbody>
  `;
  pageRecords.forEach(item => {
    tableHTML += `
      <tr>
        <td>${item.id}</td>
        <td>${item.Flight}</td>
        <td>${item.HotelName}</td>
        <td>${item.Time}</td>
      </tr>
    `;
  });
  tableHTML += `
        </tbody>
      </table>
    </div>
  `;

  let pageInfoHTML = '';
  if (totalPages > 1) {
    pageInfoHTML = `<div class="auto-page-info">Page ${currentPage} of ${totalPages}</div>`;
  }

  tableContainer.innerHTML = tableHTML + pageInfoHTML;

  if (totalPages > 1) {
    startAutoPagination();
  }
}

// ==================== Auto-paginación cada 10 segundos ====================
function startAutoPagination() {
  autoPageInterval = setInterval(() => {
    currentPage++;
    if (currentPage > totalPages) {
      currentDataset = (currentDataset === "today") ? "tomorrow" : "today";
      updateTitle();
      currentPage = 1;
    }
    renderTable();
  }, 10000);
}

// ==================== Navegación y búsqueda ====================
searchTransferBtn.addEventListener('click', goToSearch);
adventureBtn.addEventListener('click', () => {
  alert('You clicked "Find your next adventure". Implement your logic here!');
});
backHomeBtn.addEventListener('click', () => {
  searchResult.style.opacity = '0';
  goToHome();
});

function goToSearch() {
  homeContainer.style.display   = 'none';
  searchContainer.style.display = 'block';
  searchResult.innerHTML        = '';
  searchInput.value             = '';
  searchLegend.style.display    = 'block';
  if (autoPageInterval) clearInterval(autoPageInterval);
  if (inactivityTimer) clearTimeout(inactivityTimer);
}

function goToHome() {
  searchContainer.style.display = 'none';
  homeContainer.style.display   = 'block';
  searchResult.innerHTML        = '';
  searchInput.value             = '';
  if (inactivityTimer) clearTimeout(inactivityTimer);
  currentPage = 1;
  renderTable();
}

searchButton.addEventListener('click', () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  searchLegend.style.display    = 'none';
  searchResult.style.opacity    = '1';

  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    goToHome();
    return;
  }

  let record = todaysRecords.find(item => item.id.toLowerCase() === query)
            || tomorrowsRecords.find(item => item.id.toLowerCase() === query);

  inactivityTimer = setTimeout(goToHome, 20000);

  if (record) {
    searchResult.innerHTML = `
      <div class="bktableqrresultados">
        <p class="titulo_result"><strong>We got you, here is your transfer</strong></p>
        <table class="transfer-result-table">
          <thead>
            <tr>
              <th>Booking No.</th>
              <th>Flight No.</th>
              <th>Hotel</th>
              <th>Pick-Up time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${record.id}</td>
              <td>${record.Flight}</td>
              <td>${record.HotelName}</td>
              <td>${record.Time}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else {
    searchResult.innerHTML = `
      <div class="bktableqr">
        <p class="error-text">
          If you have any questions about your pickup transfer time, please reach out to your Royalton Excursion Rep at the hospitality desk. You can also contact us easily via chat on the NexusTours App or by calling +52 998 251 6559<br>
          We're here to assist you!
        </p>
        <div class="qr-container">
          <img src="https://miguelgrhub.github.io/Dyspl/Qr.jpeg" alt="QR Code">
        </div>
      </div>
    `;
  }
});
