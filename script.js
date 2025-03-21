// ==================== Variables globales ====================
let records = [];              // Aquí se guardan todos los registros del JSON
let currentPage = 1;           // Página actual
const itemsPerPage = 15;       // Cantidad de registros por "página"
let totalPages = 1;            // Se calculará al cargar
let autoPageInterval = null;   // Intervalo para auto-cambiar de página cada 10s
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

// ==================== Cargar data.json ====================
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    records = data.template.content || [];
    totalPages = Math.ceil(records.length / itemsPerPage);
    renderTable(); // Renderiza la tabla inicial
  } catch (error) {
    console.error('Error al cargar data.json:', error);
    tableContainer.innerHTML = `<p style="color:red;text-align:center;">Error loading data.</p>`;
  }
});

// ==================== Renderizar tabla con paginación auto ====================
function renderTable() {
  // Limpiar cualquier intervalo previo
  if (autoPageInterval) {
    clearInterval(autoPageInterval);
    autoPageInterval = null;
  }
  
  // Calcular índices de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageRecords = records.slice(startIndex, endIndex);
  
  // Construir tabla HTML
  let tableHTML = `
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
  `;
  
  // Información de la página actual
  let pageInfoHTML = '';
  if (totalPages > 1) {
    pageInfoHTML = `<div class="auto-page-info">Page ${currentPage} of ${totalPages}</div>`;
  }
  
  // Mostrar en el contenedor
  tableContainer.innerHTML = tableHTML + pageInfoHTML;
  
  // Si hay más de una página, iniciar el auto-cambio cada 10s
  if (totalPages > 1) {
    startAutoPagination();
  }
}

// ==================== Auto-paginación cada 10 segundos ====================
function startAutoPagination() {
  autoPageInterval = setInterval(() => {
    currentPage++;
    if (currentPage > totalPages) {
      // Reiniciar a la primera página
      currentPage = 1;
    }
    renderTable();
  }, 10000); // Cada 10 segundos
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
  searchResult.style.background = 'transparent';
  searchResult.style.border = 'none';
  searchResult.style.boxShadow = 'none';
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
  
  // Detener temporizadores de inactividad
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
  
  // Ocultar la leyenda cuando se hace clic en "Buscar"
  searchLegend.style.display = 'none';
  
  const query = searchInput.value.trim().toLowerCase();
  
  // Si el campo está vacío, regresar inmediatamente al Home
  if (!query) {
    goToHome();
    return;
  }
  
  const record = records.find(item => item.id.toLowerCase() === query);
  
  // Iniciar temporizador de 20s para volver al Home
  inactivityTimer = setTimeout(() => {
    goToHome();
  }, 20000);
  
  if (record) {
      // Cambiar estilos para el caso positivo
    searchResult.style.background = '#FFF';
    searchResult.style.border = '2px solid #D0DFDF';
    searchResult.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    searchResult.innerHTML = `
      <p><strong>We got you, here is your transfer</strong></p>
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
          <tr>
            <td>${record.id}</td>
            <td>${record.Flight}</td>
            <td>${record.HotelName}</td>
            <td>${record.Time}</td>
          </tr>
        </tbody>
      </table>
    `;
  } else {
      // Restaurar estilos por defecto para el caso negativo
      searchResult.style.background = 'transparent';
      searchResult.style.border = 'none';
      searchResult.style.boxShadow = 'none';
      searchResult.innerHTML = `
      <p class="error-text">
        Remember that your transfer ID is included in your reservation voucher. You can also contact us easily via chat on the NexusTours App or by calling +52 998 251 6559<br>
        We're here to assist you!
      </p>
      <div class="qr-container">
        <img src="https://miguelgrhub.github.io/Dyspl/Qr.jpeg" alt="QR Code">
      </div>
    `;
  }
});
