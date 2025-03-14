// ==================== Variables globales ====================
let records = [];              // Aquí se guardan todos los registros del JSON
let currentPage = 1;           // Página actual
const itemsPerPage = 15;       // Cantidad de registros por "página" (ajústalo según necesites)
let totalPages = 1;            // Se calculará al cargar los registros
let autoPageInterval = null;   // Intervalo para auto-cambiar de página cada 10 segundos

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
    renderTable(); // Renderiza la tabla en la pantalla inicial
  } catch (error) {
    console.error('Error al cargar data.json:', error);
    tableContainer.innerHTML = `<p style="color:red;text-align:center;">Error loading data.</p>`;
  }
});

// ==================== Renderizar tabla con auto-paginación ====================
function renderTable() {
  // Limpiar cualquier intervalo previo de auto-paginación
  if (autoPageInterval) {
    clearInterval(autoPageInterval);
    autoPageInterval = null;
  }

  // Calcular índices de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageRecords = records.slice(startIndex, endIndex);

  // Construir el HTML de la tabla
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

  // Mostrar en el contenedor de la tabla
  tableContainer.innerHTML = tableHTML + pageInfoHTML;

  // Si hay más de una página, iniciar el auto-cambio cada 10 segundos
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

// ==================== Mostrar video al finalizar la paginación ====================
function showVideo() {
  // Limpiar el contenedor de la tabla
  tableContainer.innerHTML = '';

  // Crear el elemento de video
  let video = document.createElement('video');
  // Usar la URL directa de Google Drive (o el enlace que decidas)
  video.src = 'https://drive.google.com/uc?export=download&id=1A0l3g_cScCYA9oJjgT2ThBcgPkAWn5AD';
  video.autoplay = true;
  video.controls = false;
  video.style.width = '100%';
  video.style.borderRadius = '20px';
  tableContainer.appendChild(video);

  // Temporizador de 5 minutos (300,000 ms)
  let videoTimer = setTimeout(() => {
    video.pause();
    tableContainer.removeChild(video);
    currentPage = 1;
    renderTable();
  }, 300000);

  // Si el video termina antes, limpiar el temporizador y regresar al Home
  video.addEventListener('ended', () => {
    clearTimeout(videoTimer);
    tableContainer.removeChild(video);
    currentPage = 1;
    renderTable();
  });
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
  // Ocultar Home y detener auto-paginación
  homeContainer.style.display = 'none';
  searchContainer.style.display = 'block';

  // Limpiar resultados e input
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
  // Ocultar la pantalla de búsqueda y mostrar Home
  searchContainer.style.display = 'none';
  homeContainer.style.display = 'block';

  // Limpiar input y resultados de búsqueda
  searchResult.innerHTML = '';
  searchInput.value = '';

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  // Reiniciar la tabla (esto reinicia la auto-paginación)
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
    // Mostrar el resultado en formato de tabla
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

    // Temporizador de 20 segundos para volver al Home si no hay interacción
    inactivityTimer = setTimeout(() => {
      goToHome();
    }, 20000);
  } else {
    searchResult.innerHTML = `<p style="color:red;">No se encontró ningún registro con ese ID.</p>`;
  }
});
