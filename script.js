document.getElementById('search-button').addEventListener('click', async () => {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  const resultDiv = document.getElementById('result');

  try {
    const response = await fetch('data.json');
    const data = await response.json();
    const records = data.template.content;

    // Busca el registro que coincida con el parámetro 'id'
    const record = records.find(item => item.id.toLowerCase() === query);

    if (record) {
      // Muestra el resultado con un diseño de tarjeta
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

          <!-- Fila con los valores del registro -->
          <div class="transfer-row transfer-values">
            <div class="transfer-cell">${record.id}</div>
            <div class="transfer-cell">${record.flight_number}</div>
            <div class="transfer-cell">${record.airline}</div>
            <div class="transfer-cell">${record.transfer_pickup_time}</div>
          </div>
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
