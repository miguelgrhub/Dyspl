// Referencias a elementos
const searchButton = document.getElementById('search-button');
const backButton = document.getElementById('back-button');
const instructions = document.querySelector('.search-instructions');
const resultDiv = document.getElementById('result');

// Evento para el botón de búsqueda
searchButton.addEventListener('click', async () => {
  const query = document.getElementById('search-input').value.trim().toLowerCase();

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

      // Cambia el fondo a blanco, el texto a gris/negro
      document.body.style.backgroundColor = '#fff';
      document.body.style.color = '#333';

      // Oculta las instrucciones
      instructions.style.display = 'none';

      // Muestra el botón de volver
      backButton.style.display = 'block';

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
  // Restaurar el fondo oscuro y texto blanco
  document.body.style.backgroundColor = '#333';
  document.body.style.color = '#fff';

  // Volver a mostrar las instrucciones
  instructions.style.display = 'block';

  // Limpiar el resultado
  resultDiv.innerHTML = '';

  // Ocultar el botón de volver
  backButton.style.display = 'none';
});
