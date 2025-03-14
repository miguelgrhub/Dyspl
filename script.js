// ==================== Variables globales ====================
let records = [];              // Aquí se guardan todos los registros del JSON
let currentPage = 1;           // Página actual
const itemsPerPage = 15;       // Ajusta cuántos registros mostrar por página
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
  
  // Construir tabla HTML con backticks
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
  
  // Información de la página actual (opcional)
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
      // Al llegar a la última página, se muestra el video
      clearInterval(autoPageInterval);
      autoPageInterval = null;
      showVideo();
      return;
    }
    renderTable();
  }, 10000); // Cada 10 segundos
}

// ==================== Mostrar video desde YouTube ====================
function showVideo() {
  // Limpiar el contenedor de la tabla
  tableContainer.innerHTML = '';
  
  // Crear el elemento iframe para YouTube
  let iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/U9gKV7tz2I8?autoplay=1&mute=1&controls=0&modestbranding=1';
  iframe.width = '100%';
  iframe.height = '400'; // Ajusta la altura según tu diseño
  iframe.frameBorder = '0';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  
  tableContainer.appendChild(iframe);
  
  // Configurar un temporizador de 5 minutos (300,000 ms)
  let videoTimer = setTimeout(() => {
    tableContainer.removeChild(iframe);
    currentPage = 1;
    renderTable();
  }, 300000);
  
  // Nota: Para iframes de YouTube es complejo detectar el final sin la API; usamos el temporizador.
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
  homeContainer.style.display = 'none';
  searchContainer.style.display = 'block';
  searchResult.innerHTML = '';
  searchInput.value = '';
  
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
  
    inactivityTimer = setTimeout(() => {
      goToHome();
    }, 20000);
  } else {
    searchResult.innerHTML = `<p style="color:red;">No se encontró ningún registro con ese ID.</p>`;
  }
});
