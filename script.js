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
const homeContainer = document.getElementById('home-container');
const searchContainer = document.getElementById('search-container');
const tableContainer = document.getElementById('table-container');
const searchTransferBtn = document.getElementById('search-transfer-btn');
const adventureBtn = document.getElementById('adventure-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResult = document.getElementById('search-result');
const searchLegend = document.getElementById('search-legend');
const mainTitle = document.getElementById('main-title');

// ==================== Cargar ambos JSON ====================
window.addEventListener('DOMContentLoaded', async () => {
  console.log('📌 DOMContentLoaded: empezando carga de datos');
  try {
    console.log('🔄 Haciendo fetch de data.json y data_2.json en paralelo');
    const [todayResp, tomorrowResp] = await Promise.all([
      fetch('data.json'),
      fetch('data_2.json')
    ]);

    console.log('todayResp:', todayResp);
    console.log('tomorrowResp:', tomorrowResp);
    if (!todayResp.ok) throw new Error(`Fetch failed for data.json: ${todayResp.status} ${todayResp.statusText}`);
    if (!tomorrowResp.ok) throw new Error(`Fetch failed for data_2.json: ${tomorrowResp.status} ${tomorrowResp.statusText}`);

    console.log('✅ Ambos fetch OK, parseando JSON…');
    const todayData = await todayResp.json();
    const tomorrowData = await tomorrowResp.json();

    console.log('todayData:', todayData);
    console.log('tomorrowData:', tomorrowData);

    const todaysRecords = todayData.template?.content || [];
    const tomorrowsRecords = tomorrowData.template?.content || [];

    console.log('Número de registros de hoy:', todaysRecords.length);
    console.log('Número de registros de mañana:', tomorrowsRecords.length);

    // Empezamos mostrando los registros de hoy
    currentDataset = "today";
    currentRecords = todaysRecords;
    totalPages = Math.ceil(currentRecords.length / itemsPerPage);
    console.log(`Total pages calculadas: ${totalPages}`);

    updateTitle();
    renderTable();
  } catch (error) {
    console.error('🔥 Error al cargar o procesar los datos:', error);
    console.error(error.stack);
    const tableContainer = document.getElementById('table-container'); // asegúrate de que este ID exista
    if (tableContainer) {
      tableContainer.innerHTML = `<p style="color:red;text-align:center;">Error loading data.</p>`;
    }
  }
});


// ==================== Actualizar título según dataset ====================
function updateTitle() {
  if (currentDataset === "today") {
    mainTitle.innerText = "TODAY’S PICK-UP AIRPORT TRANSFERS";
  } else {
    mainTitle.innerText = "TOMORROW’S PICK-UP AIRPORT TRANSFERS";
  }
}

// ==================== Renderizar tabla con paginación auto ====================
function renderTable() {
  // Limpiar cualquier intervalo previo
  if (autoPageInterval) {
    clearInterval(autoPageInterval);
    autoPageInterval = null;
  }
  
  // Asegurarse de que currentRecords esté actualizado según el dataset actual
  currentRecords = (currentDataset === "today") ? todaysRecords : tomorrowsRecords;
  totalPages = Math.ceil(currentRecords.length / itemsPerPage);
  
  // Calcular índices de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageRecords = currentRecords.slice(startIndex, endIndex);
  
  // Construir tabla HTML
  let tableHTML = `
    <div class = "bktable"><table>
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
    </table></div>
  `;
  
  // Información de la página actual
  let pageInfoHTML = '';
  if (totalPages > 1) {
    pageInfoHTML = `<div class="auto-page-info">Page ${currentPage} of ${totalPages}</div>`;
  }
  
  tableContainer.innerHTML = tableHTML + pageInfoHTML;
  
  // Si hay más de una página, iniciar auto-paginación
  if (totalPages > 1) {
    startAutoPagination();
  }
}

// ==================== Auto-paginación cada 10 segundos ====================
function startAutoPagination() {
  autoPageInterval = setInterval(() => {
    currentPage++;
    if (currentPage > totalPages) {
      // Cambiar al otro dataset y reiniciar la página
      currentDataset = (currentDataset === "today") ? "tomorrow" : "today";
      updateTitle();
      currentPage = 1;
    }
    renderTable();
  }, 10000);
}

// ==================== Navegar: Home → Search ====================
searchTransferBtn.addEventListener('click', () => {
  goToSearch();
});

// (Opcional) Botón “Find your next adventure”
adventureBtn.addEventListener('click', () => {
  alert('You clicked "Find your next adventure". Implement your logic here!');
});

// ==================== Navegar: Search → Home (botón Back) ====================
backHomeBtn.addEventListener('click', () => {
  // Restaurar estilos por defecto para el caso negativo
  //searchResult.style.background = 'transparent';
  //searchResult.style.border = 'none';
  //searchResult.style.boxShadow = 'none';
    searchResult.style.opacity = '0';
  goToHome();
});

// ==================== Ir a la pantalla de Búsqueda ====================
function goToSearch() {
  homeContainer.style.display = 'none';
  searchContainer.style.display = 'block';
  searchResult.innerHTML = '';
  searchInput.value = '';
  
  // Mostrar la leyenda al entrar
  searchLegend.style.display = 'block';
  
  // Detener la auto-paginación y temporizadores
  if (autoPageInterval) {
    clearInterval(autoPageInterval);
    autoPageInterval = null;
  }
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

// ==================== Volver a la pantalla Home ====================
function goToHome() {
  searchContainer.style.display = 'none';
  homeContainer.style.display = 'block';
  searchResult.innerHTML = '';
  searchInput.value = '';
  
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  currentPage = 1;
  renderTable();
}

// ==================== Búsqueda por ID en la pantalla Search ====================
searchButton.addEventListener('click', () => {
  // Limpiar cualquier temporizador previo
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  
  // Ocultar la leyenda al hacer clic en "Search"
  searchLegend.style.display = 'none';
  searchResult.style.opacity = '1';
  
  const query = searchInput.value.trim().toLowerCase();
  
  // Si el campo está vacío, regresar inmediatamente al Home
  if (!query) {
    goToHome();
    return;
  }
  
  // Buscar en ambos datasets (today y tomorrow) para mayor flexibilidad
  let record = todaysRecords.find(item => item.id.toLowerCase() === query);
  if (!record) {
    record = tomorrowsRecords.find(item => item.id.toLowerCase() === query);
  }
  
  // Iniciar temporizador de 20s para volver al Home
  inactivityTimer = setTimeout(() => {
    goToHome();
  }, 20000);
  
  if (record) {
    searchResult.innerHTML = `
      <div class = "bktableqrresultados"><p class="titulo_result"><strong>We got you, here is your transfer</strong></p>
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
      </table></div>
    `;
  } else {
    searchResult.innerHTML = `
      <div class = "bktableqr"><p class="error-text">
        If you have any questions about your pickup transfer time, please reach out to your Royalton Excursion Rep at the hospitality desk. You can also contact us easily via chat on the NexusTours App or by calling +52 998 251 6559<br>
        We're here to assist you!
      </p>
      <div class="qr-container">
        <img src="https://miguelgrhub.github.io/Dyspl/Qr.jpeg" alt="QR Code">
      </div></div>
    `;
  }
});
