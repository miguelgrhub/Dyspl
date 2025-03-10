// Referencias a elementos
const searchButton = document.getElementById('search-button');
const backButton = document.getElementById('back-button');
const instructions = document.querySelector('.search-instructions');
const resultDiv = document.getElementById('result');
const searchInput = document.getElementById('search-input');

let inactivityTimer = null; // Variable global para el temporizador

// Evento para el botón de búsqueda
searchButton.addEventListener('click', async () => {
  // Limpiar cualquier temporizador existente
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  const query = searchInput.value.trim().toLowerCase();

  try {
    const response = await fetch('data.json');
    const data = await response.json();
    const records = data.template.content;

    // Busca el registro por ID (en minúsculas)
    const record = records.find(item => item.id.toLowerCase() === query);

    if (record) {
      // Muestra la tarjeta con el resultado
      resultDiv.innerHTML = `
        <div class="transfer-card">
          <!-- Fila de encabezados -->
          <div class="transfer-row transfer-header">
            <div class="transfer-cell">
              <span class="icon">📅</span> ID Transfer
            </div>
            <div class="transfer-cell">
              <span class="icon">✈️</span> Flight number
            </div>
            <div class="transfer-cell">
              <span class="icon">🛩️</span> Airline
            </div>
            <div class="transfer-cell">
              <span class="icon">⏰</span> Pick-up time
            </div>
          </div>
          <!-- Línea divisoria naranja -->
          <div class="divider"></div>
          <!-- Fila con los valores -->
          <div class="transfer-row transfer-values">
            <div class="transfer-cell">${record.id}</div>
            <div class="transfer-cell">${record.flight_number}</div>
            <div class="transfer-cell">${record.airline}</div>
            <div class="transfer-cell">${record.transfer_pickup_time}</div>
          </div>
        </div>
      `;

      // Cambia el fondo a blanco y el texto a gris/negro
      document.body.style.backgroundColor = '#fff';
      document.body.style.color = '#333';

      // Oculta las instrucciones y muestra el botón de volver
      instructions.style.display = 'none';
      backButton.style.display = 'block';

      // Inicia un temporizador para volver al estado inicial después de 20 segundos de inactividad
      inactivityTimer = setTimeout(() => {
        backButton.click();
      }, 20000);
    } else {
      resultDiv.innerHTML = 'No se encontró ningún registro con ese ID.';
    }
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    resultDiv.innerHTML = 'Error al cargar los datos.';
  }
});

// Evento para el botón de volver
backButton.addEventListener('click', () => {
  // Limpia el temporizador si existe
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  // Restaurar el fondo oscuro y texto blanco
  document.body.style.backgroundColor = '#333';
  document.body.style.color = '#fff';

  // Volver a mostrar las instrucciones
  instructions.style.display = 'block';

  // Limpiar el resultado y el campo de búsqueda
  resultDiv.innerHTML = '';
  searchInput.value = '';

  // Ocultar el botón de volver
  backButton.style.display = 'none';
});
