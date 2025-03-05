document.getElementById('search-button').addEventListener('click', async () => {
  const query = document.getElementById('search-input').value.trim();
  const resultDiv = document.getElementById('result');

  try {
    const response = await fetch('data.json');
    const data = await response.json();

    // Se asume que 'data' es un arreglo de objetos, y que cada objeto tiene un campo 'parametro'
    const record = data.find(item => item.parametro === query);

    if (record) {
      // Mostrar la información del registro formateada
      resultDiv.innerHTML = `<pre>${JSON.stringify(record, null, 2)}</pre>`;
    } else {
      resultDiv.innerHTML = 'No se encontró ningún registro con ese parámetro.';
    }
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    resultDiv.innerHTML = 'Error al cargar los datos.';
  }
});

