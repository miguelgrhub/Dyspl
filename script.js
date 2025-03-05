document.getElementById('search-button').addEventListener('click', async () => {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  const resultDiv = document.getElementById('result');

  try {
    // Cargamos el archivo data.json
    const response = await fetch('data.json');
    const data = await response.json();

    // Accedemos al arreglo de registros dentro de la propiedad 'content'
    const records = data.template.content;

    // Buscamos el registro que coincida con el parámetro 'id'
    const record = records.find(item => item.id.toLowerCase() === query);

    if (record) {
      // Mostramos la información formateada en JSON
      resultDiv.innerHTML = `<pre>${JSON.stringify(record, null, 2)}</pre>`;
    } else {
      resultDiv.innerHTML = 'No se encontró ningún registro con ese ID.';
    }
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    resultDiv.innerHTML = 'Error al cargar los datos.';
  }
});
