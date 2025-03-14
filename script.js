// ==================== Variables globales ====================
let records = [];              // Aquí guardamos todos los registros del JSON
let currentPage = 1;           // Página actual
const itemsPerPage = 15;        // Ajusta cuántos registros mostrar por página
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

// ==================== Inicio: Cargar data.json ====================
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
          <th>ID Transfer</th>
          <th>No. Vuelo</th>
          <th>Aerolinea</th>
          <th>Horario Pick-Up</th>
        </tr>
      </thead>
      <tbody>
  `;

  pageRecords.forEach(item => {
    tableHTML += `
      <tr>
        <td>${item.id}</td>
        <td>${item.flight_number}</td>
        <td>${item.airline}</td>
        <td>${item.transfer_pickup_time}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  // Indicar la página actual
  let pageInfoHTML = '';
  if (totalPages > 1) {
    pageInfoHTML = `<div class="auto-page-info">Page ${currentPage} of ${totalPages}</div>`;
  }

  // Mostrar en contenedor
  tableContainer.innerHTML = tableHTML + pageInfoHTML;

  // Si hay más de una página, iniciar el cambio automático cada 10s
  if (totalPages > 1) {
    startAutoPagination();
  }
}

// ==================== Auto-paginación cada 10 segundos ====================
function startAutoPagination() {
  autoPageInterval = setInterval(() => {
    currentPage++;
    if (currentPage > totalPages) {
      currentPage = 1;
    }
    renderTable();
  }, 10000); // 10 segundos
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
  goToHome();
});

// ==================== Ir a la pantalla de Búsqueda ====================
function goToSearch() {
  // Ocultar Home
  homeContainer.style.display = 'none';
  // Mostrar pantalla de búsqueda
  searchContainer.style.display = 'block';

  // Limpiar resultados anteriores
  searchResult.innerHTML = '';
  searchInput.value = '';

  // Limpiar auto-paginación (no queremos que siga cambiando páginas en Home)
  if (autoPageInterval) {
    clearInterval(autoPageInterval);
    autoPageInterval = null;
  }

  // Limpiar inactividad si hubiera
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

// ==================== Volver a la pantalla de Home ====================
function goToHome() {
  // Ocultar pantalla de búsqueda
  searchContainer.style.display = 'none';
  // Mostrar Home
  homeContainer.style.display = 'block';

  // Limpiar el resultado y el input
  searchResult.innerHTML = '';
  searchInput.value = '';

  // Limpiar inactividad
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  // Volver a renderizar la tabla (reinicia la auto-paginación)
  renderTable();
}

// ==================== Búsqueda por ID en la pantalla Search ====================
searchButton.addEventListener('click', () => {
  // Limpiar timer anterior (si el usuario hace más de una búsqueda)
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    searchResult.innerHTML = `<p style="color:red;">Please enter an ID.</p>`;
    return;
  }

  const record = records.find(item => item.id.toLowerCase() === query);

  if (record) {
    // Muestra el resultado en formato de tabla
    searchResult.innerHTML = `
      <p><strong>Transfer found!</strong></p>
      <table class="transfer-result-table">
        <thead>
          <tr>
            <th>ID Transfer</th>
            <th>No. Vuelo</th>
            <th>Aerolinea</th>
            <th>Horario Pick-Up</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${record.id}</td>
            <td>${record.flight_number}</td>
            <td>${record.airline}</td>
            <td>${record.transfer_pickup_time}</td>
          </tr>
        </tbody>
      </table>
    `;

    // Inicia el temporizador de 20s para volver al Home si no hay interacción
    inactivityTimer = setTimeout(() => {
      goToHome();
    }, 20000);

  } else {
    searchResult.innerHTML = `<p style="color:red;">No se encontró ningún registro con ese ID.</p>`;
  }
});
