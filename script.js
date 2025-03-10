/***********************
 * CONFIGURACIONES
 ***********************/
const RECORDS_PER_PAGE = 5;    // Registros por página
const INACTIVITY_TIMEOUT = 20000; // 20 segundos de inactividad en buscador

/***********************
 * ELEMENTOS DEL DOM
 ***********************/
// Pantalla de tabla
const tableContainer = document.getElementById('table-container');
const tableBody = document.getElementById('table-body');
const pageInfo = document.getElementById('page-info');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');

// Botones pantalla inicial
const searchPageBtn = document.getElementById('search-page-btn');
const adventureBtn = document.getElementById('adventure-btn');

// Pantalla de búsqueda
const searchContainer = document.getElementById('search-container');
const backTableBtn = document.getElementById('back-table-btn');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultDiv = document.getElementById('result');
const searchInstructions = document.querySelector('.search-instructions');

/***********************
 * VARIABLES GLOBALES
 ***********************/
let allRecords = [];      // Todos los registros del JSON
let currentPage = 1;      // Página actual en la tabla
let inactivityTimer = null; // Temporizador de inactividad en el buscador

/***********************
 * FUNCIONES PRINCIPALES
 ***********************/

// 1. Cargar datos del JSON y mostrar la tabla inicial
async function loadAndDisplayTable() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    allRecords = data.template.content;

    // Renderizar la tabla en la página 1
    currentPage = 1;
    renderTable();
  } catch (error) {
    console.error('Error al cargar data.json:', error);
  }
}

// 2. Renderizar tabla con paginación
function renderTable() {
  // Limpiar cuerpo de la tabla
  tableBody.innerHTML = '';

  // Calcular índice de inicio y fin
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const pageRecords = allRecords.slice(startIndex, endIndex);

  // Insertar filas
  pageRecords.forEach((record) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${record.id}</td>
      <td>${record.flight_number}</td>
      <td>${record.airline}</td>
      <td>${record.transfer_pickup_time}</td>
    `;
    tableBody.appendChild(tr);
  });

  // Actualizar info de paginación
  const totalPages = Math.ceil(allRecords.length / RECORDS_PER_PAGE);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  // Habilitar/Deshabilitar botones de paginación
  prevPageBtn.disabled = (currentPage === 1);
  nextPageBtn.disabled = (currentPage === totalPages);
}

// 3. Cambiar de página
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(allRecords.length / RECORDS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
}

// 4. Mostrar pantalla de buscador
function showSearchContainer() {
  // Mostrar buscador, ocultar tabla
  tableContainer.style.display = 'none';
  searchContainer.style.display = 'block';

  // Botón de volver visible
  backTableBtn.style.display = 'block';

  // Limpiar resultado y campo
  resultDiv.innerHTML = '';
  searchInput.value = '';

  // Fondo oscuro, texto blanco
  document.body.style.backgroundColor = '#333';
  document.body.style.color = '#fff';

  // Reiniciar temporizador de inactividad
  resetInactivityTimer();
}

// 5. Regresar a pantalla de tabla (inicial)
function showTableContainer() {
  // Ocultar buscador, mostrar tabla
  searchContainer.style.display = 'none';
  tableContainer.style.display = 'block';

  // Fondo oscuro, texto blanco
  document.body.style.backgroundColor = '#333';
  document.body.style.color = '#fff';

  // Limpiar temporizador
  clearInactivityTimer();
}

// 6. Temporizador de inactividad en buscador
function resetInactivityTimer() {
  clearInactivityTimer();
  inactivityTimer = setTimeout(() => {
    // Regresar a la tabla si pasa el tiempo sin interacción
    showTableContainer();
  }, INACTIVITY_TIMEOUT);
}

function clearInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

/***********************
 * EVENTOS
 ***********************/

// Paginación
prevPageBtn.addEventListener('click', () => {
  goToPrevPage();
});
nextPageBtn.addEventListener('click', () => {
  goToNextPage();
});

// Ir a pantalla de búsqueda
searchPageBtn.addEventListener('click', () => {
  showSearchContainer();
});

// Botón "Find your next adventure" (ejemplo)
adventureBtn.addEventListener('click', () => {
  alert('Here you can link to another page or show more info.');
});

// Botón "Volver" en buscador
backTableBtn.addEventListener('click', () => {
  showTableContainer();
});

// Evento de búsqueda
searchButton.addEventListener('click', async () => {
  // Cada vez que se haga clic, reseteamos el timer
  resetInactivityTimer();

  const query = searchInput.value.trim().toLowerCase();
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    const records = data.template.content;

    const record = records.find(item => item.id.toLowerCase() === query);
    if (record) {
      // Mostramos el resultado en modo "tarjeta"
      document.body.style.backgroundColor = '#fff';
      document.body.style.color = '#333';

      searchInstructions.style.display = 'none';

      resultDiv.innerHTML = `
        <div style="background:#fff;color:#333;padding:10px;border-radius:8px;">
          <h3 style="color:#F17121;margin-bottom:10px;">
            Transfer found!
          </h3>
          <p><strong>ID Transfer:</strong> ${record.id}</p>
          <p><strong>No. Vuelo:</strong> ${record.flight_number}</p>
          <p><strong>Aerolínea:</strong> ${record.airline}</p>
          <p><strong>Horario Pick-Up:</strong> ${record.transfer_pickup_time}</p>
        </div>
      `;
    } else {
      resultDiv.innerHTML = 'No se encontró ningún registro con ese ID.';
    }
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    resultDiv.innerHTML = 'Error al cargar los datos.';
  }
});

// Detectar interacciones en buscador para resetear inactividad
searchContainer.addEventListener('mousemove', resetInactivityTimer);
searchContainer.addEventListener('keydown', resetInactivityTimer);
searchContainer.addEventListener('click', resetInactivityTimer);

/***********************
 * INICIO
 ***********************/

// Al cargar la página, mostramos la tabla inicial
loadAndDisplayTable();
